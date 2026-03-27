import '../styles/InputLogin.css';

function InputLogin({ placeholder, type }) {
  return (
    <input 
      className="input-login" 
      type={type} 
      placeholder={placeholder} 
    />
  );
}

export default InputLogin;