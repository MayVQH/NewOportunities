import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Alert, Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const ActivateAllTheme = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [themes, setThemes] = useState([]); 
    const [theme] = useState({name: ''});

    useEffect(() => {
            const fetchThemes = async () => {
                try {
                    const response = await fetch('http://localhost:3000/api/themes/getall');
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({
                            message: 'Error desconocido'
                        }));
                        throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                    }
    
                    const data = await response.json();

                    const transformedThemes = data.map((t) => ({
                        id: t.id,
                        name: t.nombre,
                        flag: t.flag, 
                        questions: t.preguntas || [], 
                    }));

                    setThemes(transformedThemes);
                    setLoading(false);
                    

                    console.log('respuesta ultima',data)  
                }
                
                    
                
                catch (error) {
                    console.error('Error obteniendo los datos', error);
                    setError('No se pudieron cargar los temas');
                    setLoading(false);
                }
            };
    
            fetchThemes();
        }, []);
  

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    const handleReactivateTheme = (themeId) => {
        console.log('id inicial',themeId)
        setThemes(prevThemes =>
            prevThemes.map(theme =>
                theme.id == themeId ? { ...theme, flag: 1 } : theme
            )
        );
    };

    const handleSubmit = async () => {
        console.log('Enviando temas:', themes);
        try {
            await fetch('http://localhost:3000/api/themes/tema/activateTheme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    themes: themes.map(t => ({
                        flag: t.flag,
                        id: t.id,
                        nombre: t.name,
                        preguntas: t.questions                       
                    }))
                })
            });

            console.log('Vamos por aqui')
            setShowSuccess(true);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
    };

    return (
        <Container className="py-4">
            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>{theme.name}</h2>
                        <Button variant="outline-secondary" onClick={() => navigate('/temas')}>
                            Volver
                        </Button>
                    </div>
                </Col>
            </Row>

            {/*Temas activos */}
            <Row>
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Temas Activos</Card.Header>
                        <Card.Body>
                            {themes.filter(t => t.flag == 1).map(t => (
                                <div key={t.id} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6>{t.name}</h6>                                   
                                    </div>
                                    <ListGroup variant="flush">
                                        {t.questions.map((q, index) => (
                                            <ListGroup.Item key={index}>
                                                {q}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>                                   
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>


                {/* Temas inactivos */}
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Temas Activos</Card.Header>
                        <Card.Body>
                            {themes.filter(t => t.flag == 0).map(t => (
                                <div key={t.id} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6>{t.name}</h6>
                                        <div>
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => handleReactivateTheme(t.id)}
                                            >
                                                Activar
                                            </Button>
                                        </div>
                                    </div>
                                    <ListGroup variant="flush">
                                        {t.questions.map((q, index) => (
                                            <ListGroup.Item key={index}>
                                                {q}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>                                   
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


            {/* Boton de guardado */}
            <Row className="mb-4">
                <Col className="text-center">
                    <Button 
                        variant="success" 
                        size="lg"
                        onClick={handleSubmit}
                    >
                        Guardar Cambios
                    </Button>
                </Col>
            </Row>

            {/* Dialogo de exito */}
            <Modal show={showSuccess} onHide={() => { setShowSuccess(false); navigate('/temas'); }} centered>
                <Modal.Body className="text-center p-4">
                    <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h3>Tema(s) actualizados(s) correctamente</h3>
                    <p>Redirigiendo a la lista de temas...</p>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ActivateAllTheme;