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
import VentanaConfiguracion from "./components/GlobalConfiguration"; 


function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <Dashboard />
          </ProtectedRoute>} />
          <Route path="/preguntas-clave" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <Listtheme />
          </ProtectedRoute>} />
          <Route path="/temas" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <Temas /> 
          </ProtectedRoute>}/>
          <Route path="/enrolamiento" element={<ProtectedRoute allowedRoles={["7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <PruebaRoles />
          </ProtectedRoute>} />
          <Route path="/temas/nuevo" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <NewTheme />
          </ProtectedRoute>} />
          <Route path="/temas/editar/:id" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <EditTheme />
          </ProtectedRoute>} />
          <Route path="/preguntas-clave/nuevaPregunta" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <Keyquestion />
          </ProtectedRoute>} />
          <Route path="/preguntas-clave/ReportePreguntas/:id" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <Reportquestion />
          </ProtectedRoute>} />
          <Route path="/temas/tema/editar" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <EditAllTheme />
          </ProtectedRoute>} />
          <Route path="/preguntaClave/pregunta/contestar/:id" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017",
            "84F03A04-2891-4DE7-8A3D-DBD2018EAE47"
          ]}>
              <UserKeyQuestion />
          </ProtectedRoute>} />
          <Route path="/preguntaClave/pregunta/lista" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017",
            "84F03A04-2891-4DE7-8A3D-DBD2018EAE47"
          ]}>
          <ListKeyQuestion />
          </ProtectedRoute>}/>
          <Route path="/detalle/preguntaClave/:pcp_id/:pc_id" element={<ProtectedRoute allowedRoles={["D3B78325-006E-4230-AE7E-C188181AE8B8", "7D532F89-A63E-4667-B7CB-A4B477A55017"]}>
              <KeyquestionDetail />
          </ProtectedRoute>} />
        </Routes> 
      </Router>
    )
  }

export default App
