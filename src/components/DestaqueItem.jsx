import '../styles/Home.css';

function DestaqueItem({ eventImage, name, dateTime, image, personName }) {
    const formatarData = (data) => {
        if (!data) return "";

        const dateObj = data.toDate ? data.toDate() : new Date(data);

        return dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="destaque-itens" style={{ backgroundImage: `url(${eventImage})` }}>
            <div className="item-details">
                <h4 className="item-name">{name}</h4>
                <p className="item-date">{formatarData(dateTime)}</p>
            </div>
            <div className="item-person">
                {image ? (
                    <img src={image} alt={personName} className="person-img" />
                ) : (
                    <div className="person-img-placeholder" />
                )}
                <p className="person-name">{personName}</p>
            </div>
        </div>
    )
}

export default DestaqueItem;