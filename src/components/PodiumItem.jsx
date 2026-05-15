function PodiumItem( {aluno, posicao, variant, totalLider} ) {

    if (!aluno) return null;

    const widthPercentage = totalLider > 0 ? (aluno.total / totalLider) * 100 : 0;

    const variants = {
        1: { badge: "gold", tag: "gold-tag", label: "1º" },
        2: { badge: "silver", tag: "silver-tag", label: "2º" },
        3: { badge: "bronze", tag: "bronze-tag", label: "3º" }
    };

    const { badge, tag, label } = variants[posicao];

    return (
        <div className={`podium-card ${variant}`}>
            <div className="avatar-box">
                <div className={`avatar-main border-${badge}`}>
                    {aluno.foto?.length > 3 ? (
                        <img src={aluno.foto} alt="avatar" />
                    ) : (
                        aluno.foto
                    )}
                </div>
                <span className={`badge-pos ${badge}`}>{posicao}</span>
            </div>

            <div className="info-box">
                <span className={`tag ${tag}`}>{label}</span>
                <p className="name">{aluno.nome}</p>
                <p className="count">{aluno.total} palestras</p>
                <div className="bar">
                    <div className="fill" style={{ width: `${widthPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );

}

export default PodiumItem;