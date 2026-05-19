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

                const rankingReal = usuarios.map(u => ({
                    id: u.id,
                    nome: u.user,
                    curso: u.curso || "Geral",
                    foto: u.userPhoto || u.user?.substring(0, 2).toUpperCase(),
                    total: contagemPorUsuario[u.id] || 0
                }))
                    .sort((a, b) => b.total - a.total);

                const alunosFakes = [
                    {
                        id: "fake_user_1",
                        nome: "Ana Beatriz Ramos",
                        curso: "Engenharia de Computação",
                        userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                        total: 18 // Vai brigar pelo topo do pódio
                    },
                    {
                        id: "fake_user_2",
                        nome: "Carlos Eduardo Santos",
                        curso: "Ciência da Computação",
                        userPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                        total: 15
                    },
                    {
                        id: "fake_user_3",
                        nome: "Mariana Costa",
                        curso: "Sistemas de Informação",
                        userPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
                        total: 12
                    },
                    {
                        id: "fake_user_4",
                        nome: "Lucas Oliveira",
                        curso: "Análise e Des. de Sistemas",
                        userPhoto: null, // Testar o fallback de iniciais do nome
                        total: 9
                    },
                    {
                        id: "fake_user_5",
                        nome: "Gabriela Lima",
                        curso: "Engenharia de Software",
                        userPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                        total: 7
                    },
                    {
                        id: "fake_user_6",
                        nome: "Thiago Rocha",
                        curso: "Redes de Computadores",
                        userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                        total: 5
                    },
                    {
                        id: "fake_user_7",
                        nome: "Larissa Rezende",
                        curso: "Ciência da Computação",
                        userPhoto: null,
                        total: 2
                    }
                ];

                const rankingFinal = [...rankingReal, ...alunosFakes]
                    .map(aluno => ({
                        ...aluno,
                        // Mantém a lógica de fallback caso o componente espere a propriedade 'foto'
                        foto: aluno.userPhoto || aluno.nome?.substring(0, 2).toUpperCase()
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