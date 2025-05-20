import React, { useEffect,useState } from 'react';
import { useNavigate,useParams } from "react-router-dom";
import DataGrid, { Column, Export, Editing, SearchPanel,HeaderFilter, GroupPanel, Grouping} from 'devextreme-react/data-grid'; 
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css"
import MiniPieChart from './PieChart';
import { Navbar, Nav, Button, Spinner, Container, Row, Col,Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Popup from 'devextreme-react/popup';


const Reportquestion = () => {
    const [user, setUser] = useState(null);
    const { id } = useParams();
    const [loading,setLoading] = useState(true);
    const [keyQuestion, setKeyQuestion] = useState({
                name: '' ,
                id: ''        
            });
    const [pregunta, setPregunta] = useState({
            pregunta_pc: []
        });
    const [respuestas, setRespuestas] = useState({
        totalRespuestas: '' ,
        totalUsuarios: ''        
    });
    const [showPopupCom, setShowPopupCom] = useState(false);
    const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [showPopupUrl, setShowPopupUrl] = useState(false);
    const [showPopupDoc, setShowPopupDoc] = useState(false);
    const [enlaces, setEnlaces] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [comentarioFinal, setComentarioFinal] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [toastMessage,setToastMessage] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [allowContinue, setAllowContinue] = useState(false);
    const [config, setConfig] = useState({});
    const [errorComentario, setErrorComentario] = useState('');
    const navigate = useNavigate();

    const [isSwitchOn, setIsSwitchOn] = useState(false); // Estado para el switch

    const handleSwitchChange = (event) => {
        setIsSwitchOn(event.target.checked); // Cambiar el estado del switch
    };

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

        
        useEffect(() => {
            const fetchThemeData = async () => {
                try {
                    console.log('id de la pregunta clave del front',id)
                    const response = await fetch(`http://localhost:3000/api/themes/preguntasClave/pregunta/full/${id}`);
                    console.log('response',response)
                    if (!response.ok) throw new Error('Error cargando la pregunta clave');
                    
                    const KeyQuestionData = await response.json();
                    console.log('respuesta obtenida de preguntas claves',KeyQuestionData)
                    setKeyQuestion({
                        name: KeyQuestionData.nombre,
                        id: KeyQuestionData.id,
                        elegido: KeyQuestionData.elegido,
                        estado:KeyQuestionData.estado
                    });

                    setPregunta({
                    pregunta_pc: KeyQuestionData.preguntas,
                    })
                    setLoading(false);
                    console.log('Nombre de la pregunta clave',KeyQuestionData.nombre)
                    console.log('id de la prregunta clave',KeyQuestionData.id)
                    console.log('Preguntas de la pregunta clave',KeyQuestionData.preguntas)
                    console.log('nombre de la persona elegida',KeyQuestionData.elegido)
                    console.log('el estado de la pregunta es',KeyQuestionData.estado)
                } catch (error) {
                    console.error('Error:', error);
                    setLoading(false);
                }
            };
            fetchThemeData();
        }, [id]);

        useEffect(() => {
            const fetchUserKeyQuestion = async () => {
                try {
                    console.log('id de la pregunta clave del front',id)
                    const response = await fetch(`http://localhost:3000/api/themes/reporte/totales/${id}`);

                    console.log('response',response)
                    if (!response.ok) throw new Error('Error cargando la pregunta clave');
                    
                    const KeyQuestionUsers = await response.json();
                    console.log('respuesta obtenida de respuestas preguntas claves',KeyQuestionUsers)
                    setRespuestas({
                        totalRespuestas: KeyQuestionUsers.recordset[0]?.totalrespuestas || 0,
                        totalUsuarios: KeyQuestionUsers.recordset[0]?.totalUsuarios || 0,
                    });

                    setLoading(false);
                    console.log('total usuarios respuestas',KeyQuestionUsers.recordset[0].totalrespuestas)
                    console.log('total usuarios pregunta',KeyQuestionUsers.recordset[0].totalUsuarios)

                    if (KeyQuestionUsers.recordset[0].totalrespuestas !== KeyQuestionUsers.recordset[0].totalUsuarios) {
                        setShowWarning(true);
                    } else {
                        setAllowContinue(true); // mostrar vista normal si todos respondieron
                    }

                } catch (error) {
                    console.error('Error:', error);
                    setLoading(false);
                }
            };
            fetchUserKeyQuestion();
        }, [id]);

    useEffect(() => {
        const fetchConfiguration = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/themes/configuracion`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: 'Error desconocido'
                    }));
                    throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                }
                
                const data = await response.json();
                console.log('respuesta configuracion',data)
    
                const configuracion = {
                    inputMin: parseInt(data.inputComentarioMin),
                    inputMax: parseInt(data.inputComentarioMax),
                    docMin: parseInt(data.DocumentoMin),
                    docMax: parseInt(data.DocumentoMax),
                }
    
                setConfig(configuracion)
                
    
            }catch (error) {
                console.error('Error obteniendo los datos', error);
            }
        }
    
        fetchConfiguration();
        }, []);

        if (loading){
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            );
        }

        const handleContinue = () => {
            setShowWarning(false);
            setAllowContinue(true);
        };
    
        const handleCancel = () => {
            navigate('/preguntas-clave');
        };


        const dataFormateada = pregunta.pregunta_pc.map(p => {
            console.log('Estamos haciendo esto')
            const porcentajeSi = p.conteo_total > 0
                ? Math.round((p.conteo_si / p.conteo_total) * 100)
                : 0;
        
            const porcentajeNo = 100 - porcentajeSi;
            console.log(p.id)
            return {
                id_pcp:p.id,
                pregunta: p.texto,
                mensaje: `Promedio "Si" ${porcentajeSi}%`,
                graficaData: [
                    { valor: "Sí", area: porcentajeSi },
                    { valor: "No", area: porcentajeNo }
                ]
            };
        });

        console.log(dataFormateada)
        console.log('respuestas',respuestas)

        
        const abrirPopupComentario = async (pregunta) => {
            setPreguntaSeleccionada(pregunta);
            console.log('la pregunta actual es',pregunta.id_pcp)
            setShowPopupCom(true);
            
          
            try {
              const res = await fetch(`http://localhost:3000/api/themes/preguntasClave/comentarios/${pregunta.id_pcp}`);
              const data = await res.json();
              setComentarios(data);
            } catch (err) {
              console.error('Error al obtener comentarios:', err);
            }
          };

        const abrirPopupEnlace = async (pregunta) => {
        setPreguntaSeleccionada(pregunta);
        setShowPopupUrl(true);
        
        try {
            const res = await fetch(`http://localhost:3000/api/themes/preguntasClave/enlaces/${pregunta.id_pcp}`);
            const data = await res.json();
            setEnlaces(data);
        } catch (err) {
            console.error('Error al obtener los enlaces:', err);
        }
        };

        const abrirPopupDocumento = async (pregunta) => {
            setPreguntaSeleccionada(pregunta);
            setShowPopupDoc(true);
            
            try {
                const res = await fetch(`http://localhost:3000/api/themes/preguntasClave/documentos/${pregunta.id_pcp}`);
                const data = await res.json();
                setDocumentos(data);
            } catch (err) {
                console.error('Error al obtener los documentos:', err);
            }
            };

        const handleNavigate = (item,keyQuestion) => {
            console.log('Ir al detalle:', item.id_pcp, keyQuestion.id); 
            navigate(`/detalle/preguntaClave/${item.id_pcp}/${keyQuestion.id}`)
        }

        const handleComentarioChange = (event) => {
            setComentarioFinal(event.target.value);
        };

        const showValidationPopup = (message) => {
            setToastMessage(message);
            setShowValidationMessage(true);
            setTimeout(() => {
                setShowValidationMessage(false);
            }, 3000);
            console.log(toastMessage)
        };

        const puedeEditar = keyQuestion?.elegido === user.displayName;

        const handleSubmit  = async () => {
            try {
                const payload = {
                    decisionFinal: !isSwitchOn,
                    comentario: comentarioFinal,
                    pc_id: keyQuestion.id
                };

                console.log('respuesta que se envia al backend',payload)

                const normalizeText = (text) => {
                    return text
                        .normalize("NFD")                          // Quita acentos
                        .replace(/[\u0300-\u036f]/g, "")           // Remueve marcas diacríticas
                        .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "") // Elimina símbolos al inicio y fin
                        .trim()
                        .toLowerCase();                            // Convierte a minúsculas
                };
            
                const hasSymbolAtEdges = (text) => /^[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+|[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/.test(text.trim());
            
                const isOnlySpecialCharsOrNumbers = (text) => {
                    const cleaned = text.trim();
                    const hasLetters = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(cleaned); // acepta letras con acentos y eñes
                    return !hasLetters;
                };

                const formatTitle = (text) => {
                    const cleaned = text.trim().toLowerCase();
                    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                };

                if (!comentarioFinal.trim()) {
                    const message = 'El comentario no debe estar vacío'
                    showValidationPopup(message);
                    return
                }
        
                if (isOnlySpecialCharsOrNumbers(comentarioFinal)) {
                    const message = 'El comentario debe contener al menos una letra'
                    showValidationPopup(message);
                    return
                }
        
                if (hasSymbolAtEdges(comentarioFinal)) {
                    const message = 'El comentario no debe iniciar o terminar con símbolos'
                    showValidationPopup(message);
                    return
                }

                if (comentarioFinal.length < config.inputMin) {
                    setErrorComentario(`El comentario debe tener al menos ${config.inputMin} caracteres.`);
                    setTimeout(() => setErrorComentario(''), 4000);
                    return;
                }
            
                if (comentarioFinal.length > config.inputMax) {
                setErrorComentario(`El comentario no puede superar los ${config.inputMax} caracteres.`);
                setTimeout(() => setErrorComentario(''), 4000);
                return;
                }

                const formattedQuestion = formatTitle(normalizeText(comentarioFinal))
                setComentarioFinal(formattedQuestion)

                


        
                // const response = await fetch('http://localhost:3000/api/themes/preguntaClave/decisionFinal', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(payload)
                // });
        
                // if (!response.ok) {
                //     throw new Error('Error al guardar la decisión');
                // }
        
                // alert('Decisión guardada con éxito');

                setShowConfirmation(true);
            } catch (error) {
                console.error('Error al guardar decisión:', error);
                alert('Error al guardar decisión');
            }
        };

        const confirmSubmit = async () => {
            setShowConfirmation(false);

            const payload = {
                decisionFinal: !isSwitchOn,
                comentario: comentarioFinal,
                pc_id: keyQuestion.id
            };
    
            try {
                const response = await fetch(`http://localhost:3000/api/themes/preguntaClave/guardar/respuestaFinal/${keyQuestion.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        payload
                    )
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Error al actualizar la pregunta clave');
                }
    
                setShowSuccess(true);
                setTimeout(() => navigate('/preguntas-clave'), 2000);
            } catch (error) {
                console.error('Submission error:', error);
            }
        };
    
        const cancelSubmit = () => {
            setShowConfirmation(false);
        };

        const handleEnviarComentarioFinal = async () => {

            if (comentarioFinal.length < config.inputMin) {
                setErrorComentario(`El comentario debe tener al menos ${config.inputMin} caracteres.`);
                setTimeout(() => setErrorComentario(''), 4000);
                return;
            }
        
            if (comentarioFinal.length > config.inputMax) {
            setErrorComentario(`El comentario no puede superar los ${config.inputMax} caracteres.`);
            setTimeout(() => setErrorComentario(''), 4000);
            return;
            }
            
            setShowConfirmation(false);

            const payload = {
                decisionFinal: !isSwitchOn,
                comentario: comentarioFinal,
                pc_id: keyQuestion.id
            };
    
            try {
                const response = await fetch(`http://localhost:3000/api/themes/preguntaClave/guardar/comentarioFinal/${keyQuestion.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        payload
                    )
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Error al actualizar el comentario final de la pregunta clave');
                }
    
                setShowSuccess(true);
                setTimeout(() => navigate('/preguntas-clave'), 2000);
            } catch (error) {
                console.error('Submission error:', error);
            }
        };
    
        
    

    return (
        <div>
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
                                        {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>)}
                                        {(user.tipoId === '84F03A04-2891-4DE7-8A3D-DBD2018EAE47') && (
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntaClave/pregunta/lista")}>Preguntas Clave</Nav.Link>)}
                                        {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                                        <Nav.Link as="div" className="nav-link-pointer active" onClick={() => navigate("/temas")}>Temas</Nav.Link>)}
                                        {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017') && (
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/enrolamiento")}>Enrolamiento</Nav.Link>)}
                                        {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>)}
                                        {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017') && (   
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/configuracion")} title="Configuración">
                                            <i className="bi bi-gear" style={{ fontSize: '1.2rem' }}></i>
                                        </Nav.Link>)}
                                    </Nav>
                                    <Button variant="outline-light" className="ms-auto" onClick={handleLogout}>Sign out</Button> {/* Changed to ms-auto */}
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>

            <div className="d-flex justify-content-end" style={{ padding: '10px 30px' }}>
                <button
                    onClick={() => navigate('/preguntas-clave')}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Volver
                </button>
            </div>

            <div style={{
            margin: '0 auto',
            width: '95%',
            marginBottom: '20px',
            display: 'block',
            padding: '10px 20px',
            }}>
                {/* Titulo */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>Pregunta Detonadora</h3>

                    <input
                    type="text"
                    value={keyQuestion.name}
                    readOnly
                    style={{
                        padding: '8px',
                        fontSize: '16px',
                        width: '300px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    />
                </div>

                {/* Tabla con reporte de datos */}
                <div style={{ width: '95%', margin: '0 auto', marginBottom: '30px' }}>
                    {dataFormateada.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #ccc',
                            padding: '10px 0'
                        }}>
                            <div style={{ flex: 1 }}>{item.pregunta}</div>
                            <div style={{ flex: 1 }}>{item.mensaje}</div>
                            <div style={{ flex: 1 }}> <MiniPieChart data={item.graficaData} /></div>
                            <div style={{ flex: 1 }}>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                    marginRight: '3px'                                   
                                }} onClick={() => abrirPopupComentario(item)}>Comentario</button>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                    marginRight: '3px'
                                }}onClick={() => abrirPopupEnlace(item)}>Enlace</button>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                    marginRight: '3px'
                                }}onClick={() => abrirPopupDocumento(item)}>Archivo</button>
                                <button style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d3d3d3',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                }}onClick={() => handleNavigate(item,keyQuestion)}>Detalle</button>
                            </div>
                        </div>
                    ))}
                </div>

                

                {/* Seccion de desición final */}
                {keyQuestion.estado != 'Finalizado' ? (
                <div style={{ width: '95%', margin: '0 auto', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '10px'}}>
                        {/* Título y switch */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' , marginRight: '20px'}}>
                        <label style={{ margin: 0 }}>Desición Final</label>
                            <span>Sí</span>
                            <div className="form-check form-switch" style={{ marginBottom: 0 }}>
                                <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="switchCheckDefault"
                                checked={isSwitchOn}
                                onChange={handleSwitchChange}
                                disabled={!puedeEditar}
                                />
                            </div>
                            <span>No</span>
                        </div>

                        {/* Comentario e input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label htmlFor="comentarioInput" style={{ margin: 0 }}>Comentario</label>
                            <input
                                id="comentarioInput"
                                type="text"
                                placeholder="Escribe un comentario"
                                value={comentarioFinal}
                                onChange={handleComentarioChange}
                                disabled={!puedeEditar}
                                style={{
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                width: '400px'
                                }}
                            />

                            {errorComentario && (
                                <div style={{ color: 'red', marginTop: '5px' }}>
                                    {errorComentario}
                                </div>
                            )}
                            <button 
                            onClick={handleSubmit}
                            disabled={!puedeEditar}
                            style={{
                                marginLeft: '10rem',
                                padding: '6px 12px',
                                backgroundColor: '#007BFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Enviar Respuesta Final
                            </button>
                        </div>
                    </div>
                </div> ) : ( 
                    <div style={{ width: '95%', margin: '0 auto', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '10px'}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Título y switch */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' , marginRight: '20px'}}>
                            <label style={{ margin: 0 }}>Se Cumplio</label>
                            <span>Sí</span>
                            <div className="form-check form-switch" style={{ marginBottom: 0 }}>
                                <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="switchCheckDefault"
                                checked={isSwitchOn}
                                onChange={handleSwitchChange}
                                disabled={!puedeEditar}
                                />
                            </div>
                            <span>No</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label htmlFor="comentarioInput" style={{ margin: 0 }}>Comentario Posterior</label>
                            <input
                            id="comentarioInput"
                            type="text"
                            placeholder="Escribe un comentario"
                            value={comentarioFinal}
                            onChange={handleComentarioChange}
                            style={{
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                width: '400px'
                            }}
                            />
                            {errorComentario && (
                                <div style={{ color: 'red', marginTop: '5px' }}>
                                    {errorComentario}
                                </div>
                            )}
                            <button 
                            onClick={handleEnviarComentarioFinal}
                            style={{
                                marginLeft: '10rem',
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            >
                            Enviar Comentario Posterior
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>

                )}

            </div>
            <Popup
                visible={showPopupCom}
                onHiding={() => setShowPopupCom(false)}
                dragEnabled
                closeOnOutsideClick
                showCloseButton
                title={preguntaSeleccionada?.texto || "Comentario"}
                width={700}
                height={600}
                >
                <div>
                    <label className="fw-bold mb-2 fs-2">Bitácora de comentarios</label>
                    <DataGrid
                    dataSource={comentarios.recordset}
                    keyExpr="id"
                    showBorders={true}
                    height={300}
                    >
                    <Column dataField="id" caption="ID" width={100} />
                    <Column dataField="NombreUsuario" caption="Creador" width={150} />
                    <Column dataField="texto" caption="Comentario" />
                    <Column dataField="hora_creacion" caption="Fecha" dataType="datetime" width={180} />
                    </DataGrid>
                </div>
            </Popup>

            <Popup
                visible={showPopupUrl}
                onHiding={() => setShowPopupUrl(false)}
                dragEnabled
                closeOnOutsideClick
                showCloseButton
                title={preguntaSeleccionada?.texto || "Enlace"}
                width={700}
                height={600}
                >
                <div>
                    <label className="fw-bold mb-2">Bitácora de enlaces</label>

                    <DataGrid
                    dataSource={enlaces.recordset}
                    keyExpr="id"
                    showBorders={true}
                    height={300}
                    >
                    <Column dataField="id" caption="ID" width={100} />
                    <Column dataField="NombreUsuario" caption="Creador" width={150} />
                    <Column dataField="texto" caption="Enlace" />
                    <Column dataField="hora_creacion" caption="Fecha" dataType="datetime" width={180} />
                    </DataGrid>
                </div>
            </Popup>

            <Popup
                visible={showPopupDoc}
                onHiding={() => setShowPopupDoc(false)}
                dragEnabled
                closeOnOutsideClick
                showCloseButton
                title={preguntaSeleccionada?.texto || "Documento"}
                width={700}
                height={600}
                >
                <div>
                    <label className="fw-bold mb-2">Bitácora de documentos</label>

                    <DataGrid
                    dataSource={documentos.recordset}
                    keyExpr="id"
                    showBorders={true}
                    height={300}
                    >
                    <Column dataField="id" caption="ID" width={100} />
                    <Column dataField="NombreUsuario" caption="Creador" width={150} />
                    <Column dataField="documento" caption="Documento" />
                    <Column dataField="hora_creacion" caption="Fecha" dataType="datetime" width={180} />
                    </DataGrid>
                </div>
            </Popup>

            {showValidationMessage && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                    <div className="toast align-items-center text-white bg-danger border-0 show">
                        <div className="d-flex">
                            <div className="toast-body">
                                    {toastMessage}
                            </div>
                        </div>
                    </div> 
                    </div>
             )}

            {/* Confirmation Modal */}
            {keyQuestion.estado != 'Finalizado' ? (
            <Modal show={showConfirmation} onHide={cancelSubmit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Respuesta Final de la Pregunta Clave</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Pregunta Clave:</strong> {keyQuestion.name}</p>
                    <p><strong>Respuesta:</strong> {!isSwitchOn ? 'Sí' : 'No'}</p>
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelSubmit}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={confirmSubmit}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
            ) : (
            <Modal show={showConfirmation} onHide={cancelSubmit} centered>
            <Modal.Header closeButton>
                <Modal.Title>Comentario Posterior de la Pregunta Clave</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Pregunta Clave:</strong> {keyQuestion.name}</p>
                <p><strong>Comentario:</strong> {comentarioFinal}</p>
                
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={cancelSubmit}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={confirmSubmit}>
                    Confirmar
                </Button>
            </Modal.Footer>
            </Modal>
            )}

            {/* Success Modal */}
            <Modal show={showSuccess} onHide={() => {}} centered>
                <Modal.Body className="text-center p-4">
                    <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h3>Respuesta guardada exitosamente</h3>
                    <p>Redirigiendo...</p>
                </Modal.Body>
            </Modal>

            <Popup
                visible={showWarning}
                onHiding={() => setShowWarning(false)}
                showTitle={true}
                title="Advertencia"
                showCloseButton={true}
                width={400}
                height={220}
            >
                <div className="p-3">
                    <p>⚠️ No todos los usuarios han respondido esta pregunta clave. ¿Deseas continuar de todos modos?</p>
                    <div className="d-flex justify-content-end mt-4 gap-2">
                        <button className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleContinue}>Continuar</button>
                    </div>
                </div>
            </Popup>

            {!loading && allowContinue && (
                <div>
                    {/* Aquí tu vista principal si el usuario decide continuar */}
                </div>
            )}

            
        </div>
    );
};

export default Reportquestion;
