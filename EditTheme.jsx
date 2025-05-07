import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Alert, Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const EditTheme = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [theme, setTheme] = useState({
        name: '',
        activeQuestions: [],
        inactiveQuestions: []
    });
    const [newQuestion, setNewQuestion] = useState('');

    useEffect(() => {
        const fetchThemeData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/themes/${id}/full`);
                if (!response.ok) throw new Error('Error cargando el tema');
                
                const themeData = await response.json();

                setTheme({
                    name: themeData.nombre,
                    activeQuestions: themeData.activeQuestions || [],
                    inactiveQuestions: themeData.inactiveQuestions || []
                });
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setError('Error cargando el contenido del tema');
                setLoading(false);
            }
        };
        fetchThemeData();
    }, [id]);

    const handleAddQuestion = () => {
        if (!newQuestion.trim()) {
            setError('La pregunta no puede estar vacía');
            return;
        }

        setTheme(prev => ({
            ...prev,
            activeQuestions: [
                ...prev.activeQuestions,
                {id: `temp-${Date.now()}`, text: newQuestion.trim()}
            ]
        }));
        setNewQuestion('');
        setError('');
    };

    const handleDeactivateQuestion = (questionId) => {
        setTheme(prev => {
            const question = prev.activeQuestions.find(q => q.id === questionId);
            return {
                ...prev,
                activeQuestions: prev.activeQuestions.filter(q => q.id !== questionId),
                inactiveQuestions: [...prev.inactiveQuestions, question]
            };
        });
    };

    const handleReactivateQuestion = (questionId) => {
        setTheme(prev => {
            const question = prev.inactiveQuestions.find(q => q.id === questionId);
            return {
                ...prev,
                inactiveQuestions: prev.inactiveQuestions.filter(q => q.id !== questionId),
                activeQuestions: [...prev.activeQuestions, question]
            };
        });
    };

    const handleRemoveQuestion = (questionId) => {
        setTheme(prev => ({
            ...prev,
            activeQuestions: prev.activeQuestions.filter(q => q.id !== questionId)
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/themes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: theme.name,
                    activeQuestions: theme.activeQuestions,
                    inactiveQuestions: theme.inactiveQuestions
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error updating theme');
            }
    
            setShowSuccess(true);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

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

            <Row>
                {/* Active Questions */}
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Preguntas Activas</Card.Header>
                        <Card.Body>
                            {theme.activeQuestions.length === 0 ? (
                                <p className="text-muted">No hay preguntas activas</p>
                            ) : (
                                <ListGroup variant="flush">
                                    {theme.activeQuestions.map((question) => (
                                        <ListGroup.Item key={question.id} className="d-flex justify-content-between align-items-center">
                                            <span>{question.text}</span>
                                            <div>
                                                <Button 
                                                    variant="outline-warning" 
                                                    size="sm" 
                                                    className="me-2"
                                                    onClick={() => handleDeactivateQuestion(question.id)}
                                                >
                                                    Desactivar
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleRemoveQuestion(question.id)}
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Inactive Questions */}
                <Col md={6} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Preguntas Inactivas</Card.Header>
                        <Card.Body>
                            {theme.inactiveQuestions.length === 0 ? (
                                <p className="text-muted">No hay preguntas inactivas</p>
                            ) : (
                                <ListGroup variant="flush">
                                    {theme.inactiveQuestions.map((question) => (
                                        <ListGroup.Item key={question.id} className="d-flex justify-content-between align-items-center">
                                            <span>{question.text}</span>
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => handleReactivateQuestion(question.id)}
                                            >
                                                Activar
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Add New Question */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header as="h5">Agregar Nueva Pregunta</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Nueva pregunta"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                                />
                            </Form.Group>
                            <Button variant="primary" onClick={handleAddQuestion}>
                                Agregar
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Submit Button */}
            <Row className="mb-4">
                <Col className="text-center">
                    <Button 
                        variant="success" 
                        size="lg"
                        onClick={handleSubmit}
                        disabled={theme.activeQuestions.length === 0}
                    >
                        Guardar Cambios
                    </Button>
                </Col>
            </Row>

            {/* Success Modal */}
            <Modal show={showSuccess} onHide={() => { setShowSuccess(false); navigate('/temas'); }} centered>
                <Modal.Body className="text-center p-4">
                    <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h3>Tema actualizado correctamente</h3>
                    <p>Redirigiendo a la lista de temas...</p>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default EditTheme;