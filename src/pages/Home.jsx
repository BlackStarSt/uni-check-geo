import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { db } from '../services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import '../styles/Home.css';

import Logo from '../assets/logo_alone.png';

import HeaderItem from '../components/HeaderItem';
import DestaqueItem from '../components/DestaqueItem';
import EventoItem from '../components/EventoItem';

function Home() {

    const [user, setUser] = useState(null);
    const [userPhoto, setUserPhoto] = useState(null);

    const [allEventos, setAllEventos] = useState([]);
    const [allDestaques, setAllDestaques] = useState([]);
    const scrollRef = useRef(null);

    // useEffect 01: Buscar o usuário logado
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (usuarioLogado) => {
            if (usuarioLogado) {
                setUser(usuarioLogado.displayName || usuarioLogado.email.split('@')[0]);
                setUserPhoto(usuarioLogado.photoURL);
            } else {
                setUser("Visitante");
                setUserPhoto(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // useEffect 02: Buscar os dados (Eventos e Destaques)
    useEffect(() => {

        const carregarDados = async () => {
            try {
                const [eventosSnap, destaquesSnap] = await Promise.all([
                    getDocs(collection(db, 'eventos')),
                    getDocs(collection(db, 'destaques'))
                ]);

                const listaEventos = eventosSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const listaDestaques = destaquesSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setAllEventos(listaEventos);
                setAllDestaques(listaDestaques);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        carregarDados();

        const container = scrollRef.current;

        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };

    }, []);

    return (
        <div className="home-container">
            <div className="header-container">
                <HeaderItem
                    logo={Logo}
                    user={user}
                    userPhoto={null}
                />
            </div>
            <input type="text" className="home-input" placeholder='Buscar' />
            <div className="list-container destaques">
                <h3 className="list-title">Destaques</h3>
                <div className="destaques-list" ref={scrollRef}>
                    {allDestaques.map(d => (
                        <DestaqueItem
                            key={d.id}
                            eventImage={d.eventImage}
                            name={d.name}
                            dateTime={d.dateTime}
                            image={d.image}
                            alt={d.personName}
                            personName={d.personName}
                        />
                    ))}
                </div>
            </div>
            <div className="list-container eventos">
                <h3 className="list-title">Próximos eventos</h3>
                <div className="eventos-list">
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
        </div>
    )

}

export default Home;
