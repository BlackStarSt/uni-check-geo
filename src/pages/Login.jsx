import { useState } from 'react';

import '../styles/Login.css';

import LogoImg from '../assets/logo.png';
import password_icon from '../assets/icons/password_icon.png';
import user_icon from '../assets/icons/user_icon.png';
import perfil_icon from '../assets/icons/perfil_icon.png'

import InputLogin from '../components/InputLogin.jsx';
import SelectLogin from '../components/selectLogin.jsx';

function Login() {
    const handleLogin = (e) => {
        e.preventDefault();
        alert("Login clicado!");
    };

    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState('aluno');

    const opcoesPerfil = [
        { value: 'aluno', label: 'Aluno' },
        { value: 'coordenador', label: 'Coordenador' },
        { value: 'admin', label: 'Admin' }
    ];

    return (
        <div className="login-container">
            <img src={LogoImg} className='logo-img' />
            <div className="login-title">
                <h2 className="title">Bem-vindo à sua</h2>
                <h2 className="title">Universidade</h2>
            </div>
            <form onSubmit={handleLogin}>
                <InputLogin type="text" placeholder="Matrícula Institucional" icon={user_icon} value={matricula} onChange={(e) => setMatricula(e.target.value)}  />
                <InputLogin type="password" placeholder="Senha" icon={password_icon} value={senha} onChange={(e) => setSenha(e.target.value)}  />
                <SelectLogin label="Perfil" id="userPerfil" name="userPerfil" icon={perfil_icon} options={opcoesPerfil} value={perfil} onChange={(e) => setPerfil(e.target.value)} />
                <button type="submit" className="btn-login">
                    Entrar
                </button>
            </form>
            <a href="#" className="login-link"><p>Esqueci minha senha</p></a>
        </div>
    );
}

export default Login;