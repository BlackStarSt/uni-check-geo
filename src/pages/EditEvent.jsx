import '../styles/EditEvent.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebaseConfig';
import { doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VoltarButton from '../components/VoltarButton';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [eventName, setEventName] = useState('');
    const [localNome, setLocalNome] = useState('');
    const [posicao, setPosicao] = useState([-20.3155, -40.3128]);
    const [dateTime, setDateTime] = useState('');
    const [limitDate, setLimitDate] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mapaPronto, setMapaPronto] = useState(false);

    function CliqueNoMapa() {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosicao([lat, lng]);
                map.setView([lat, lng], map.getZoom());
            },
        });
        return null;
    }

    function AtualizarCentroMapa({ centro }) {
        const map = useMapEvents({});
        useEffect(() => {
            if (centro && mapaPronto) {
                map.setView(centro, 16);
            }
        }, [centro, map]);
        return null;
    }

    useEffect(() => {
        const carregarEvento = async () => {
            try {
                const docRef = doc(db, 'eventos', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const dados = docSnap.data();
                    setEventName(dados.eventName || '');
                    setLocalNome(dados.localNome || dados.local || '');
                    setImageUrl(dados.image || '');

                    if (dados.coordenadas) {
                        setPosicao([dados.coordenadas.lat, dados.coordenadas.lng]);
                    }

                    if (dados.dateTime) {
                        const d = dados.dateTime.toDate ? dados.dateTime.toDate() : new Date(dados.dateTime);
                        setDateTime(d.toISOString().slice(0, 16));
                    }
                    if (dados.limitDate) {
                        const d = dados.limitDate.toDate ? dados.limitDate.toDate() : new Date(dados.limitDate);
                        setLimitDate(d.toISOString().slice(0, 16));
                    }

                    setMapaPronto(true);

                } else {
                    alert("Evento não encontrado!");
                    navigate('/events');
                }
            } catch (error) {
                console.error("Erro ao carregar evento:", error);
            } finally {
                setLoading(false);
            }
        };

        carregarEvento();
    }, [id, navigate]);

    const handleSalvarAlteracoes = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const docRef = doc(db, 'eventos', id);

            await updateDoc(docRef, {
                eventName: eventName,
                local: localNome,
                geoLocation: new GeoPoint(posicao[0], posicao[1]),
                image: imageUrl,
                dateTime: new Date(dateTime),
                status: "Aberto"
            });

            alert("Evento atualizado com sucesso!");
            navigate('/events');
        } catch (error) {
            console.error("Erro ao atualizar evento:", error);
            alert("Erro ao salvar as alterações.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader-visual">
                    <div className="dot"></div>
                    <div className="outline"></div>
                </div>
                <p className="loading-text">Buscando...</p>
            </div>
        );
    }

    return (
        <div className="edit-event-container">
            <div className="edit-event-header-container">
                <div className="edit-event-header-left">
                    <VoltarButton />
                    <h2>Editar Evento</h2>
                </div>
            </div>

            <form onSubmit={handleSalvarAlteracoes} className="edit-event-form">
                <div className="form-group">
                    <label>Nome do Evento</label>
                    <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>URL da Imagem do Card</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://linkdaimagem.com/foto.png"
                        required
                    />
                    {imageUrl && (
                        <div className="image-preview-box">
                            <p>Pré-visualização:</p>
                            <img src={imageUrl} alt="Preview" className="img-preview" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Nome do Local (Identificação)</label>
                    <input
                        type="text"
                        value={localNome}
                        onChange={(e) => setLocalNome(e.target.value)}
                        required
                        placeholder="Ex: Bloco A - Sala 102"
                    />

                    <label style={{ marginTop: '10px' }}>Selecione o Ponto no Mapa para o Check-In:</label>
                    <p className="map-help-text">Clique no mapa para marcar a localização geográfica exata do evento.</p>

                    <div className="leaflet-wrapper">
                        {mapaPronto && (
                            <MapContainer center={posicao} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={posicao} />
                                <CliqueNoMapa />
                                <AtualizarCentroMapa centro={posicao} />
                            </MapContainer>
                        )}
                    </div>

                    <span className="coords-indicator">
                        Lat: {posicao[0].toFixed(6)} | Lng: {posicao[1].toFixed(6)}
                    </span>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Data e Hora</label>
                        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required />
                    </div>
                </div>

                <button type="submit" className="btn-save-event" disabled={saving}>
                    {saving ? "Salvando Alterações..." : "Salvar Alterações"}
                </button>
            </form>
        </div>
    );
}

export default EditEvent;