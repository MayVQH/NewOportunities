import React, { useState,useEffect } from 'react';
import { useNavigate, Outlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Button, Spinner, Container, Row, Col, Card,Form, Modal } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';


const ConfiguracionGlobal = () => {
  const [config, setConfig] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [toastMessage,setToastMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
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
        if (event.origin === `${import.meta.env.VITE_BACKEND_ORIGIN}` && event.data.user) {
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
        const fetchConfiguration = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/configuracion`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: 'Error desconocido'
                    }));
                    throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                }
                
                const data = await response.json();
                console.log('respuesta configuracion',data)

                const configuracion = {
                    inputMin: parseInt(data.inputComentarioMin),
                    inputMax: parseInt(data.inputComentarioMax),
                    docMin: parseInt(data.DocumentoMin),
                    docMax: parseInt(data.DocumentoMax),
                }

                setConfig(configuracion)
                

            }catch (error) {
                console.error('Error obteniendo los datos', error);
            }
        }

        fetchConfiguration();
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);
    setConfig((prev) => ({
        ...prev,
        [name]:  parsedValue,
    }));
  };

  const handleGuardar = () => {

    const inMin =config.inputMin;
    const inMax = config.inputMax;
    const docMin = config.docMin;
    const docMax = config.docMax;

    console.log('input minimo',inMin)
    console.log('input maximo',inMax)
    console.log('doc minimo', docMin)
    console.log('doc maximo',docMax)
    
    if (inMin === '' || inMax === '' || docMin === '' || docMax === '' ){
        const message = `No dejar campos vacíos`;
        showValidationPopup(message);
        return;
    } 
    if(!Number.isInteger(config.inputMin) || !Number.isInteger(config.inputMax) || 
        !Number.isInteger(config.docMin) || !Number.isInteger(config.docMax)){
        const message = `No se permiten letras ni símbolos en los campos`;
        showValidationPopup(message);
        return;
    }
    if(inMin <= 0 || inMax <= 0 || docMin <= 0 || docMax <= 0){
        const message = `Por favor, ingresa un número mayor a 0 en los campos`;
        showValidationPopup(message);
        return;
    }
    

    const payload = {
            inMin: config.inputMin,
            inMax: config.inputMax,
            docMin: config.docMin,
            docMax : config.docMax,
        };
    
    console.log('repsuesta enviada al back',payload)

    setShowConfirmation(true); 

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

    const showValidationPopup = (message) => {
        setToastMessage(message);
        setShowValidationMessage(true);
        setTimeout(() => {
            setShowValidationMessage(false);
        }, 3000);
        console.log(toastMessage)
    };

    const cancelSubmit = () => {
        setShowConfirmation(false);
    };

    const confirmSubmit = async () => {
        setShowConfirmation(false);

        const payload = {
            inMin: config.inputMin.toString(),
            inMax: config.inputMax.toString(),
            docMin: config.docMin.toString(),
            docMax : config.docMax.toString(),
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/configuracion/guardar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });


            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar configuraciones');
            }

            setShowSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error('Submission error:', error);
            showValidationPopup('Error al guardar los datos.');
        }
    };

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
                        {(user.tipoId === import.meta.env.VITE_COM_UID || user.tipoId === import.meta.env.VITE_MODER_UID) && (
                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>)}
                        {(user.tipoId === import.meta.env.VITE_USER_UID) && (
                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntaClave/pregunta/lista")}>Preguntas Clave</Nav.Link>)}
                        {(user.tipoId === import.meta.env.VITE_COM_UID || user.tipoId === import.meta.env.VITE_MODER_UID) && (
                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/temas")}>Temas</Nav.Link>)}
                        {(user.tipoId === import.meta.env.VITE_COM_UID) && (
                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/enrolamiento")}>Enrolamiento</Nav.Link>)}
                        {(user.tipoId === import.meta.env.VITE_COM_UID || user.tipoId === import.meta.env.VITE_MODER_UID) && (
                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>)}
                        {(user.tipoId === import.meta.env.VITE_COM_UID) && (   
                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/configuracion")} title="Configuración">
                            <i className="bi bi-gear" style={{ fontSize: '1.2rem' }}></i>
                        </Nav.Link>)}
                    </Nav>
                    <Button variant="outline-light" className="ms-auto" onClick={handleLogout}>Sign out</Button> {/* Changed to ms-auto */}
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <Container fluid className="flex-grow-1 py-4">
    <h3 className="mb-4">
        <i className="bi bi-gear me-2"></i>
        Configuración Global de Campos
    </h3>

    <Card className="shadow-sm">
        <Card.Body>
        <Form>
            {/* Sección Inputs */}
            <h5 className="mb-3 border-bottom pb-2">Comentarios</h5>
            <Row className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">Valores actuales</h6>
            <Col md={6}>
                <p>Mínimo de caracteres: </p><p>{config.inputMin} palabras</p>
            </Col>
            <Col md={6}>
                <p>Máximo de caracteres: </p><p>{config.inputMax} palabras</p>
            </Col>
            </Row>
            <Row className="mb-4">
            <Col md={6}>
                <Form.Group controlId="inputMin">
                <Form.Label>Mínimo de caracteres</Form.Label>
                <Form.Control
                    type="number"
                    name="inputMin"
                    value={config.inputMin}
                    onChange={handleChange}
                    min={1}
                />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group controlId="inputMax">
                <Form.Label>Máximo de caracteres</Form.Label>
                <Form.Control
                    type="number"
                    name="inputMax"
                    value={config.inputMax}
                    onChange={handleChange}
                    min={1}
                />
                </Form.Group>
            </Col>
            </Row>

            {/* Sección Textareas */}
            <h5 className="mb-3 border-bottom pb-2">Archivos</h5>
            <Row className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">Valores actuales</h6>
            <Col md={6}>
                <p>Mínimo de tamaño: </p><p>{config.docMin} KB</p>
            </Col>
            <Col md={6}>
                <p>Máximo de tamaño: </p><p>{config.docMax} MB</p>
            </Col>
            </Row>
            <Row className="mb-4">
            <Col md={6}>
                <Form.Group controlId="docMin">
                <Form.Label>Mínimo de tamaño</Form.Label>
                <Form.Control
                    type="number"
                    name="docMin"
                    value={config.docMin}
                    onChange={handleChange}
                    min={1}
                />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group controlId="docMax">
                <Form.Label>Máximo de tamaño</Form.Label>
                <Form.Control
                    type="number"
                    name="docMax"
                    value={config.docMax}
                    onChange={handleChange}
                    min={1}
                />
                </Form.Group>
            </Col>
            </Row>

            <div className="text-end">
            <Button variant="primary" onClick={handleGuardar}>
                <i className="bi bi-save me-2"></i>
                Guardar Configuración
            </Button>
            </div>
        </Form>
        </Card.Body>
    </Card>
    </Container>

    {showValidationMessage && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                    <div className="toast align-items-center text-white bg-danger border-0 show">
                        <div className="d-flex">
                            <div className="toast-body">
                                    {toastMessage}
                            </div>
                        </div>
                    </div> 
                    </div>
             )}

    {/* Confirmation Modal */}
    <Modal show={showConfirmation} onHide={cancelSubmit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>¿Confirmar el cambio de configuración?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelSubmit}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={confirmSubmit}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccess} onHide={() => {}} centered>
                <Modal.Body className="text-center p-4">
                    <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h3>Configuración actualizada exitosamente</h3>
                    <p>Redirigiendo...</p>
                </Modal.Body>
            </Modal>
    </div>
  );
};

export default ConfiguracionGlobal;
