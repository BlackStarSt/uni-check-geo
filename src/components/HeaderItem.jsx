import '../styles/Home.css';

function HeaderItem({ logo, user, userPhoto }) {

    const formatName = (name) => {
        if (!name) return "Usuário";
        return name.split(' ')[0];
    };

    return (
        <div className="header-itens">
            <div className="user-detail">
                <img src={logo} alt="" className="logo" />
                <h2 className="user-name">Olá, {formatName(user)}</h2>
            </div>
            <img src={userPhoto} alt="" className="user-profile" />
        </div>
    )
}

export default HeaderItem;