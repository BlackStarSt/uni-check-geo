import '../styles/InputLogin.css';

function SelectLogin({ label, icon, options, value, onChange, name, id }) {
    return (
        <div className={`select-container select-wrapper perfil-${value}`}>
            {icon && <img src={icon} alt="" className="select-icon-prefix" />}

            {label && <label htmlFor={id} className="perfil-label" style={{ marginRight: '10px', fontSize: '15px' }}>{label}:</label>}

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