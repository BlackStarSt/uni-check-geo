import '../styles/Login.css';

import LogoImg from '../assets/logo_horiz.jpg';

import InputLogin from '../components/InputLogin.jsx';

function Login() {
    const handleLogin = (e) => {
        e.preventDefault();
        alert("Login clicado!");
    };

    return (
        <div className="login-container">
            <div className="fig-container">
                <div className="login-fig-1"></div>
                <div className="login-fig-2"></div>
            </div>
            <form onSubmit={handleLogin}>
                <img src={LogoImg} className='logo-img' />
                <InputLogin type="text" placeholder="Matrícula" />
                <InputLogin type="password" placeholder="Senha" />

                <button type="submit" className="btn-login">
                    Entrar
                </button>
            </form>
            <div className="fig-container">
                <div className="login-fig-2"></div>
                <div className="login-fig-1"></div>
            </div>
        </div>
    );
}

export default Login;