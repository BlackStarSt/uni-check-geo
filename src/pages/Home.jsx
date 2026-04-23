import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { db } from '../services/firebaseConfig';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
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

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // useEffect 01: Buscar o usuário logado
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (usuarioLogado) => {
            if (usuarioLogado) {
                const docRef = doc(db, "users", usuarioLogado.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const dados = docSnap.data();
                    setUser(dados.user || usuarioLogado.displayName);
                    setUserPhoto(dados.userPhoto || usuarioLogado.photoURL);
                } else {
                    setUser(usuarioLogado.displayName || "Usuário");
                    setUserPhoto(usuarioLogado.photoURL);
                }
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
            } finally {
                setLoading(false);
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

    const handleAcessoEvento = async (eventId) => {
        const auth = getAuth();
        
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
        <div className="home-container">
            <div className="header-container">
                <HeaderItem
                    logo={Logo}
                    user={user}
                    userPhoto={userPhoto}
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
                <div className="eventos-title">
                    <h3 className="list-title">Próximos eventos</h3>
                    <Link to="/events" className="list-a">Ver mais</Link>
                </div>
                <div className="eventos-list">
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
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

}

export default Home;
