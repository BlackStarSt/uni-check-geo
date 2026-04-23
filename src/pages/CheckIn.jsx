import '../styles/CheckIn.css';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import VoltarButton from '../components/VoltarButton';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

function CheckIn() {
    const { id } = useParams();

    const [eventoData, setEventoData] = useState(null);
    const [userPos, setUserPos] = useState(null);
    const [radiusStatus, setRadiusStatus] = useState('fora');
    const [locationStatus, setLocationStatus] = useState('...');
    const [distanciaReal, setDistanciaReal] = useState(null);
    const [tempoRestante, setTempoRestante] = useState("");
    const [isTimeValid, setIsTimeValid] = useState(true);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const buscarEvento = async () => {
            try {
                const docRef = doc(db, "eventos", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEventoData(docSnap.data());
                } else {
                    console.error('Evento não encontrado!')
                }
            } catch (error) {
                console.error("Erro ao conectar com Firebase:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) buscarEvento();
    }, [id]);

    useEffect(() => {
        if (!eventoData?.dateTime) return;

        const inicioEvento = eventoData.dateTime.toDate().getTime();
        const limiteCheckIn = inicioEvento + (15 * 60 * 1000);

        const interval = setInterval(() => {
            const agora = new Date().getTime();

            if (agora < inicioEvento) {
                const difParaAbrir = inicioEvento - agora;
                const min = Math.floor((difParaAbrir % (1000 * 60 * 60)) / (1000 * 60));
                const seg = Math.floor((difParaAbrir % (1000 * 60)) / 1000);

                setTempoRestante(`${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`);
                setIsTimeValid(false);
                return;
            }

            const diferenca = limiteCheckIn - agora;

            if (diferenca > 0) {
                const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

                setTempoRestante(`${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`);
                setIsTimeValid(true);
            } else {
                setTempoRestante("00:00");
                setIsTimeValid(false);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [eventoData]);

    useEffect(() => {
        if (!eventoData || !eventoData.geoLocation) return;

        const latAlvo = eventoData.geoLocation.latitude;
        const lonAlvo = eventoData.geoLocation.longitude;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserPos([latitude, longitude]);
                setLocationStatus('validada');

                const dist = calcularDistancia(latitude, longitude, latAlvo, lonAlvo);
                setDistanciaReal(dist);

                setRadiusStatus(dist <= 50 ? 'dentro' : 'fora');
            },
            (error) => {
                setLocationStatus('negada');
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [eventoData]);

    const centerEvent = eventoData?.geoLocation
        ? [eventoData.geoLocation.latitude, eventoData.geoLocation.longitude]
        : [0, 0];

    const handleCheckInDB = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            alert("Erro: Usuário não autenticado.");
            return;
        }

        const presencaId = `${user.uid}_${id}`;
        const presencaRef = doc(db, "presencas", presencaId);

        try {
            const docSnap = await getDoc(presencaRef);
            if (docSnap.exists()) {
                alert("Você já realizou o check-in para este evento!");
                return;
            }

            await setDoc(presencaRef, {
                userId: user.uid,
                eventId: id,
                eventName: eventoData.eventName,
                checkInDate: serverTimestamp(),
                status: "realizado"
            });

            alert("Check-in confirmado com sucesso!");
            navigate(`/profile/${user.uid}`);

        } catch (error) {
            console.error("Erro ao salvar presença:", error);
            alert("Erro técnico ao registrar presença.");
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
        <div className='checkIn-container'>
            <VoltarButton />

            <div className="header-container">
                <h2 className="checkIn-title">Detalhes do Check-In</h2>
            </div>

            <div className="checkIn">
                <div className="timer-container">
                    <div className="timer">
                        <p className="timer-text">
                            {isTimeValid ? (
                                <>Tempo restante <br /> para check-in</>
                            ) : (
                                <>O check-in <br /> abre em</>
                            )}
                        </p>
                        <p className="timer-hour">{tempoRestante}</p>
                        {isTimeValid && <p className="timer-obj">min</p>}
                    </div>
                </div>
                <div className="map-container">
                    <div className="map">
                        <MapContainer
                            key={`${centerEvent[0]}-${centerEvent[1]}`}
                            center={centerEvent}
                            zoom={17}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Circle
                                center={centerEvent}
                                pathOptions={{
                                    color: radiusStatus === 'dentro' ? '#2E7D32' : '#C62828',
                                    fillColor: radiusStatus === 'dentro' ? '#4CAF50' : '#EF5350',
                                    fillOpacity: 0.3
                                }}
                                radius={50}
                            />
                            <Marker position={centerEvent} />
                            {userPos && (
                                <Marker position={userPos}>
                                    <Popup>Você está aqui!</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                    <p className={`map-status status-${radiusStatus}`}>
                        Localização {locationStatus}
                        {distanciaReal !== null}
                        ({radiusStatus === 'dentro' ? 'Dentro' : 'Fora'} do raio)
                    </p>
                </div>
                <div className="button-container">
                    <button
                        className={`btn-checkIn ${radiusStatus === 'dentro' && isTimeValid ? 'ativo' : 'bloqueado'}`}
                        disabled={radiusStatus !== 'dentro' || !isTimeValid}
                        onClick={handleCheckInDB}
                    >
                        Realizar Check-in
                    </button>
                    <p className="btn-message">O check-in só é validado dentro do horário e raio permitidos.</p>
                </div>
            </div>
        </div>
    );
}

export default CheckIn;