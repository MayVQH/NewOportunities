import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Keyquestion from "./KeyQuestions";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);
  const [keyQuestions, setKeyQuestions] = useState([]);
  const [allInfo, setAllInfo] = useState([]);
  const [temaCountsData, setTemaCountsData] = useState([]);
  const [tiempoPromedio, setTiempoPromedio] = useState('');
  const [similitudDecision, setSimilitudDecision] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);

    const handleMessage = (event) => {
      if (event.origin === import.meta.env.VITE_BACKEND_ORIGIN && event.data.user) {
        sessionStorage.setItem("user", JSON.stringify(event.data.user));
        setUser(event.data.user);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
          const fetchThemes = async () => {
              try {
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes`);
                  if (!response.ok) {
                      const errorData = await response.json().catch(() => ({
                          message: 'Error desconocido'
                      }));
                      throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                  }
  
                  const data = await response.json();
                  console.log('respuesta',data)
                  setThemes(data.map(theme => ({
                      id: theme.id,
                      nombre: theme.nombre,
                      questions: theme.preguntas || [],
                      flag:theme.flag
                  })));
              } catch (error) {
                  console.error('Error obteniendo los datos', error);
              }
          };
  
          fetchThemes();
      }, []);

  useEffect(() => {
      const fetchKeyQuestion = async () => {
          try {
              const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/preguntaClave/all`);
              if (!response.ok) {
                  const errorData = await response.json().catch(() => ({
                      message: 'Error desconocido'
                  }));
                  throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
              }

              const data = await response.json();
              console.log('respuesta preguntas clave',data)

              const formattedQuestions = data.recordset.map((question) => ({
                  id: question.id,
                  nombre: question.nombre,
                  hora_creacion: new Date(question.hora_creacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }),
                  creador: question.creador,
                  decision: question.decisionFinal,
                  comentario: question.comentario,
                  creador_nombre : question.creador_p, 
                  comentarioFinal : question.comentarioFinal,
                  estatus : question.estado,
                  decisionPosterior : question.decisionImplementada,
                  hora_finalizacion : new Date(question.hora_finalizacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
                  horaCreacion_sf : new Date(question.hora_creacion),
                  horaFinalizacion_sf : new Date(question.hora_finalizacion)
                }));

                let totalDuracion = 0;
                let count = 0;

                formattedQuestions.forEach(q => {
                  if (q.horaCreacion_sf && q.horaFinalizacion_sf) {
                    const duracion = q.horaFinalizacion_sf - q.horaCreacion_sf;
                    if (!isNaN(duracion) && duracion > 0) {
                      totalDuracion += duracion;
                      count++;
                    }
                  }
                });

                const promedioMs = totalDuracion / count;
                const promedioDias = promedioMs / (1000 * 60 * 60 * 24);

                const tiempoPromedioTexto = `${promedioDias.toFixed(1)} días`

                setTiempoPromedio(tiempoPromedioTexto);
                
                setKeyQuestions(formattedQuestions);

                

                let comparables = 0;
                let iguales = 0;

                formattedQuestions.forEach(q => {
                  if (q.decision!= null && q.decisionPosterior != null) {
                    comparables++;
                    if (q.decision == q.decisionPosterior) {
                      iguales++;
                    }
                  }
                })
                console.log('totales de preguntas',comparables)
                console.log('totales iguales',iguales)

                const porcentajeSimilitud = comparables > 0 ? ((iguales / comparables) * 100).toFixed(1) : '0.0';
                console.log(`Similitud decisión: ${porcentajeSimilitud}%`);
                setSimilitudDecision(`${porcentajeSimilitud}`);
                    }catch (error) {
                        console.error('Error obteniendo los datos', error);
                    }      
        }
        fetchKeyQuestion();
    }, []);

    useEffect(() => {
      const fetchAllInformation = async () => {
          try {
              const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/informacion/all`);
              if (!response.ok) {
                  const errorData = await response.json().catch(() => ({
                      message: 'Error desconocido'
                  }));
                  throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
              }

              const data = await response.json();
              console.log('respuesta informacion completa',data)

              const formattedQuestions = data.recordset.map((question) => ({
                  id: question.id,
                  pc_id: question.pc_id,
                  texto: question.texto,
                  flag: question.flag,
                  tema_id: question.tema_id,
                  pregunta_id : question.preguntaTema_id, 
                  nombreTema : question.nombreTema
                }));
                
                setAllInfo(formattedQuestions);

                // Agrupar por pc_id para obtener una lista única de preguntas clave
                const uniquePcTema = new Map();

                for (const item of formattedQuestions) {
                  const key = `${item.pc_id}-${item.nombreTema}`;
                  if (!uniquePcTema.has(key)) {
                    uniquePcTema.set(key, {
                      nombreTema: item.nombreTema,
                      pc_id: item.pc_id,
                    });
                  }
                }

                // Contar cuantas veces aparece cada nombreTema asociado a preguntas clave distintas
                const temaCounts = {};
                for (const { nombreTema } of uniquePcTema.values()) {
                  temaCounts[nombreTema] = (temaCounts[nombreTema] || 0) + 1;
                }

                // Formatear para la gráfica de barras
                let temasData = Object.entries(temaCounts).map(([name, total]) => ({
                  name,
                  total,
                }));

                // Ordenar de mayor a menor y tomar solo el top 5
                temasData = temasData.sort((a, b) => b.total - a.total).slice(0, 5);

                setTemaCountsData(temasData);

                console.log(allInfo)
          }catch (error) {
              console.error('Error obteniendo los datos', error);
          }
        }

        fetchAllInformation();
    }, []);

    if (loading) {
      return (
        <Container fluid className="d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      );
    }
  
    const activeThemesCount = themes.filter(theme => theme.flag).length;
    const finalizadasCount = keyQuestions.filter(q => q.estatus == 'Finalizado').length;
    const pendientesCount = keyQuestions.filter(q => q.estatus == 'Pendiente').length;
    const PosteriorCount = keyQuestions.filter(q => q.decisionPosterior != null).length;
  
    console.log('las preguntas con retroalimentacion son',PosteriorCount)
  
    const filtradoPreguntas = keyQuestions.filter(q => q.decision != null)
    const preguntasSi = filtradoPreguntas.filter(q => q.decision == 1)
    const preguntasNo = filtradoPreguntas.filter(q => q.decision == 0)
  
    const decisionData = [
      { name: 'Sí', value: preguntasSi.length },
      { name: 'No', value: preguntasNo.length }
    ];
    
    const preguntasCoinciden = keyQuestions.filter(
      q => q.decision != null && q.decisionPosterior != null && q.decision == 1 && q.decisionPosterior == 1
    );
    
    const preguntasTotalComparables = keyQuestions.filter(
      q => q.decision != null && q.decisionPosterior != null && q.decision == 1
    );
    
    const implementData = [
      { name: 'Respuesta sí', value: preguntasCoinciden.length },
      { name: 'Respuesta no ', value: preguntasTotalComparables.length - preguntasCoinciden.length }
    ];
  
  
    const preguntasCoincidenSiNo = keyQuestions.filter(
      q => q.decision != null && q.decisionPosterior != null && q.decision == 0 && q.decisionPosterior == 0
    );
    
    const preguntasTotalComparablesNo = keyQuestions.filter(
      q => q.decision != null && q.decisionPosterior != null && q.decision == 0
    );
    
    const implementDataNo = [
      { name: 'Respuesta no', value: preguntasCoincidenSiNo.length },
      { name: 'Respuesta sí', value: preguntasTotalComparablesNo.length - preguntasCoincidenSiNo.length }
    ];

    const porcentajeNumerico = parseFloat(similitudDecision);
    const colorTexto = porcentajeNumerico >= 80 ? '#28a745' : '#dc3545'; 
    
    const COLORS = ['#007bff', '#dc3545'];
  
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14}>
        {(percent * 100).toFixed(0)}%
      </text>
      );
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar with centered options */}
      <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
                <Container fluid>
                    <Navbar.Brand className="d-flex align-items-center me-auto"> {/* Changed to me-auto */}
                        <img
                            src={user.photo}
                            alt={user.displayName}
                            className="rounded-circle me-2"
                            width="40"
                            height="40"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0078d4&color=fff`;
                            }}
                        />
                        <span className="d-none d-sm-inline">{user.displayName}</span>
                    </Navbar.Brand>
                    
                    <Navbar.Toggle aria-controls="main-navbar" />
                    
                    <Navbar.Collapse id="main-navbar">
                        <Nav className="mx-auto"> {/* Changed to mx-auto to center the nav items */}
                            {(user.tipoId === import.meta.env.VITE_COM_UID || user.tipoId === import.meta.env.VITE_MODER_UID) && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>)}
                            {(user.tipoId === import.meta.env.VITE_USER_UID) && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntaClave/pregunta/lista")}>Preguntas Clave</Nav.Link>)}
                            {(user.tipoId === import.meta.env.VITE_COM_UID || user.tipoId === import.meta.env.VITE_MODER_UID) && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/temas")}>Temas</Nav.Link>)}
                            {(user.tipoId === import.meta.env.VITE_COM_UID) && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/enrolamiento")}>Enrolamiento</Nav.Link>)}
                            {(user.tipoId === import.meta.env.VITE_COM_UID || user.tipoId === import.meta.env.VITE_MODER_UID) && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>)}
                            {(user.tipoId === import.meta.env.VITE_COM_UID) && (   
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/configuracion")} title="Configuración">
                              <i className="bi bi-gear" style={{ fontSize: '1.2rem' }}></i>
                            </Nav.Link>)}
                        </Nav>
                        <Button variant="outline-light" className="ms-auto" onClick={handleLogout}>Sign out</Button> {/* Changed to ms-auto */}
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Area de graficas */}
            <Container fluid className="flex-grow-1 py-4">
              <Row className="g-4">
                {/* Calendario  + Efectividad debajo */}
                <Col lg={4} className="order-lg-1 d-flex flex-column">
                  

                  {/* Efectividad + tiempo promedio */}

                  <div className="card bg-white border border-secondary-subtle shadow-sm mt-3 text-center p-3">
                    <h5 className="card-title mb-2 text-dark">Temas activos</h5>
                    <h1 className="fw-bold" style={{ color: '#003366' }}>{activeThemesCount}</h1>
                  </div>

                  <div className="card bg-white border border-secondary-subtle shadow-sm mt-3 text-center p-3">
                    <h5 className="card-title mb-2 text-dark">Preguntas Clave Pendientes</h5>
                    <h1 className="fw-bold" style={{ color: '#003366' }}>{pendientesCount}</h1>
                  </div>

                  <div className="card bg-white border border-secondary-subtle shadow-sm mt-3 text-center p-3">
                    <h5 className="card-title mb-2 text-dark">Preguntas Clave Finalizadas</h5>
                    <h1 className="fw-bold" style={{ color: '#003366' }}>{finalizadasCount}</h1>
                  </div>

                  <div className="card bg-white border border-secondary-subtle shadow-sm mt-3 text-center p-3">
                    <h5 className="card-title mb-2 text-dark">Preguntas con retroalimentación</h5>
                    <h1 className="fw-bold" style={{ color: '#003366' }}>{PosteriorCount}</h1>
                  </div>

                  <div className="card bg-white border border-secondary-subtle shadow-sm mt-3 text-center p-3">
                    <h5 className="card-title mb-2 text-dark">Concordancia Decisión/Resultado</h5>
                    <h1 className="fw-bold" style={{ color: colorTexto }}>{similitudDecision}%</h1>
                  </div>

                  <div className="card bg-white border border-secondary-subtle shadow-sm mt-3 text-center p-3">
                    <h5 className="card-title mb-2 text-dark">Tiempo promedio de decisión</h5>
                    <h1 className="fw-bold" style={{ color: '#003366' }}>{tiempoPromedio}</h1>
                  </div>
    
                </Col>

                {/* Area principal a la derecha */}
                <Col lg={8} className="order-lg-2">
                  <div className="border rounded p-3 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa' }}>
                

                    <Outlet />

                    {/* Gráficas de pie */}
                    <Row className="mt-4">
                      <Col>
                        <div className="card bg-white border border-secondary-subtle shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title text-dark text-center mb-3">Decisión final de preguntas clave</h5>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={decisionData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={renderCustomizedLabel}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {decisionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </Col>

                      <Col>
                        <div className="card bg-white border border-secondary-subtle shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title text-dark text-center mb-3">Decisión final Si vs Respuesta posterior</h5>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={implementData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={renderCustomizedLabel}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {implementData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </Col>

                      <Col>
                        <div className="card bg-white border border-secondary-subtle shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title text-dark text-center mb-3">Decisión final No vs Respuesta posterior</h5>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={implementDataNo}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={renderCustomizedLabel}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {decisionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </Col>                     
                    </Row>

                    {/* Gráfica de barras */}
                    <Row className="mt-4">
                      <div className="card bg-white border border-secondary-subtle shadow-sm p-3 mt-4">
                        <h5 className="text-center text-dark">Uso de temas en preguntas claves</h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={temaCountsData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" name="Total" fill="#003366">
                              <LabelList dataKey="total" position="top" fill="#000" fontSize={12} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Container>
    </div>
  );
};

export default Dashboard;
