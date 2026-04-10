import '../styles/InputLogin.css';

function InputLogin({ placeholder, type, icon, value, onChange }) {
  return (
    <div className="input-container">
      {icon && (
        <img src={icon} alt="" className="input-icon-prefix" />
      )}

      <input
        className="input-login"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default InputLogin;