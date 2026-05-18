import '../styles/Events.css';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { db } from '../services/firebaseConfig';
import { collection, doc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

import VoltarButton from '../components/VoltarButton';
import EventoItem from '../components/EventoItem';

function Events() {

    const [allEventos, setAllEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {

        const carregarDados = async () => {
            try {
                setLoading(true);
                const userLogado = auth.currentUser;
                const uid = userLogado ? userLogado.uid : null;

                const [eventosSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'eventos')),
                    uid ? getDoc(doc(db, 'users', uid)) : null
                ]);

                if (usersSnap && usersSnap.exists()) {
                    const perfilUsuario = usersSnap.data().perfil;
                    setIsAdmin(perfilUsuario === 'admin' || perfilUsuario === 'coordenador');
                }

                const listaEventos = eventosSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setAllEventos(listaEventos);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarDados();

    }, [auth.currentUser]);

    const handleAcessoEvento = async (eventId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            const presencaId = `${userId}_${eventId}`;
            const presencaRef = doc(db, "presencas", presencaId);
            const docSnap = await getDoc(presencaRef);

            if (docSnap.exists()) {
                navigate(`/check-in/${eventId}`);
            } else {
                navigate(`/event-register/${eventId}`);
            }
        } catch (error) {
            console.error("Erro ao validar fluxo de navegação:", error);
        }
    };

    const handleDeletarEvento = async (e, eventId) => {
    e.stopPropagation();

    const confirmar = window.confirm("Tem certeza que deseja excluir permanentemente este evento?");
    if (!confirmar) return;

    try {
        await deleteDoc(doc(db, 'eventos', eventId));

        setAllEventos((eventosAtuais) => eventosAtuais.filter(evento => evento.id !== eventId));

        alert("Evento excluído com sucesso!");
    } catch (error) {
        console.error("Erro ao deletar evento:", error);
        alert("Erro ao tentar excluir o evento.");
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
        <div className="events-container">
            <VoltarButton />
            <div className="events-header-container">
                <h2 className="events-title">Todos os Eventos</h2>
                {isAdmin && (
                    <button
                        className="btn-create-event"
                        onClick={() => navigate('/new-event')}
                    >
                        + Criar Novo Evento
                    </button>
                )}
            </div>
            <div className="events-list-page">
                {allEventos.map(e => (
                    <div
                        key={e.id}
                        onClick={() => handleAcessoEvento(e.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <EventoItem
                            image={e.image}
                            alt={e.eventName}
                            eventName={e.eventName}
                            local={e.local}
                            dateTime={e.dateTime}
                            status={e.status}
                            timer={e.timer}
                            isAdmin={isAdmin}
                            onEdit={() => navigate(`/event-edit/${e.id}`)}
                            onDelete={(event) => handleDeletarEvento(event, e.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )

}

export default Events;