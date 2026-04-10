import '../styles/InputLogin.css';

function SelectLogin({ label, icon, options, value, onChange, name, id }) {
    return (
        <div className="select-container">
            {icon && <img src={icon} alt="" className="select-icon-prefix" />}

            {label && <label htmlFor={id} className="perfil-label">{label}</label>}

            <select
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                className="select-custom"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectLogin;