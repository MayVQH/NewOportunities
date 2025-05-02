//import React, { useEffect } from "react";
import Login from "./components/login"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PreguntasClave from "./components/Questions";
import Temas from "./components/Themes";
import Enrolamiento from "./components/Enroll";
import NewTheme from "./components/NewTheme";
import EditTheme from "./components/EditTheme";
import PruebaRoles from "./components/Roles";
import Keyquestion from "./components/KeyQuestions";
import Reportquestion from "./components/ReportQuestions";
import Listtheme from "./components/ListTheme";


function App() {

  

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/preguntas-clave" element={<Listtheme />} />
          <Route path="/temas" element={<Temas />} />
          <Route path="/enrolamiento" element={<PruebaRoles />} />
          <Route path="/temas/nuevo" element={<NewTheme />} />
          <Route path="/temas/editar/:id" element={<EditTheme />} />
          <Route path="/preguntas-clave/nuevaPregunta" element={<Keyquestion />} />
          <Route path="/preguntas-clave/ReportePreguntas" element={<Reportquestion />} />
        </Routes> 
      </Router>
    )
  }

export default App
