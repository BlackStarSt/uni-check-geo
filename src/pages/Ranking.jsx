import { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

import VoltarButton from '../components/VoltarButton';
import RankItem from '../components/RankItem';
import '../styles/Ranking.css';
import PodiumItem from '../components/PodiumItem';

function Ranking() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filtroAtivo, setFiltroAtivo] = useState('Semestre');

    useEffect(() => {
        const buscarDadosRanking = async () => {
            try {
                const usersSnap = await getDocs(collection(db, "users"));
                const usuarios = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const presencasSnap = await getDocs(query(
                    collection(db, "presencas"),
                    where("status", "==", "realizado")
                ));

                const contagemPorUsuario = {};
                presencasSnap.forEach(doc => {
                    const { userId } = doc.data();
                    contagemPorUsuario[userId] = (contagemPorUsuario[userId] || 0) + 1;
                });

                const rankingFinal = usuarios.map(u => ({
                    id: u.id,
                    nome: u.user,
                    curso: u.curso || "Geral",
                    foto: u.userPhoto || u.user?.substring(0, 2).toUpperCase(),
                    total: contagemPorUsuario[u.id] || 0
                }))
                    .sort((a, b) => b.total - a.total);

                setRanking(rankingFinal);
            } catch (error) {
                console.error("Erro ao calcular ranking:", error);
            } finally {
                setLoading(false);
            }
        };

        buscarDadosRanking();
    }, []);

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
        <div className="ranking-container">
            <header className="ranking-header">
                <div className="ranking-top-bar">
                    <VoltarButton />
                </div>
                <h1 className="ranking-title">Ranking de Presença</h1>
                <p className="ranking-subtitle">Alunos mais engajados do semestre</p>
                <div className="filter-tabs">
                    {['Semestre', 'Mês', 'Semana'].map((periodo) => (
                        <button
                            key={periodo}
                            className={`tab ${filtroAtivo === periodo ? 'active' : ''}`}
                            onClick={() => setFiltroAtivo(periodo)}
                        >
                            {periodo}
                        </button>
                    ))}
                </div>
            </header>

            <div className="ranking-body">
                <section className="podium-section">
                    <p className="section-label-first">PÓDIO - TOP 3</p>
                    <div className="podium-wrapper">

                        <PodiumItem
                            aluno={ranking[1]}
                            posicao={2}
                            variant="secondary"
                            totalLider={ranking[0]?.total}
                        />

                        <PodiumItem
                            aluno={ranking[0]}
                            posicao={1}
                            variant="primary"
                            totalLider={ranking[0]?.total}
                        />

                        <PodiumItem
                            aluno={ranking[2]}
                            posicao={3}
                            variant="tertiary"
                            totalLider={ranking[0]?.total}
                        />
                    </div>
                </section>

                <section className="list-section">
                    <p className="section-label-second">CLASSIFICAÇÃO GERAL</p>
                    <div className="rank-list">
                        {ranking.slice(3).map((a, i) => (
                            <RankItem
                                key={a.id}
                                rankNum={i + 4}
                                name={a.nome}
                                userPhoto={a.userPhoto}
                                curso={a.curso}
                                lectNum={a.total}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Ranking;