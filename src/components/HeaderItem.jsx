import { useState } from 'react';
import { Link, replace, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

import '../styles/Home.css';

function HeaderItem({ logo, user, userPhoto }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const currentUser = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/', {replace: true});
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    const formatName = (name) => {
        if (!name) return "Usuário";
        return typeof name === 'string' ? name.split(' ')[0] : "Usuário";
    };

    return (
        <div className="header-itens">
            <div className="user-detail">
                <img src={logo} alt="Logo do App" className="logo" />
                <h2 className="user-name">Olá, {formatName(user)}</h2>
            </div>
            <div className="profile-container" onClick={() => setMenuOpen(!menuOpen)}>
                <img 
                    src={userPhoto} 
                    alt="Perfil" 
                    className="user-profile" 
                />
                {menuOpen && (
                    <div className="dropdown-menu">
                        <Link 
                            to={`/profile/${currentUser?.uid}`} 
                            className="menu-item"
                            onClick={() => setMenuOpen(false)}
                        >
                            Perfil
                        </Link>
                        <button onClick={handleLogout} className="menu-item logout-btn">
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HeaderItem;