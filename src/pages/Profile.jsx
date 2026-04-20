import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

import VoltarButton from '../components/VoltarButton';

import simIcon from '../assets/icons/simIcon.png';
import naoIcon from '../assets/icons/naoIcon.png';

import '../styles/Profile.css';

function Profile() {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const fileInputRef = useRef(null);

    const auth = getAuth();

    const [historico, setHistorico] = useState([]);
    const statusRealizado = true;

    useEffect(() => {
        const buscarDados = async () => {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setLoading(false);
                return;
            }

            const targetId = id || currentUser.uid;

            try {
                const docRef = doc(db, "users", targetId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    console.warn("ID da URL não existe. Tentando o UID do login...");

                    const fallbackRef = doc(db, "users", currentUser.uid);
                    const fallbackSnap = await getDoc(fallbackRef);

                    if (fallbackSnap.exists()) {
                        setUserData(fallbackSnap.data());
                    } else {
                        console.error("Nenhum documento encontrado no Firestore para este usuário.");
                    }
                }
            } catch (error) {
                console.error("Erro técnico na busca:", error);
            }
        };

        buscarDados();
    }, [id]);

    const abrirSeletorSArquivos = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const atualizarFoto = async (event) => {
        const file = event.target.files[0];
        if (!file || !auth.currentUser) return;

        const novaUrl = URL.createObjectURL(file);

        try {
            const userDocRef = doc(db, "users", auth.currentUser.uid);

            await setDoc(userDocRef, {
                userPhoto: novaUrl
            }, { merge: true });

            setUserData(prev => ({ ...prev, userPhoto: novaUrl }));
            alert("Foto atualizada!");
        } catch (e) {
            console.error("Erro ao salvar:", e);
        }
    };

    useEffect(() => {
        const buscarHistorico = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const targetId = id || currentUser.uid;

            try {
                const q = query(
                    collection(db, "presencas"),
                    where("userId", "==", targetId)
                );

                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const listaOrdenada = docs.sort((a, b) => b.checkInDate - a.checkInDate);
                setHistorico(listaOrdenada);

            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
            }
        };

        buscarHistorico();
    }, [id, auth.currentUser]);

    return (
        <div className="container-profile">
            <VoltarButton />
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-container" onClick={abrirSeletorSArquivos}>
                        <img
                            src={userData?.userPhoto}
                            className="userPhoto"
                        />
                        <div className="avatar-overlay">Trocar Foto</div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={atualizarFoto}
                        accept="image/*"
                    />
                    <h2 className="profile-name">{userData?.user}</h2>
                    <span className="profile-badge">{userData?.perfil || 'Aluno'}</span>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <label>Curso</label>
                        <p>{userData?.curso}</p>
                    </div>
                    <div className="detail-item">
                        <label>Matrícula</label>
                        <p>{userData?.matricula}</p>
                    </div>
                    <div className="detail-item">
                        <label>Email</label>
                        <p>{userData?.email}</p>
                    </div>
                </div>
                <div className="history-container">
                    <h3 className="history-title">Histórico de Presença</h3>
                    <div className="history-list">
                        {historico.length > 0 ? (
                            historico.map((item) => (
                                <div className="history-item" key={item.id}>
                                    <div className="item-details">
                                        <h2 className="item-status-detail">
                                            {item.status === 'realizado' ? "Check-in realizado" : "Check-in não realizado"}
                                        </h2>
                                        <p>{item.eventName}</p>
                                        <p>{item.checkInDate?.toDate().toLocaleString('pt-BR')}</p>
                                    </div>
                                    <div className={`item-icon ${item.status === 'realizado' ? 'status-sim' : 'status-nao'}`}>
                                        <img
                                            src={item.status === 'realizado' ? simIcon : naoIcon}
                                            alt="Status"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-history">Nenhuma presença registrada</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;