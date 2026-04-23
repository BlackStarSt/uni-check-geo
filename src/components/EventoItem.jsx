import { useState, useEffect } from 'react';
import '../styles/Home.css';

function EventoItem({ image, eventName, local, dateTime }) {
    const [tempoRestante, setTempoRestante] = useState("00:00");
    const [statusLabel, setStatusLabel] = useState("Carregando...");

    useEffect(() => {
        if (!dateTime || typeof dateTime === 'string') {
            setStatusLabel("Agendado");
            setTempoRestante("--:--");
            return;
        }

        const calcularTudo = () => {
            try {
                const agora = new Date().getTime();
                
                const inicio = dateTime.toDate ? dateTime.toDate().getTime() : new Date(dateTime).getTime();
                const limite = inicio + (15 * 60 * 1000);

                if (isNaN(inicio)) return true;

                if (agora < inicio) {
                    const dif = inicio - agora;
                    const min = Math.floor(dif / 60000);
                    const seg = Math.floor((dif % 60000) / 1000);
                    setStatusLabel("Aguardando...");
                    setTempoRestante(`${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`);
                } else if (agora >= inicio && agora <= limite) {
                    const dif = limite - agora;
                    const min = Math.floor(dif / 60000);
                    const seg = Math.floor((dif % 60000) / 1000);
                    setStatusLabel("Aberto");
                    setTempoRestante(`${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`);
                } else {
                    setStatusLabel("Encerrado");
                    setTempoRestante("00:00");
                    return true;
                }
            } catch (error) {
                console.error("Erro no cálculo:", error);
                return true;
            }
            return false;
        };

        const encerrado = calcularTudo();
        if (!encerrado) {
            const interval = setInterval(() => {
                if (calcularTudo()) clearInterval(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [dateTime]);

    const formatarData = (data) => {
        if (!data || typeof data === 'string') return "Horário a definir";
        const d = data.toDate ? data.toDate() : new Date(data);
        return d.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="evento-itens">
            <div className='evento-details'>
                <img src={image} alt={eventName} className="item-img" />
                <div className="evento-description">
                    <h4 className="item-evento-name">{eventName}</h4>
                    <ul className="evento-item-list">
                        <li className="item-list">{local}</li>
                        <li className="item-list">{formatarData(dateTime)}</li>
                    </ul>
                </div>
            </div>
            <div className='evento-btns'>
                <p className={`item-status ${statusLabel.includes("restante") ? "aberto" : ""}`}>
                    {statusLabel}
                </p>
                <p className="item-status">{tempoRestante}</p>
            </div>
        </div>
    );
}

export default EventoItem;