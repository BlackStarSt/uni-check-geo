import '../styles/EditEventAndUser.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import VoltarButton from '../components/VoltarButton';

function NewUser() {
    const [user, setUser] = useState('');
    const [curso, setCurso] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [matricula, setMatricula] = useState('');
    const [perfil, setPerfil] = useState('aluno');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleCadastro = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const emailAdmin = auth.currentUser?.email;
            const senhaAdmin = window.prompt("Para confirmar a criação, digite a SUA senha de Administrador/Coordenador:");

            if (!senhaAdmin) {
                alert("Operação cancelada. A senha do administrador é necessária.");
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const usuarioAuth = userCredential.user;

            await setDoc(doc(db, 'users', usuarioAuth.uid), {
                user: user,
                curso: curso,
                email: email,
                matricula: matricula,
                perfil: perfil,
                userPhoto: "",
                createdAt: new Date()
            });

            await signInWithEmailAndPassword(auth, emailAdmin, senhaAdmin);

            alert("Conta criada com sucesso! Você continua logado como administrador.");
            navigate('/users');
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert("Erro ao criar conta: " + error.message);
        } finally {
            setLoading(false);
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

    return (
        <div className="edit-event-container">
            <div className="edit-event-header-container">
                <div className="edit-event-header-left">
                    <VoltarButton />
                    <h2>Criar Conta</h2>
                </div>
            </div>

            <form onSubmit={handleCadastro} className="edit-event-form">
                <div className="form-group">
                    <label>Nome Completo</label>
                    <input type="text" value={user} onChange={(e) => setUser(e.target.value)} required placeholder="Ex: User de Teste" />
                </div>

                <div className="form-group">
                    <label>Curso</label>
                    <input type="text" value={curso} onChange={(e) => setCurso(e.target.value)} required placeholder="Ex: Medicina" />
                </div>

                <div className="form-group">
                    <label>Matrícula</label>
                    <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} required placeholder="00000000" />
                </div>

                <div className="form-group">
                    <label>E-mail</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="userdeteste@gmail.com" />
                </div>

                <div className="form-group">
                    <label>Senha</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Perfil de Acesso</label>
                    <select
                        value={perfil}
                        onChange={(e) => setPerfil(e.target.value)}
                        className={`select-perfil perfil-${perfil}`}
                        style={{ width: '100%', height: '40px', marginTop: '5px' }}
                    >
                        <option value="aluno">Aluno</option>
                        <option value="coordenador">Coordenador</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <button type="submit" className="btn-save-event" disabled={loading}>
                    {loading ? "Criando conta..." : "Cadastrar"}
                </button>
            </form>
        </div>
    );
}

export default NewUser;