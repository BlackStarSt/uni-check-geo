import '../styles/Ranking.css';

function RankItem({ rankNum, name, userPhoto, curso, lectNum }) {
    const iniciais = name 
        ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : "??";
        
    return (
        <div className="rank-item">
            <span className="pos-number">{rankNum}º</span>
            <div className="list-avatar green-bg">
                {userPhoto?.length > 3 ? (
                    <img src={userPhoto} alt={name} className="avatar-img-small" />
                ) : (
                    iniciais
                )}
            </div>
            <div className="list-info">
                <p className="list-name">{name}</p>
                <p className="list-sub">{curso}</p>
            </div>
            <div className="list-score">
                <p className="score-text">
                    {lectNum} <span>palestras</span>
                </p>
                <div className="bar-mini">
                    <div className="fill" style={{ width: `${(lectNum / 20) * 100}%` }}></div>
                </div>
            </div>
        </div>
    );
}

export default RankItem;