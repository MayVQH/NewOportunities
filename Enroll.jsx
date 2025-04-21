import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom"; 
import "../Styles/Enroll.css"

const Enrolamiento = () => {
    const [user, setUser] = useState(null);
    const [loading,setLoading] = useState(true);
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
    
        const handleLogout = () => {
            sessionStorage.removeItem("user");
            navigate("/");
        };

    if (loading){
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }
  return (
    <div className="enroll-container">
        <nav className="enroll-nav">
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
    </div> 
  )
};

export default Enrolamiento;