import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Modal, Spinner, Navbar, Nav, Badge } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Temas = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [themes, setThemes] = useState([]); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [themeToDelete, setThemeToDelete] = useState(null);
    const [temasTotales, setTemasTotales] = useState([]);
    const [preguntasTotales, setPreguntasTotales] = useState([]);
    const [showWarningModal, setShowWarningModal] = useState(false);
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

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/themes');
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: 'Error desconocido'
                    }));
                    throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                }

                const data = await response.json();
                console.log('respuesta',data)
                setThemes(data.map(theme => ({
                    id: theme.id,
                    nombre: theme.nombre,
                    questions: theme.preguntas || [],
                    flag:theme.flag
                })));
            } catch (error) {
                console.error('Error obteniendo los datos', error);
            }
        };

        fetchThemes();
    }, []);

    useEffect(() => {
        const fetchThemesId = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/themes/totales/preguntasTemas');
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: 'Error desconocido'
                    }));
                    throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                }

                const data = await response.json();
                console.log('respuesta',data)

                setTemasTotales(data.temasTotales); 
                setPreguntasTotales(data.preguntasTotales);

            } catch (error) {
                console.error('Error obteniendo los datos', error);
            }
        };

        fetchThemesId();
    }, []);

    console.log(preguntasTotales)

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/");
    };

    const handleDeleteClick = (themeId) => {
        const temaEnUso = temasTotales.map(t => t.temasTotales)
        .includes(themeId);
        console.log('id del tema',themeId)
        console.log('verdadero o falso',temaEnUso)
        if (temaEnUso) {
            setShowDeleteModal(false); 
            setShowWarningModal(true); 
            return;
        }

        setThemeToDelete(themeId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!themeToDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/api/themes/${themeToDelete}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar el tema');

            const updatedResponse = await fetch('http://localhost:3000/api/themes');
            const updatedData = await updatedResponse.json();

            setThemes(updatedData.map(theme => ({
                id: theme.id,
                nombre: theme.nombre,
                questions: theme.preguntas || []
            })));

            setShowDeleteModal(false);
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 2000);
        } catch (error) {
            console.error('Error al eliminar el tema', error);
            alert('Error al eliminar el tema');
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setThemeToDelete(null);
    };

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
                            <Nav.Link as="div" className="nav-link-pointer active" onClick={() => navigate("/temas")}>Temas</Nav.Link>)}
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

            {/* Contenido principal */}
            <Container fluid className="flex-grow-1 py-4">
                {/* Titulo y boton de añadir */}
                <Row className="mb-4 justify-content-center">
                    <Col xs="auto" className="d-flex align-items-center">
                        <h1 className="mb-0 me-3">Temas</h1>
                        <Button 
                            variant="primary" 
                            onClick={() => navigate("/temas/nuevo")}
                            className="rounded-circle d-flex justify-content-center align-items-center fs-3 me-2"
                            style={{ width: '40px', height: '40px' }}
                        >
                            +
                        </Button>

                        {/* Botón de editar */}
                        <Button 
                            variant="secondary"
                            onClick={() => navigate("/temas/tema/editar")} // Cambia esta ruta según sea necesario
                            className="rounded-circle d-flex justify-content-center align-items-center"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <i className="bi bi-pencil"></i>
                        </Button>
                    </Col>
                </Row>

                {/* Temas centrados*/}
                <Row className="justify-content-center">
                    {themes.map((theme) => (
                        <Col key={theme.id} xs={12} md={8} lg={6} xl={4} className="mb-4">
                            <Card className="h-100">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{theme.nombre}</h5>
                                    <div>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            onClick={() => navigate(`/temas/editar/${theme.id}`)}
                                            className="me-2"
                                        >
                                            Editar
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            onClick={() => handleDeleteClick(theme.id)}
                                        >
                                            <i className="bi bi-trash"></i>
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

            {/* Dialogo de eliminación */}
            <Modal show={showDeleteModal} onHide={cancelDelete} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Estás seguro de eliminar este tema?</p>
                    <p className="text-danger"><small>Esta acción no se puede deshacer.</small></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDelete}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Diaologo de exito */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Body className="text-center p-4">
                    <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h4>Tema eliminado correctamente</h4>
                </Modal.Body>
            </Modal>

            {/* Modal de advertencia de tema en uso */}
            <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tema en uso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Este tema no se puede eliminar porque está siendo utilizado en una pregunta clave abierta.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowWarningModal(false)}>
                        Entendido
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Temas;