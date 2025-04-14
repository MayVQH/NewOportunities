import React, { useEffect } from "react";
import Login from "./components/login"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PreguntasClave from "./components/Questions";
import Temas from "./components/Themes";
import Enrolamiento from "./components/Enroll";
import NewTheme from "./components/NewTheme";


function App() {

  useEffect (() => {
    fetch('http://localhost:3000/auth/check-session', {
      credentials: 'include'
    })
    .then (res => res.json())
    .then (data => {
      if (!data.authenticated) {
        window.location.href = 'http://localhost:3000/auth/microsoft'
      }
    });
  } ,[]);
  

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/preguntas-clave" element={<PreguntasClave />} />
          <Route path="/temas" element={<Temas />} />
          <Route path="/enrolamiento" element={<Enrolamiento />} />
          <Route path="/temas/nuevo" element={<NewTheme />} />
        </Routes>
      </Router>
    )
  }

export default App
