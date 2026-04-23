import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { auth, db } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { query, collection, where, getDocs } from 'firebase/firestore';

import '../styles/Login.css';

import LogoImg from '../assets/logo.png';
import password_icon from '../assets/icons/password_icon.png';
import user_icon from '../assets/icons/user_icon.png';
import perfil_icon from '../assets/icons/perfil_icon.png'

import InputLogin from '../components/InputLogin.jsx';
import SelectLogin from '../components/selectLogin.jsx';

function Login() {
    const navigate = useNavigate();

    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState('aluno');

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const q = query(collection(db, "users"), where("matricula", "==", matricula));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("Matrícula não encontrada.");
                setLoading(false);
                return;
            }

            const userData = querySnapshot.docs[0].data();

            if (userData.perfil !== perfil) {
                alert("Perfil selecionado incorreto para esta matrícula.");
                setLoading(false);
                return;
            }

            await signInWithEmailAndPassword(auth, userData.email, senha);
            navigate('/home');

        } catch (error) {
            console.error("Erro no processo de login:", error.code);
            setLoading(false);

            if (error.code === 'auth/wrong-password') {
                alert("Senha incorreta.");
            } else if (error.code === 'auth/invalid-email') {
                alert("E-mail vinculado à matrícula é inválido.");
            } else {
                alert("Erro ao tentar entrar. Tente novamente mais tarde.");
            }
        } 
    };

    const handleEsqueciSenha = async (e) => {
        e.preventDefault();

        if (!matricula) {
            alert("Por favor, preencha o campo de matrícula para recuperar sua senha.");
            return;
        }

        try {
            const q = query(collection(db, "users"), where("matricula", "==", matricula));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("Matrícula não encontrada no sistema.");
                return;
            }

            const userEmail = querySnapshot.docs[0].data().email;

            await sendPasswordResetEmail(auth, userEmail);

            alert(`Um e-mail de redefinição foi enviado. Verifique sua caixa de entrada.`);

        } catch (error) {
            console.error("Erro ao recuperar senha:", error);
            alert("Ocorreu um erro ao tentar enviar o e-mail de recuperação.");
        }
    };

    const opcoesPerfil = [
        { value: 'aluno', label: 'Aluno' },
        { value: 'coordenador', label: 'Coordenador' },
        { value: 'admin', label: 'Admin' }
    ];

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
        <div className="login-container">
            <img src={LogoImg} className='logo-img' />
            <div className="login-title">
                <h2 className="title">Bem-vindo à sua</h2>
                <h2 className="title">Universidade</h2>
            </div>
            <form onSubmit={handleLogin}>
                <InputLogin type="text" placeholder="Matrícula Institucional" icon={user_icon} value={matricula} onChange={(e) => setMatricula(e.target.value)} />
                <InputLogin type="password" placeholder="Senha" icon={password_icon} value={senha} onChange={(e) => setSenha(e.target.value)} />
                <SelectLogin label="Perfil" id="userPerfil" name="userPerfil" icon={perfil_icon} options={opcoesPerfil} value={perfil} onChange={(e) => setPerfil(e.target.value)} />
                <button type="submit" className="btn-login" disabled={loading}>
                    Entrar
                </button>
            </form>
            <a
                href="#"
                className="login-link"
                onClick={handleEsqueciSenha}
            >
                <p>Esqueci minha senha</p>
            </a>
        </div>
    );
}

export default Login;
