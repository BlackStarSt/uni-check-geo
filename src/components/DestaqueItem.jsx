import '../styles/Home.css';

function DestaqueItem({ eventImage, name, dateTime, image, personName }) {
    return (
        <div className="destaque-itens" style={{ backgroundImage: `url(${eventImage})` }}>
            <div className="item-details">
                <h4 className="item-name">{name}</h4>
                <p className="item-date">{dateTime}</p>
            </div>
            <div className="item-person">
                <img src={image} alt={personName} className="person-img" />
                <p className="person-name">{personName}</p>
            </div>
        </div>
    )
}

export default DestaqueItem;