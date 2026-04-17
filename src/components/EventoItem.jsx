import '../styles/Home.css';

import { useState, useEffect } from 'react';

function EventoItem({ image, eventName, local, dateTime, status, timer }) {
    const [tempoRestante, setTempoRestante] = useState("00:00");
    const [statusLabel, setStatusLabel] = useState("Carregando...");

    useEffect(() => {
        if (!timer) {
            console.log("Campo timer não encontrado!");
            return;
        }

        const inicio = timer.toDate ? timer.toDate().getTime() : new Date(timer).getTime();
        const limite = inicio + (15 * 60 * 1000);

        const atualizarCronometro = () => {
            const agora = new Date().getTime();

            if (agora < inicio) {
                const dif = inicio - agora;
                const min = Math.floor((dif % (1000 * 60 * 60)) / (1000 * 60));
                const seg = Math.floor((dif % (1000 * 60)) / 1000);
                setStatusLabel("Abre em:");
                setTempoRestante(`${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`);
            } else if (agora >= inicio && agora <= limite) {
                const dif = limite - agora;
                const min = Math.floor((dif % (1000 * 60 * 60)) / (1000 * 60));
                const seg = Math.floor((dif % (1000 * 60)) / 1000);
                setStatusLabel("Tempo restante:");
                setTempoRestante(`${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`);
            } else {
                setStatusLabel("Encerrado");
                setTempoRestante("00:00");
                return true;
            }
            return false;
        };

        atualizarCronometro();

        const interval = setInterval(() => {
            const parou = atualizarCronometro();
            if (parou) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const formatarData = (data) => {
        if (!data) return "Data não disponível";

        const dateObj = data.toDate ? data.toDate() : new Date(data);

        return dateObj.toLocaleDateString('pt-BR', {
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
    )
}

export default EventoItem;