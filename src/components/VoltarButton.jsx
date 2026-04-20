import '../styles/Profile.css';

import { useNavigate } from 'react-router-dom';

import voltarIcon from '../assets/icons/seta-esquerda.png';

function VoltarButton() {
    const navigate = useNavigate();
    
    return (
        <div className="btn-voltar-container" onClick={() => navigate(-1)}>
            <img src={voltarIcon} alt="Voltar" className="icon-voltar" />
            <span>Voltar</span>
        </div>
    );
}

export default VoltarButton;