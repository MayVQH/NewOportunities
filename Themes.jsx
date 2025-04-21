import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom"; 
import "../Styles/Themes.css"

const Temas = () => {
    const [user, setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    const [themes, setThemes] = useState([]); 
    const navigate = useNavigate();

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

        useEffect(() => {
            const fetchThemes = async () => {
                try{
                    const response = await fetch('http://localhost:3000/api/themes');
                    if (!response.ok) throw new Error ('La respuesta de la web no fue satisfactoria');
                    const data = await response.json();
                    const parsedThemes = data.map(theme => ({
                        ...theme,
                        questions: JSON.parse(theme.preguntas)
                    }));
                    setThemes(parsedThemes);
                } catch (error){
                    console.error('Error obteniendo los datos', error);
                }
            };

        fetchThemes();
        },[]);
    
        const handleLogout = () => {
            sessionStorage.removeItem("user");
            navigate("/");
        };


        const handleDeleteTheme = async (themeId) => {
            if (!window.confirm('Estas seguro de eliminar este tema')) return;

            try{
                const response = await fetch(`http://localhost:3000/api/themes/${themeId}`,{
                    method:'DELETE'
                });
            if (!response.ok) throw new Error('Error al eliminar el tema');

            setThemes(themes.filter(theme => theme.id !== themeId));
            }catch(error){
                console.error('Error al eliminar el tema', error);
                alert('Error al eliminar el tema')
            }
          };

    if (loading){
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

     


return (
    <div className="theme-container">
        <nav className="theme-nav">
            <div className="nav-user-profile">
                <img src={user.photo} alt={user.displayName} className="user-avatar"
                     onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0078d4&color=fff`;
                     }}
                />
                <span className="user-name">{user.displayName}</span>
            </div>
            <div className="nav-menu">
                <span className="preguntaClave" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</span>
                <span className="temas" onClick={() => navigate("/temas")}>Temas</span>
                <span className="enrolamiento" onClick={() => navigate("/enrolamiento")}>Enrolamiento</span>
                <span className="dashboard" onClick={() => navigate("/dashboard")}>Dashboard</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">Sign out</button>
        </nav>
        
        <div className="themes-content">
            <div className="themes-header">
            <h1>Temas</h1>
            <button 
                className="add-theme-btn"
                onClick={() => navigate("/temas/nuevo")}
            >
                +
            </button>
            </div>
            <div className="themes-list">
                {themes.map((theme) => (
                    <div key={theme.id} className="theme-card">
                        <div className="theme-header">
                            <h3>{theme.nombre}</h3>
                            <div className="theme-actions">
                                <button className="edit-btn" onClick={() => navigate(`/temas/editar/${theme.id}`)}>
                                    Editar
                                </button>
                                <button className="delete-btn" onClick={() => handleDeleteTheme(theme.id)}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <ul className="question-list">
                            {theme.questions.map((question,index) =>(
                                <li key={index}>{question}</li>
                            )
                            )}
                        </ul>
                    </div>
                )
                )}
            </div>
        </div>
    </div> 
)
};

export default Temas;

