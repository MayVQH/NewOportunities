import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");

    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/"); 
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      {user ? (
        <div>
          <h1>Bienvenido al Dashboard</h1>
          <h2>{user.displayName}</h2>
          <p>Email: {user.emails[0].value}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default Dashboard;