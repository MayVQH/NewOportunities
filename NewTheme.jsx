import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, ListGroup, Alert, Modal, Row, Col, Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const NewTheme = () => {
    const navigate = useNavigate();
    const [themeName, setThemeName] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [questions, setQuestions] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleAddQuestion = () => {
        if (!currentQuestion.trim()) {
            setError('La pregunta no puede estar vacía');
            return;
        }

        const cleanQuestion = (str) => {
            return str
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
                .replace(/^[¿?]+|[¿?]+$/g, '') // quita ¿ o ? del inicio o final
                .trim()
                .toLowerCase();
        };

        const normalizedCurrent = cleanQuestion(currentQuestion);

        if (questions.some(q => cleanQuestion(q) === normalizedCurrent)) {
            setError('Esta pregunta ya existe en el tema');
            return;
        }

        setQuestions([...questions, currentQuestion.trim()]);
        setCurrentQuestion('');
        setError('');
    };

    const handleQuestionChange = (e) => {
        setCurrentQuestion(e.target.value);
        if (error) setError('');
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleSubmit = () => {
        if (!themeName.trim()) {
            setError('El nombre del tema es requerido');
            return;
        }

        if (questions.length === 0) {
            setError('Debe agregar al menos una pregunta');
            return;
        }

        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmation(false);

        try {
            const response = await fetch('http://localhost:3000/api/themes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: themeName,
                    preguntas: questions
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el tema');
            }

            setShowSuccess(true);
            setTimeout(() => navigate('/temas'), 2000);
        } catch (error) {
            console.error('Submission error:', error);
            setError(`Error: ${error.message}`);
        }
    };

    const cancelSubmit = () => {
        setShowConfirmation(false);
    };

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col className="d-flex justify-content-between align-items-center">
                    <h1>Nuevo Tema</h1>
                    <Button variant="outline-secondary" onClick={() => navigate('/temas')}>
                        Volver
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <Card className="mb-4">
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del tema</Form.Label>
                        <Form.Control
                            type="text"
                            value={themeName}
                            onChange={(e) => { setThemeName(e.target.value); if (error) setError(''); }}
                            placeholder="Nombre del nuevo Tema"
                        />
                    </Form.Group>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Agregar pregunta</Form.Label>
                        <div className="d-flex">
                            <Form.Control
                                type="text"
                                value={currentQuestion}
                                onChange={handleQuestionChange}
                                placeholder="Nueva pregunta"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                            />
                            <Button 
                                variant="primary" 
                                onClick={handleAddQuestion}
                                disabled={!currentQuestion.trim()}
                                className="ms-2"
                            >
                                <i className="bi bi-plus-lg"></i>
                            </Button>
                        </div>
                    </Form.Group>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <h4 className="mb-3">Preguntas agregadas:</h4>
                    {questions.length === 0 ? (
                        <p className="text-muted">No hay preguntas agregadas</p>
                    ) : (
                        <ListGroup>
                            {questions.map((question, index) => (
                                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                    {question}
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleRemoveQuestion(index)}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>

            <div className="text-center">
                <Button 
                    variant="success" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!themeName.trim() || questions.length === 0}
                >
                    Crear Tema
                </Button>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showConfirmation} onHide={cancelSubmit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>¿Confirmar creación del tema?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Nombre del tema:</strong> {themeName}</p>
                    <p><strong>Preguntas:</strong></p>
                    <ListGroup>
                        {questions.map((q, i) => (
                            <ListGroup.Item key={i}>{q}</ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
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
                    <h3>Tema creado exitosamente</h3>
                    <p>Redirigiendo...</p>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default NewTheme;