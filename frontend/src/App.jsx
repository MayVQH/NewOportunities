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
import ConfiguracionGlobal from "./components/GlobalConfiguration";



function App() {

    const comite = import.meta.env.VITE_COM_UID
    const moderador = import.meta.env.VITE_MODER_UID
    const usuario = import.meta.env.VITE_USER_UID

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <Dashboard />
          </ProtectedRoute>} />
          <Route path="/preguntas-clave" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <Listtheme />
          </ProtectedRoute>} />
          <Route path="/temas" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <Temas /> 
          </ProtectedRoute>}/>
          <Route path="/enrolamiento" element={<ProtectedRoute allowedRoles={[comite]}>
              <PruebaRoles />
          </ProtectedRoute>} />
          <Route path="/temas/nuevo" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <NewTheme />
          </ProtectedRoute>} />
          <Route path="/temas/editar/:id" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <EditTheme />
          </ProtectedRoute>} />
          <Route path="/preguntas-clave/nuevaPregunta" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <Keyquestion />
          </ProtectedRoute>} />
          <Route path="/preguntas-clave/ReportePreguntas/:id" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <Reportquestion />
          </ProtectedRoute>} />
          <Route path="/temas/tema/editar" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <EditAllTheme />
          </ProtectedRoute>} />
          <Route path="/preguntaClave/pregunta/contestar/:id" element={<ProtectedRoute allowedRoles={[comite, moderador,usuario]}>
              <UserKeyQuestion />
          </ProtectedRoute>} />
          <Route path="/preguntaClave/pregunta/lista" element={<ProtectedRoute allowedRoles={[comite, moderador,usuario]}>
          <ListKeyQuestion />
          </ProtectedRoute>}/>
          <Route path="/detalle/preguntaClave/:pcp_id/:pc_id" element={<ProtectedRoute allowedRoles={[comite, moderador]}>
              <KeyquestionDetail />
          </ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute allowedRoles={[comite]}>
              <ConfiguracionGlobal />
          </ProtectedRoute>} />
        </Routes> 
      </Router>
    )
  }

export default App
