import '../styles/Home.css';

function EventoItem({ image, eventName, local, dateTime, status, timer }) {
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
        <div className="evento-itens">
            <div className='evento-details'>
                <img src={image} alt={eventName} className="item-img" />
                <div className="evento-description">
                    <h4 className="item-evento-name">{eventName}</h4>
                    <ul className="evento-item-list">
                        <li className="item-list">{local}</li>
                        <li className="item-list">{formatarData(dateTime)}</li>
                    </ul>
                </div>
            </div>
            <div className='evento-btns'>
                <p className="item-status">{status}</p>
                <p className="item-status">{timer}</p>
            </div>
        </div>
    )
}

export default EventoItem;