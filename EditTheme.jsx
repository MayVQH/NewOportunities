import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Alert, Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const normalizeText = (text) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
        .trim()
        .toLowerCase();
};

const normalizeForDisplay = (str) => {
    let core = str.replace(/^[¿?]+|[¿?]+$/g, '').trim();
    core = core.charAt(0).toUpperCase() + core.slice(1);
    return `¿${core}?`;
};

const hasSymbolAtEdges = (text) => /^[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+|[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/.test(text.trim());

const isOnlySpecialCharsOrNumbers = (text) => {
    const cleaned = text.trim();
    const hasLetters = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(cleaned); // acepta letras con acentos y eñes
    return !hasLetters;
};


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
    const [editingQuestions, setEditingQuestions] = useState({});

    useEffect(() => {
        const fetchThemeData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/themes/full/${id}`);
                console.log('response',response)
                if (!response.ok) throw new Error('Error cargando el tema');
                
                const themeData = await response.json();
                console.log(themeData)

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

        const normalizedInput = normalizeText(newQuestion);
        const allQuestions = [...theme.activeQuestions, ...theme.inactiveQuestions];
        const isDuplicate = allQuestions.some(q => normalizeText(q.text) === normalizedInput);

        if (isDuplicate) {
            setError('Esta pregunta ya existe en el tema');
            return;
        }

        if (isOnlySpecialCharsOrNumbers(newQuestion)) {
            setError('La pregunta debe contener al menos una letra.');
            return;
        }

        if (hasSymbolAtEdges(newQuestion)) {
            setError('La pregunta no debe comenzar ni terminar con símbolos.');
            return;
        }


        const formatted = normalizeForDisplay(newQuestion);

        setTheme(prev => ({
            ...prev,
            activeQuestions: [
                ...prev.activeQuestions,
                {id: `temp-${Date.now()}`, text: formatted}
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

    const handleEditQuestion = (questionId) => {
        //setHabilitado(true)
        console.log(questionId)

        const input = document.getElementById('editq'+questionId) ;
        input.disabled = false

        if (!editingQuestions[questionId]) {
            const original = theme.activeQuestions.find(q => q.id === questionId)?.text || '';
            setEditingQuestions(prev => ({
                ...prev,
                [questionId]: original
            }));
        }
    };

    const handleChange = (id, newValue) => {
        // if (!newValue.trim()) {
        //     setError('La pregunta no puede estar vacía');
        //     return;
        // }

        const normalizedInput = normalizeText(newValue);

        // if (isOnlySpecialCharsOrNumbers(normalizedInput)) {
        //     setError('La pregunta debe contener al menos una letra.');
        //     return;
        // }

        // if (hasSymbolAtEdges(normalizedInput)) {
        //     setError('La pregunta no debe comenzar ni terminar con símbolos.');
        //     return;
        // }

        //const formatted = normalizeForDisplay(newValue);

        const actualizadas = theme.activeQuestions.find(a => a.id == id);
        actualizadas.text = normalizedInput;
        //console.log('pregunta activada',theme.activeQuestions)
      };

    const handleCancelEdit = (questionId) => {
    const original = editingQuestions[questionId];
    if (original !== undefined) {
        // Revertir en el DOM
        const input = document.getElementById('editq' + questionId);
        input.value = original;
        input.disabled = true;

        // Restaurar en estado
        setTheme(prev => ({
            ...prev,
            activeQuestions: prev.activeQuestions.map(q =>
                q.id === questionId ? { ...q, text: original } : q
            )
        }));

        setEditingQuestions(prev => {
            const newEdits = { ...prev };
            delete newEdits[questionId];
            return newEdits;
        });
    }
    };

    const handleSubmit = async () => {
        const validatedQuestions = [];

        for (let q of theme.activeQuestions) {
            const original = q.text.trim();

            if (!original) {
                setError('Hay preguntas vacías. Verifica antes de guardar.');
                return
            }

            if (hasSymbolAtEdges(original)) {
                setError(`La pregunta "${original}" tiene símbolos al inicio o final.`);
                return
            }

            if (isOnlySpecialCharsOrNumbers(original)) {
                setError(`La pregunta "${original}" debe contener al menos una letra.`);
                return
            }

            const formatted = normalizeForDisplay(original);
            validatedQuestions.push({ ...q, text: formatted });
        }

        try {
            const response = await fetch(`http://localhost:3000/api/themes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: theme.name,
                    activeQuestions: validatedQuestions,
                    inactiveQuestions: theme.inactiveQuestions
                })
            });

    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error updating theme');
            }

            console.log(theme.activeQuestions)
    
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
                                            <input type="text" id={`editq${question.id}`} defaultValue={question.text} 
                                            onChange={(e) => handleChange(question.id, e.target.value)} disabled/>
                                            <div>
                                            {editingQuestions[question.id] ? (
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleCancelEdit(question.id)}
                                                >
                                                    <i className="bi bi-x-circle"></i>
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditQuestion(question.id)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                            )}
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleDeactivateQuestion(question.id)}
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