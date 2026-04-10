import { useState } from 'react';

import '../styles/Home.css';

import Logo from '../assets/logo_alone.png';

import DestaqueItem from '../components/DestaqueItem';
import EventoItem from '../components/EventoItem';

function Home() {

    const [user, setUser] = useState('');

    const allDestaques = [
        {
            id: 1,
            name: "Palestra: Futuro da Geotecnologia",
            dateTime: "12 de Abril, 19:00",
            image: "",
            personName: "Dr. Ricardo Santos"
        }
    ];

    const allEventos = [
        {
            id: 1,
            image: "",
            eventName: "Geografia Física I",
            local: "Laboratório de Geoprocessamento",
            dateTime: "Hoje, 14:00",
            status: "Aguardando",
            timer: "45min"
        }
    ];

    return (
        <div className="home-container">
            <div className="header-container">
                <div className="user-detail">
                    <img src={Logo} alt="" className="logo" />
                    <h2 className="user-name">Olá, {user}</h2>
                </div>
                <img src="" alt="" className="user-profile" />
            </div>
            <input type="text" className="home-input" placeholder='Buscar' />
            <div className="list-container destaques">
                <h3 className="list-title">Destaques</h3>
                <div className="destaques-list">
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
                        <EventoItem
                            key={e.id}
                            image={e.image}
                            alt={e.eventName}
                            eventName={e.eventName}
                            local={e.local}
                            dateTime={e.dateTime}
                            status={e.status}
                            timer={e.timer}
                        />
                    ))}
                </div>
            </div>
        </div>
    )

}

export default Home;