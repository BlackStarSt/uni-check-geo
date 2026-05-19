import '../styles/Users.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FiMoreVertical, FiEdit3, FiTrash2 } from 'react-icons/fi';
import VoltarButton from '../components/VoltarButton';

function Users() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autorizado, setAutorizado] = useState(false);
    const [menuAbertoId, setMenuAbertoId] = useState(null);

    const auth = getAuth();
    const navigate = useNavigate();

    const alternarMenu = (e, id) => {
        e.stopPropagation();
        setMenuAbertoId(menuAbertoId === id ? null : id);
    };

    useEffect(() => {
        const fecharMenus = () => setMenuAbertoId(null);
        window.addEventListener('click', fecharMenus);
        return () => window.removeEventListener('click', fecharMenus);
    }, []);

    useEffect(() => {
        const verificarEBuscarUsuarios = async () => {
            try {
                setLoading(true);
                const userLogado = auth.currentUser;

                if (!userLogado) {
                    alert("Acesso negado. Faça login primeiro.");
                    navigate('/login');
                    return;
                }

                const userSnap = await getDoc(doc(db, 'users', userLogado.uid));
                if (userSnap.exists()) {
                    const perfil = userSnap.data().perfil;
                    if (perfil === 'admin' || perfil === 'coordenador') {
                        setAutorizado(true);
                    } else {
                        alert("Você não tem permissão para acessar esta página.");
                        navigate('/home');
                        return;
                    }
                } else {
                    navigate('/home');
                    return;
                }

                const querySnapshot = await getDocs(collection(db, 'users'));
                const listaUsuarios = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setUsuarios(listaUsuarios);
            } catch (error) {
                console.error("Erro ao carregar usuários:", error);
            } finally {
                setLoading(false);
            }
        };

        verificarEBuscarUsuarios();
    }, [auth.currentUser, navigate]);

    const handleMudarPerfil = async (userId, novoPerfil) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { perfil: novoPerfil });
            setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, perfil: novoPerfil } : u));
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
        }
    };

    const handleDeletarUsuario = async (userId) => {
        const confirmar = window.confirm("Tem certeza que deseja remover este usuário permanentemente?");
        if (!confirmar) return;

        try {
            await deleteDoc(doc(db, 'users', userId));
            setUsuarios(prev => prev.filter(u => u.id !== userId));
            alert("Usuário removido com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            alert("Erro ao remover o usuário.");
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader-visual">
                    <div className="dot"></div>
                    <div className="outline"></div>
                </div>
                <p className="loading-text">Carregando...</p>
            </div>
        );
    }

    if (!autorizado) return null;

    return (
        <div className="user-list-container">
            <div className="users-page-header">
                <div className="users-page-top-bar">
                    <VoltarButton />
                </div>
                <div className="users-page-title-box">
                    <h2 className="events-title">Controle de Usuários</h2>
                    <button
                        className="btn-create-event"
                        onClick={() => navigate('/new-user')}
                    >
                        + Adicionar Usuário
                    </button>
                </div>
            </div>

            <div className="user-count-bar">
                Total de usuários cadastrados: <span>{usuarios.length}</span>
            </div>

            <div className="users-scroll-area">
                {usuarios.map(u => (
                    <div key={u.id} className="user-card">
                        <div className="user-info">
                            <h3>{u.user || "Usuário sem Nome"}</h3>
                            <p className="user-email">{u.email || "sem-email@unicheck.com"}</p>
                            {u.matricula && <span className="user-matricula">Matrícula: {u.matricula}</span>}
                        </div>

                        <div className="user-actions">
                            <select
                                value={u.perfil || 'aluno'}
                                onChange={(e) => handleMudarPerfil(u.id, e.target.value)}
                                className={`select-perfil perfil-${u.perfil || 'aluno'}`}
                            >
                                <option value="aluno">Aluno</option>
                                <option value="coordenador">Coordenador</option>
                                <option value="admin">Admin</option>
                            </select>

                            <div className="kebab-menu-container">
                                <button
                                    className="btn-kebab"
                                    onClick={(e) => alternarMenu(e, u.id)}
                                >
                                    ⋮
                                </button>

                                {menuAbertoId === u.id && (
                                    <div className="dropdown-options-menu">
                                        <button
                                            className="dropdown-item"
                                            onClick={() => navigate(`/edit-user/${u.id}`)}
                                        >
                                            <FiEdit3 size={14} /> Editar
                                        </button>
                                        <button
                                            className="dropdown-item delete"
                                            onClick={() => handleDeletarUsuario(u.id)}
                                        >
                                            <FiTrash2 size={14} /> Deletar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Users;