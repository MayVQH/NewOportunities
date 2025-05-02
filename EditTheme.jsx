import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../Styles/EditTheme.css";

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
            activeQuestions : [
                ...prev.activeQuestions,
                {id:`temp-${Date.now()}`, text: newQuestion.trim()}
            ]
        }));
        setNewQuestion('');
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
    
            // Show success and redirect
            setShowSuccess(true);
            setTimeout(() => navigate('/temas'), 2000);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        
        <div className="edit-theme-container">
            {error && <div className="error-message">{error}</div>}
            <div className="theme-header">
                <h2>{theme.name}</h2>
                <button onClick={() => navigate('/temas')}>Volver</button>
            </div>
    
            {/* Active Questions */}
            <div className="questions-section">
                <h3>Preguntas Activas</h3>
                {theme.activeQuestions.length === 0 ? (
                    <p>No hay preguntas activas</p>
                ) : (
                    <ul>
                        {theme.activeQuestions.map((question) => (
                            <li key={question.id}>
                                <span>{question.text}</span>
                                <div className="question-actions">
                                    <button onClick={() => handleDeactivateQuestion(question.id)}>
                                        Desactivar
                                    </button>
                                    <button onClick={() => handleRemoveQuestion(question.id)}>
                                        ×
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
    
            {/* Inactive Questions */}
            <div className="questions-section">
                <h3>Preguntas Inactivas</h3>
                {theme.inactiveQuestions.length === 0 ? (
                    <p>No hay preguntas inactivas</p>
                ) : (
                    <ul>
                        {theme.inactiveQuestions.map((question) => (
                            <li key={question.id}>
                                <span>{question.text}</span>
                                <button onClick={() => handleReactivateQuestion(question.id)}>
                                    Activar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
    
            {/* Add New Question */}
            <div className="add-question">
                <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Nueva pregunta"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                />
                <button onClick={handleAddQuestion}>Agregar</button>
            </div>
    
            {/* Submit Button */}
            <button 
                onClick={handleSubmit}
                disabled={theme.activeQuestions.length === 0}
            >
                Guardar Cambios
            </button>
    
            {/* Success Modal */}
            {showSuccess && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <div>✓</div>
                        <h3>Tema actualizado correctamente</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditTheme;