import '../styles/Events.css';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { db } from '../services/firebaseConfig';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import VoltarButton from '../components/VoltarButton';
import EventoItem from '../components/EventoItem';

function Events() {

    const [allEventos, setAllEventos] = useState([]);

    useEffect(() => {

        const carregarDados = async () => {
            try {
                const [eventosSnap] = await Promise.all([
                    getDocs(collection(db, 'eventos')),
                ]);

                const listaEventos = eventosSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setAllEventos(listaEventos);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        carregarDados();

    }, []);

    return (
        <div className="events-container">
            <VoltarButton />
            <div className="header-container">
                <h2 className="events-title">Todos os Eventos</h2>
            </div>
            <div className="events-list-page">
                {allEventos.map(e => (
                    <Link to={`/check-in/${e.id}`} key={e.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <EventoItem
                            image={e.image}
                            alt={e.eventName}
                            eventName={e.eventName}
                            local={e.local}
                            dateTime={e.dateTime}
                            status={e.status}
                            timer={e.timer}
                        />
                    </Link>
                ))}
            </div>
        </div>
    )

}

export default Events;