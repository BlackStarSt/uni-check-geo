import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import voltarIcon from '../assets/icons/seta-esquerda.png';

import '../styles/Profile.css';

function Profile() {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const fileInputRef = useRef(null);

    const auth = getAuth();

    const navigate = useNavigate();

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

    return (
        <div className="container-profile">
            <div className="btn-voltar-container" onClick={() => navigate(-1)}>
                <img src={voltarIcon} alt="Voltar" className="icon-voltar" />
                <span>Voltar</span>
            </div>
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
            </div>
        </div>
    );
}

export default Profile;