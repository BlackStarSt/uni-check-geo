import '../styles/EditEventAndUser.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, GeoPoint } from 'firebase/firestore';

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

function NewEvent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [eventName, setEventName] = useState('');
    const [localNome, setLocalNome] = useState('');
    const [posicao, setPosicao] = useState([-20.3155, -40.3128]);
    const [dateTime, setDateTime] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const dataMinima = new Date().toISOString().slice(0, 16);


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

    const handleCriarEvento = async (e) => {
        e.preventDefault();

        const dataSelecionada = new Date(dateTime);
        const agora = new Date();

        if (dataSelecionada < agora) {
            alert("Não é possível cadastrar um evento com data e hora que já passaram!");
            return;
        }

        setSaving(true);

        try {
            await addDoc(collection(db, 'eventos'), {
                eventName: eventName,
                local: localNome,
                geoLocation: new GeoPoint(posicao[0], posicao[1]),
                image: imageUrl,
                dateTime: new Date(dateTime),
                status: "Aberto"
            });

            alert("Novo evento cadastrado com sucesso!");
            navigate('/events');
        } catch (error) {
            console.error("Erro ao cadastrar evento:", error);
            alert("Erro ao tentar salvar o evento. Verifique as regras do Firestore.");
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
                <p className="loading-text">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="edit-event-container">
            <VoltarButton />

            <div className="header-container">
                <h2 className="events-title">Criar Novo Evento</h2>
            </div>
            <form onSubmit={handleCriarEvento} className="edit-event-form">
                <div className="form-group">
                    <label>Nome do Evento</label>
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="Ex: Workshop de Geoprocessamento e Spark"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>URL da Imagem do Card</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Ex: https://images.unsplash.com/..."
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
                        placeholder="Ex: Laboratório de Informática 04 - Prédio Rosa"
                    />

                    <label style={{ marginTop: '10px' }}>Selecione o Ponto no Mapa para o Check-In:</label>
                    <p className="map-help-text">Clique no mapa com a mira de precisão para marcar o local.</p>

                    <div className="leaflet-wrapper">
                        <MapContainer center={posicao} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={posicao} />
                            <CliqueNoMapa />
                        </MapContainer>
                    </div>

                    <span className="coords-indicator">
                        Lat: {posicao[0].toFixed(6)} | Lng: {posicao[1].toFixed(6)}
                    </span>
                </div>

                <div className="form-group">
                    <label>Data e Hora do Evento</label>
                    <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        min={dataMinima}
                        required
                    />
                </div>

                <button type="submit" className="btn-save-event" disabled={saving}>
                    {saving ? "Cadastrando Evento..." : "Cadastrar Evento"}
                </button>
            </form>
        </div>
    );
}

export default NewEvent;