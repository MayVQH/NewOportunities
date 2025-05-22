import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Modal, Spinner, Navbar, Nav, Badge } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ListKeyQuestion = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [keyQuestions, setKeyQuestion] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
            const userData = sessionStorage.getItem("user");
            if (!userData) {
                navigate("/");
                return;
            }
            setUser(JSON.parse(userData));
            setLoading(false);
    
            const handleMessage = (event) => {
                if (event.origin === 'http://localhost:3000' && event.data.user) {
                    sessionStorage.setItem("user", JSON.stringify(event.data.user));
                    setUser(event.data.user);
                }
            };
            window.addEventListener("message", handleMessage);
            return () => window.removeEventListener("message", handleMessage);
        }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/");
    };

    useEffect(() => {
            const fetchKeyQuestion = async () => {
                try {
                    console.log('id de usuario',user.id)
                    const response = await fetch(`http://localhost:3000/api/themes/preguntasClave/usuario/${user.id}`);
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({
                            message: 'Error desconocido'
                        }));
                        throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                    }
    
                    const data = await response.json();
                    console.log('respuesta enviada',data)
                    setKeyQuestion(data.map(key => ({
                        id: key.id,
                        nombre: key.nombre,
                        questions: key.preguntas || [],
                        flag:key.flag
                    })));
                } catch (error) {
                    console.error('Error obteniendo los datos', error);
                }
            };
    
            fetchKeyQuestion();
        }, [user]);


    if (loading) {
            return (
                <Container fluid className="d-flex justify-content-center align-items-center vh-100">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            );
    }

    return (
            <div className="d-flex flex-column min-vh-100">
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
                                {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                                <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>)}
                                {(user.tipoId === '84F03A04-2891-4DE7-8A3D-DBD2018EAE47') && (
                                <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntaClave/pregunta/lista")}>Preguntas Clave</Nav.Link>)}
                                {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                                <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/temas")}>Temas</Nav.Link>)}
                                {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017') && (
                                <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/enrolamiento")}>Enrolamiento</Nav.Link>)}
                                {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                                <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>)}
                                {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017') && (   
                                <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/configuracion")} title="Configuración">
                                    <i className="bi bi-gear" style={{ fontSize: '1.2rem' }}></i>
                                </Nav.Link>)}
                            </Nav>
                            <Button variant="outline-light" className="ms-auto" onClick={handleLogout}>Sign out</Button> {/* Changed to ms-auto */}
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <Container fluid className="flex-grow-1 py-4">
                    {/* Titulo y boton de añadir */}
                    <Row className="mb-4 justify-content-center">
                        <Col xs="auto" className="d-flex align-items-center">
                            <h1 className="mb-0 me-3">Preguntas Clave</h1>
                        </Col>
                    </Row>
    
                    {/* preguntas centrados*/}
                    <Row className="justify-content-center">
                        {keyQuestions.map((theme) => (
                            <Col key={theme.id} xs={12} md={8} lg={6} xl={4} className="mb-4">
                                <Card className="h-100">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">{theme.nombre}</h5>
                                        <div>
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                onClick={() => navigate(`/preguntaClave/pregunta/contestar/${theme.id}`)}
                                                className="me-2"
                                            >
                                                Contestar
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="card-text">
                                            <ul className="list-unstyled mb-0">
                                                {theme.questions.map((question, index) => (
                                                    <li key={`${theme.id}-${index}`} className="mb-2">
                                                        <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                                                        {question}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>

                {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                <div className="d-flex justify-content-end" style={{ padding: '10px 30px' }}>
                <button
                    onClick={() => navigate(`/preguntas-clave`)}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Volver
                </button>
            </div>)}
         
            </div>
        );

}

export default ListKeyQuestion;