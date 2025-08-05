import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assest/Logotipo_GV 2025_color con fondo.jpg';

const Login = () => {
    const width = 620;
    const height = 700;

    // Calculate position to center the window
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const handleMicrosoftLogin = () => {
        const popup = window.open(
            `${import.meta.env.VITE_BACKEND_ORIGIN}/auth/microsoft`,
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
            if (event.origin === `${import.meta.env.VITE_BACKEND_ORIGIN}` && event.data.user) {
                sessionStorage.setItem("user", JSON.stringify(event.data.user));
                console.log('usuario registrado',event.data.user)
                console.log('tipo de usuario',event.data.user.tipoId)
                popup.close();
                if(event.data.user.tipoId == import.meta.env.VITE_USER_UID)
                    window.location.href = '/preguntaClave/pregunta/lista';
                else 
                    window.location.href = '/dashboard'
            }
        });
    };

   return (
        <Container fluid className="login-background d-flex justify-content-center align-items-center">

            <Row className="justify-content-center w-100">
                <Col xs={12} md={8} lg={6} xl={4}>
                    <div className="bg-white p-4 rounded shadow-sm text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                        {/* Logo */}
                        <img 
                            src={logo} 
                            alt="logo-vanquish" 
                            className="img-fluid mb-4" 
                            style={{ maxHeight: '100px' }}
                        />

                        {/* Divider with text */}
                        <div className="d-flex align-items-center my-4">
                            <div className="flex-grow-1 border-top"></div>
                            <span className="px-3 text-muted">Sign in with</span>
                            <div className="flex-grow-1 border-top"></div>
                        </div>

                        {/* Microsoft Login Button */}
                        <Button 
                            variant="outline-primary" 
                            onClick={handleMicrosoftLogin}
                            className="d-flex align-items-center justify-content-center mx-auto px-4 py-2 mb-4"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 100 100"
                                className="me-2"
                            >
                                <rect x="0" y="0" width="50" height="50" fill="#f25022" />
                                <rect x="50" y="0" width="50" height="50" fill="#7fba00" />
                                <rect x="0" y="50" width="50" height="50" fill="#00a4ef" />
                                <rect x="50" y="50" width="50" height="50" fill="#ffb900" />
                            </svg>
                            <span>Microsoft</span>
                        </Button>

                        {/* Terms and Privacy */}
                        <p className="text-muted small mb-0">
                            By signing in, you agree to our <a href="#" className="text-decoration-none">Terms of Service</a> and <a href="#" className="text-decoration-none">Privacy Policy</a>.
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};


export default Login;
