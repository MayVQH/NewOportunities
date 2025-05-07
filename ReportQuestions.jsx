import React, { useEffect,useState } from 'react';
import { useNavigate } from "react-router-dom"; 
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css"
import MiniPieChart from './PieChart';
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const Reportquestion = () => {
    const [user, setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();

    const [isSwitchOn, setIsSwitchOn] = useState(false); // Estado para el switch

    const handleSwitchChange = () => {
        setIsSwitchOn(!isSwitchOn); // Cambiar el estado del switch
    };

    useEffect(() => {
            const userData = sessionStorage.getItem("user");
            if (!userData){
                navigate("/")
                return;
            }
            setUser(JSON.parse(userData));
            setLoading(false)
    
            const handleMessage = (event) => {
                if (event.origin === 'http://localhost:3000' && event.data.user){
                    sessionStorage.setItem("user", JSON.stringify(event.data.user));
                    setUser(event.data.user);
                }
            };
            window.addEventListener("message", handleMessage);
            return () => window.removeEventListener("message",handleMessage);
        }, [navigate]);

        const handleLogout = () => {
            sessionStorage.removeItem("user");
            navigate("/");
        };

        if (loading){
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            );
        }
    return (
        <div>
            {/* Navbar with centered options */}
                        <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
                            <Container fluid>
                                <Navbar.Brand className="d-flex align-items-center me-auto"> {/* Changed to me-auto */}
                                    <img
                                        src={user.photo}
                                        alt={user.displayName}
                                        className="rounded-circle me-2"
                                        width="40"
                                        height="40"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0078d4&color=fff`;
                                        }}
                                    />
                                    <span className="d-none d-sm-inline">{user.displayName}</span>
                                </Navbar.Brand>
                                
                                <Navbar.Toggle aria-controls="main-navbar" />
                                
                                <Navbar.Collapse id="main-navbar">
                                    <Nav className="mx-auto"> {/* Changed to mx-auto to center the nav items */}
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer active" onClick={() => navigate("/temas")}>Temas</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/enrolamiento")}>Enrolamiento</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>
                                    </Nav>
                                    <Button variant="outline-light" className="ms-auto" onClick={handleLogout}>Sign out</Button> {/* Changed to ms-auto */}
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                        
            <button style={{ padding: '6px 12px', backgroundColor: '#007BFF',color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        onClick={() => navigate('/preguntas-clave')}>
                        Volver
            </button>

            <div style={{
            margin: '0 auto',
            width: '95%',
            marginBottom: '20px',
            display: 'block',
            padding: '10px 20px',
            }}>
                {/* Titulo */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>Pregunta Detonadora</h3>

                    <input
                    type="text"
                    value="¿Debo entrar al negocio con gobierno?"
                    readOnly
                    style={{
                        padding: '8px',
                        fontSize: '16px',
                        width: '300px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    />

                
                    <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{
                        backgroundColor: '#007BFF',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Sí
                    </div>
                    <div style={{
                        backgroundColor: '#FFA500',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        No
                    </div>
                    </div>
                </div>

                {/* Tabla con reporte de datos */}
                <div style={{ width: '95%', margin: '0 auto', marginBottom: '30px' }}>
                    {[
                        { pregunta: 'Elemento de decisión', mensaje: 'Promedio "Si" 75%', graficaData: [
                            { valor: "Sí", area: 75 },
                            { valor: "No", area: 25 }
                        ] },
                        { pregunta: '¿Pregunta 2?', mensaje: 'Promedio "Si" 90%' ,graficaData: [
                            { valor: "Sí", area: 90 },
                            { valor: "No", area: 10 }
                        ]},
                        { pregunta: '¿Pregunta 3?', mensaje: 'Promedio "Si" 60%' , graficaData: [
                            { valor: "Sí", area: 60 },
                            { valor: "No", area: 40 }
                        ]},
                        { pregunta: '¿Pregunta 4?', mensaje: 'Promedio "Si" 85%' , graficaData: [
                            { valor: "Sí", area: 85 },
                            { valor: "No", area: 15 }
                        ]},
                    ].map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #ccc',
                            padding: '10px 0'
                        }}>
                            <div style={{ flex: 1 }}>{item.pregunta}</div>
                            <div style={{ flex: 1 }}>{item.mensaje}</div>
                            <div style={{ flex: 1 }}> <MiniPieChart data={item.graficaData} /></div>
                            <div style={{ flex: 1 }}>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                    marginRight: '3px'
                                }}>Comentario</button>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                    marginRight: '3px'
                                }}>Enlace</button>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                    marginRight: '3px'
                                }}>Archivo</button>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                }}>Detalle</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Seccion de desición final */}
                <div style={{ width: '95%', margin: '0 auto', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '10px'}}>
                        {/* Título y switch */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' , marginRight: '20px'}}>
                        <label style={{ margin: 0 }}>Desición Final</label>
                            <span>Sí</span>
                            <div className="form-check form-switch" style={{ marginBottom: 0 }}>
                                <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="switchCheckDefault"
                                checked={isSwitchOn}
                                onChange={handleSwitchChange}
                                />
                            </div>
                            <span>No</span>
                        </div>

                        {/* Comentario e input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label htmlFor="comentarioInput" style={{ margin: 0 }}>Comentario</label>
                            <input
                                id="comentarioInput"
                                type="text"
                                placeholder="Escribe un comentario"
                                style={{
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                width: '400px'
                                }}
                            />
                            <button style={{
                                marginLeft: '10rem',
                                padding: '6px 12px',
                                backgroundColor: '#007BFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            
        </div>
    );
};

export default Reportquestion;
