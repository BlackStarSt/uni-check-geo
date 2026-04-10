import '../styles/Home.css';

function EventoItem({ image, eventName, local, dateTime, status, timer }) {
    return (
        <div className="evento-itens">
            <div className='evento-details'>
                <img src={image} alt={eventName} className="item-img" />
                <div className="evento-description">
                    <h4 className="item-evento-name">{eventName}</h4>
                    <ul className="evento-item-list">
                        <li className="item-list">{local}</li>
                        <li className="item-list">{dateTime}</li>
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