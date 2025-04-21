import React, { useState } from "react";
import { useNavigate} from "react-router-dom"; 
import "../Styles/NewTheme.css"

const NewTheme = () => {
    const navigate = useNavigate();
    const [themeName,setThemeName] = useState('');
    const [questions,setQuestions] = useState(['']);
    const [showConfirmation,setShowConfirmation] = useState(false);
    const [showSuccess,setShowSuccess] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([...questions,''])
    };

    const handleQuestionChange = (index,value) =>{
        const newQuestion = [...questions];
        newQuestion[index] = value;
        setQuestions(newQuestion);
    };

    const handleSubmit = () =>{
        setShowConfirmation(true);
    };

    const confirmSubmit = async () =>{
        setShowConfirmation(false)

        try{
            const response = await fetch('http://localhost:3000/api/themes',{
                method:'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({
                    nombre:themeName,
                    preguntas:questions.filter(q => q.trim() !== '')
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el tema');
              }

            setShowSuccess(true);
            setTimeout(() => window.location.href = '/temas', 2000);
        } catch (error){
            console.error('Submission error:', error);
            alert(`Error: ${error.message}`);
        } 
   
    };

    const cancelSubmit = () =>{
        setShowConfirmation(false);
    };

    return (
        <div className="new-theme-container">
            <div className="new-theme-header">
                <h1>Nuevo Tema</h1>
                <button onClick={() => navigate('/temas')} className="back-button">
                    Volver
                </button>
            </div>
            <div className="theme-form">
                <div className="form-group">
                    <input type="text" value={themeName} onChange={(e) => setThemeName(e.target.value)}
                    placeholder="Nuevo Tema">
                    </input>
                </div>
                <div className="question-section">
                    {questions.map((question,index) =>(
                        <div className="question-input" key={index}>
                            <input type="text" value={question} onChange={(e) => handleQuestionChange(index,e.target.value)}
                            placeholder={`Pregunta ${index + 1}`}>
                            </input>
                        </div>
                    )
                    )}
                <button className="add-question-btn" onClick={handleAddQuestion}>
                    +
                </button>
                </div>
                <div className="preview-section">
                    {themeName && (
                        <div className="theme-preview">
                            <h4>{themeName}</h4>
                            <ul>
                                {questions.filter(q => q.trim() !== '').map((question,index) => (
                                    <li key={index}>{question}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <button onClick={handleSubmit} className="submit-btn">
                    Enviar
                </button>
            </div>
            {/* Confirmación de envio */}
            {showConfirmation && (
                <div className="modal-overlay">
                    <div className="confirmation-modal">
                        <h3>¿Estas seguro de enviar el nuevo tema?</h3>
                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={cancelSubmit}>
                                Cancelar
                            </button>
                            <button className="confirm-btn" onClick={confirmSubmit}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Envio exitoso */}
            {showSuccess && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <div className="success-icon">
                            ✓
                        </div>
                        <h3>Tema enviado con éxito</h3>
                    </div>
                </div>
            )}
        </div>
    )


}

export default NewTheme;