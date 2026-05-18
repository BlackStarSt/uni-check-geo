import '../styles/EditEvent.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebaseConfig';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import VoltarButton from '../components/VoltarButton';

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const auth = getAuth();

    const [user, setUser] = useState('');
    const [curso, setCurso] = useState('');
    const [matricula, setMatricula] = useState('');
    const [email, setEmail] = useState('');
    const [matriculaOriginal, setMatriculaOriginal] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autorizado, setAutorizado] = useState(false);

    useEffect(() => {
        const verificarPermissaoEBuscarUsuario = async () => {
            try {
                setLoading(true);
                const userLogado = auth.currentUser;

                if (!userLogado) {
                    alert("Acesso negado. Faça login primeiro.");
                    navigate('/login');
                    return;
                }

                const adminSnap = await getDoc(doc(db, 'users', userLogado.uid));
                if (adminSnap.exists()) {
                    const perfilAdmin = adminSnap.data().perfil;
                    if (perfilAdmin !== 'admin' && perfilAdmin !== 'coordenador') {
                        alert("Você não tem permissão para acessar esta página.");
                        navigate('/home');
                        return;
                    }
                    setAutorizado(true);
                } else {
                    navigate('/home');
                    return;
                }

                const userRef = doc(db, 'users', id);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const dados = userSnap.data();
                    setUser(dados.user || '');
                    setCurso(dados.curso || '');
                    setMatricula(dados.matricula || '');
                    setMatriculaOriginal(dados.matricula || '');
                    setEmail(dados.email || '');
                } else {
                    alert("Usuário não encontrado!");
                    navigate('/users');
                }
            } catch (error) {
                console.error("Erro na verificação/busca:", error);
                alert("Erro ao carregar os dados.");
            } finally {
                setLoading(false);
            }
        };

        verificarPermissaoEBuscarUsuario();
    }, [id, navigate, auth.currentUser]);

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        setSaving(true);

        const apenasNumeros = /^[0-9]+$/;
        if (!apenasNumeros.test(matricula)) {
            alert("A matrícula deve conter apenas números!");
            setSaving(false);
            return;
        }

        try {
            if (matricula !== matriculaOriginal) {
                const usuariosRef = collection(db, 'users');
                const q = query(usuariosRef, where("matricula", "==", matricula));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    alert("Esta matrícula já está vinculada a outro usuário!");
                    setSaving(false);
                    return;
                }
            }

            const userRef = doc(db, 'users', id);
            await updateDoc(userRef, {
                user: user,
                curso: curso,
                matricula: matricula
            });

            alert("Dados do usuário atualizados com sucesso!");
            navigate('/users');
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            alert("Erro ao salvar as alterações: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader-visual">
                    <div className="dot"></div>
                    <div className="outline"></div>
                </div>
                <p className="loading-text">Buscando dados do usuário...</p>
            </div>
        );
    }

    if (!autorizado) return null;

    return (
        <div className="edit-event-container">
            <VoltarButton />
            <h2 className="events-title">Editar Usuário</h2>

            <form onSubmit={handleSalvarEdicao} className="edit-event-form">
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', textAlign: 'center' }}>
                    Alterando o perfil de: <strong>{user}</strong>
                </p>
                <div className="form-group">
                    <label>Nome Completo</label>
                    <input
                        type="text"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setCurso(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Curso</label>
                    <input
                        type="text"
                        value={curso}
                        onChange={(e) => setCurso(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Matrícula (Apenas números)</label>
                    <input
                        type="text"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn-save-event" disabled={saving}>
                    {saving ? "Salvando alterações..." : "Salvar Alterações"}
                </button>
            </form>
        </div>
    );
}

export default EditUser;