import '../styles/EventRegister.css';

import VoltarButton from '../components/VoltarButton';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function EventRegister() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const buscarEvento = async () => {
            try {
                const docRef = doc(db, "eventos", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvento(docSnap.data());
                } else {
                    navigate('/home');
                }
            } catch (error) {
                console.error("Erro ao buscar evento:", error);
            } finally {
                setLoading(false);
            }
        };
        buscarEvento();
    }, [id, navigate]);

    const handleInscricao = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const presencaId = `${userId}_${id}`;
        const presencaRef = doc(db, "presencas", presencaId);

        try {
            const q = query(
                collection(db, "presencas"),
                where("userId", "==", userId),
                where("eventId", "==", id)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("Você já está inscrito neste evento!");
                return;
            }

            await setDoc(presencaRef, {
                userId: userId,
                eventId: id,
                eventName: evento.eventName,
                local: evento.local,
                eventDate: evento.dateTime,
                inscritoDate: new Date(),
                status: "inscrito"
            });

            alert("Inscrição realizada!");
            navigate('/home');
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader-visual"><div className="dot"></div>
                    <div className="outline"></div></div>
                <p className="loading-text">Carregando...</p>
            </div>
        );
    }

    const centerEvent = evento?.geoLocation
        ? [evento.geoLocation.latitude, evento.geoLocation.longitude]
        : [-23.5505, -46.6333];

    return (
        <div className="register-container">
            <div className="top-bar"> <VoltarButton /> </div>

            <div className="event-register">
                <h2 className="register-title">Inscrição em: <br /> {evento.eventName}</h2>

                <div className="event-details-box">
                    <p><strong>Local:</strong> {evento.local}</p>
                    <p><strong>Data:</strong> {evento.dateTime?.toDate().toLocaleDateString('pt-BR')}</p>
                    <p><strong>Horário:</strong> {evento.dateTime?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className="map-wrapper">
                    <h3 className="map-subtitle">Localização no Mapa</h3>
                    {evento?.geoLocation && (
                        <MapContainer
                            key={`${centerEvent[0]}-${centerEvent[1]}`}
                            center={centerEvent}
                            zoom={17}
                            scrollWheelZoom={false}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Circle
                                center={centerEvent}
                                pathOptions={{
                                    color: '#6B3A8B',
                                    fillColor: '#6B3A8B',
                                    fillOpacity: 0.3
                                }}
                                radius={50}
                            />
                            <Marker position={centerEvent} />
                        </MapContainer>
                    )}
                </div>

                <button className="btn-register" onClick={handleInscricao}>
                    Confirmar Participação
                </button>
            </div>
        </div>
    );
}

export default EventRegister;