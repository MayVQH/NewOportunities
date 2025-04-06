import React from "react";
import '../Styles/Login.css';
import logo from '../assest/Logotipo_Grupo Vanquish_con fondo blanco.jpg';


const Login = () => {

    const width = 620;
    const height = 700;

    // Calculamos la posición para centrar la ventana
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const handleMicrosoftLogin = () => {
        const popup = window.open(
          "http://localhost:3000/auth/microsoft",
          "targetWindow",
          `toolbar=no,
             location=no,
             status=no,
             menubar=no,
             scrollbars=yes,
             resizable=yes,
             width=${width},
            height=${height},
            left=${left},
            top=${top}`
        );

        window.addEventListener("message", (event) => {
            if (event.origin === "http://localhost:3000") {
              if (event.data) {
                sessionStorage.setItem("user", JSON.stringify(event.data));
                popup.close();
                window.location.href = "/dashboard"
              }
            }
          });
        };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src={logo} alt="logo-vanquish" className="login-logo" />

                <div className="divider">
                    <span>Sign in with</span>
                </div>
                
                <button className="microsoft-btn" onClick={handleMicrosoftLogin}>
                <svg
                    xmlns="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                    width="100"
                    height="100"
                    viewBox="0 0 100 100"
                    className="microsoft-logo"
                    >
                    {/* Cuadro Rojo */}
                    <rect x="0" y="0" width="50" height="50" fill="#f25022" />
                    {/* Cuadro Verde */}
                    <rect x="50" y="0" width="50" height="50" fill="#7fba00" />
                    {/* Cuadro Azul */}
                    <rect x="0" y="50" width="50" height="50" fill="#00a4ef" />
                    {/* Cuadro Amarillo */}
                    <rect x="50" y="50" width="50" height="50" fill="#ffb900" />
                </svg>
                    
                    <span>Microsoft</span>
                </button>

               <p className="additional-text">
                    By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
               </p>

            </div>
        </div>
    );
};

export default Login;

