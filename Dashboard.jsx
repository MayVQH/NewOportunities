import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../Styles/Dashboard.css"

const Dashboard = () => {
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
    <div className="dashboard-container">
        <nav className="dashboard-nav">
            <div className="nav-user-profile">
                <img src={user.photo} alt={user.displayName} className="user-avatar"
                     onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0078d4&color=fff`;
                     }}
                />
                <span className="user-name">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">Sign out</button>
        </nav>
        <main className="dashboard-main">
            <h1>Bienvenido al dashboard</h1>
            <p>Email:{user.email}</p>
        </main>
    </div>
  );
};

export default Dashboard;