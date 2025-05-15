//import React, { useEffect } from "react";
import Login from "./components/login"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Temas from "./components/Themes";
import NewTheme from "./components/NewTheme";
import EditTheme from "./components/EditTheme";
import PruebaRoles from "./components/Roles";
import Keyquestion from "./components/KeyQuestions";
import Reportquestion from "./components/ReportQuestions";
import Listtheme from "./components/ListTheme";
import ProtectedRoute from "./components/ProtectedRoutes";
import Unauthorized from "./components/Unauthorized";
import EditAllTheme from "./components/EditAllTheme";
import UserKeyQuestion from "./components/userKeyQuestion";
import ListKeyQuestion from "./components/ListKeyQuestion";
import KeyquestionDetail from "./components/KeyQuestionDetail";


function App() {

//const typeUser= Array(["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"])
  

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
            <Dashboard />
          </ProtectedRoute>} />
          <Route path="/preguntas-clave" element={<Listtheme />} />
          <Route path="/temas" element={<Temas />} />
          <Route path="/enrolamiento" element={<PruebaRoles />} />
          <Route path="/temas/nuevo" element={<NewTheme />} />
          <Route path="/temas/editar/:id" element={<EditTheme />} />
          <Route path="/preguntas-clave/nuevaPregunta" element={<Keyquestion />} />
          <Route path="/preguntas-clave/ReportePreguntas/:id" element={<Reportquestion />} />
          <Route path="/temas/tema/editar" element={<EditAllTheme />} />
          <Route path="/preguntaClave/pregunta/contestar/:id" element={<UserKeyQuestion />} />
          <Route path="/preguntaClave/pregunta/lista" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017",
            "84F03A04-2891-4DE7-8A3D-DBD2018EAE47"
          ]}>
          <ListKeyQuestion />
          </ProtectedRoute>}/>
          <Route path="/detalle/preguntaClave/:pcp_id/:pc_id" element={<KeyquestionDetail />} />
        </Routes> 
      </Router>
    )
  }

export default App
