import React, { useEffect, useState} from "react";
import { useNavigate, Outlet,useParams } from "react-router-dom";
import DataGrid, { Column, Export, Editing, SearchPanel,HeaderFilter, GroupPanel, Grouping} from 'devextreme-react/data-grid';
import TextBox from 'devextreme-react/text-box';
import Button from 'devextreme-react/button';
import Popup from 'devextreme-react/popup';
import 'devextreme/dist/css/dx.light.css';
import "../Styles/UserKeyQuestion.css"
import { Navbar, Nav, Spinner, Container, Row, Col,Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useRef } from 'react';

const hasSymbolAtEdges = (text) => /^[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+|[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/.test(text.trim());

const isOnlySpecialCharsOrNumbers = (text) => {
    const cleaned = text.trim();
    const hasLetters = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(cleaned); // acepta letras con acentos y eñes
    return !hasLetters;
};

const UserKeyQuestion = () => {
    const [user, setUser] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [clavePregunta, setClavePregunta] = useState('');
    const [keyQuestion, setKeyQuestion] = useState({
            name: '' ,
            id: ''        
        });
    const [pregunta, setPregunta] = useState({
            pregunta_pc: []
        });
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupDoc, setShowPopupDoc] = useState(false);
    const [showPopupUrl, setShowPopupUrl] = useState(false);
    const [comentarioActual, setComentarioActual] = useState('');
    const [enlaceActual, setEnlaceActual] = useState('');
    const [enlaces, setEnlaces] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [config, setConfig] = useState({});
    const [errorMsg, setErrorMsg] = useState('');
    const [errorComentario, setErrorComentario] = useState('');
    const [respuestas, setRespuestas] = useState([]);
    const [modalRespuestasCompletas, setModalRespuestasCompletas] = useState(false);
    const [exitoComentario, setExitoComentario] = useState('');
    const [exitoEnlace, setExitoEnlace] = useState('');
    const [exitoDoc, setExitoDoc] = useState('');
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    
      useEffect(() => {
        const userData = sessionStorage.getItem("user");
        if (!userData) {
          navigate("/");
          return;
        }
        setUser(JSON.parse(userData));
        setLoading(false);
    
        const handleMessage = (event) => {
          if (event.origin === `${import.meta.env.VITE_BACKEND_ORIGIN}` && event.data.user) {
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
              const fetchThemeData = async () => {
                  try {
                      const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/preguntasClave/usuario/full/${id}`);
                      console.log('response',response)
                      if (!response.ok) throw new Error('Error cargando la pregunta clave');
                      
                      const KeyQuestionData = await response.json();
                      console.log('respuesta obtenida de preguntas clabves',KeyQuestionData)
                      setKeyQuestion({
                          name: KeyQuestionData.nombre,
                          id: KeyQuestionData.id
                      });

                      setPregunta({
                        pregunta_pc: KeyQuestionData.preguntas,
                      })
                      setLoading(false);
                      console.log('Nombre de la pregunta clave',KeyQuestionData.nombre)
                      console.log('id de la prregunta clave',KeyQuestionData.id)
                      console.log('Preguntas de la pregunta clave',KeyQuestionData.preguntas)
                  } catch (error) {
                      console.error('Error:', error);
                      setLoading(false);
                  }
              };
              fetchThemeData();
          }, [id]);

    useEffect(() => {
    const fetchConfiguration = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/configuracion`);
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

    useEffect(() => {
        if (!user || !keyQuestion.id) return;
        const fetchAnswerKeyQuestion = async () => {
            console.log('id_pregunta clave respuestas',keyQuestion.id)
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/preguntasClave/respuestas/${keyQuestion.id}/${user.id}`);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: 'Error desconocido'
                    }));
                    throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                }
                
                const data = await response.json();
                console.log('respuesta de respuestas',data)

                const respuesta = data.recordset
                console.log('lo de dentro es',respuesta)
                setRespuestas(respuesta)


            }catch (error) {
                console.error('Error obteniendo los datos', error);
            }
        }

        fetchAnswerKeyQuestion();
    }, [user, keyQuestion.id]);

    useEffect(() => {
        if (pregunta.pregunta_pc.length > 0 && respuestas.length > 0) {

            const totalRespuestas = respuestas[0]?.totalRespuestas || 0;
            const totalPreguntas = pregunta.pregunta_pc.length;

            console.log('el tamaño de respuestas es',totalRespuestas)
            console.log('el tamaño de preguntas es',totalPreguntas)
            if (totalRespuestas >= totalPreguntas) {               
                setModalRespuestasCompletas(true);
    
                // Redirige automáticamente después de 3 segundos
                setTimeout(() => {
                    navigate('/preguntaClave/pregunta/lista');
                }, 3000);
            }
        }
    }, [pregunta.pregunta_pc, respuestas]);

    //   const [preguntas, setPreguntas] = useState([
    //     { id: 1, texto: '¿Pregunta 1?', activo: true },
    //     { id: 2, texto: '¿Pregunta 2?', activo: false },
    //     { id: 3, texto: '¿Pregunta 3?', activo: true },
    //     { id: 4, texto: '¿Pregunta 4?', activo: false },
    //   ]);



      const abrirPopupComentario = async (pregunta) => {
        setComentarioActual('');
        setPreguntaSeleccionada(pregunta);
        setShowPopup(true);
      
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/preguntasClave/comentarios/${pregunta.id}/${user.id}`);
          const data = await res.json();
          setComentarios(data);
        } catch (err) {
          console.error('Error al obtener comentarios:', err);
        }
      };

      const abrirPopupDocumento = async (pregunta) => {
        setPreguntaSeleccionada(pregunta);
        setShowPopupDoc(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/preguntasClave/documentos/${pregunta.id}/${user.id}`);
            const data = await res.json();
            setDocumentos(data);
          } catch (err) {
            console.error('Error al obtener documentos:', err);
          }
      
      };

      const abrirPopupEnlace = async (pregunta) => {
        setEnlaceActual('');
        setPreguntaSeleccionada(pregunta);
        setShowPopupUrl(true);
      
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/preguntasClave/enlaces/${pregunta.id}/${user.id}`);
          const data = await res.json();
          setEnlaces(data);
        } catch (err) {
          console.error('Error al obtener los enlaces:', err);
        }
      };

      const enviarComentario = async () => {
        if (!comentarioActual.trim()){
            setErrorComentario(`El comentario no debe estar vacío`);
            setTimeout(() => setErrorComentario(''), 4000);
            return;
        } 

        if (comentarioActual.length < config.inputMin) {
            setErrorComentario(`El comentario debe tener al menos ${config.inputMin} caracteres.`);
            setTimeout(() => setErrorComentario(''), 4000);
            return;
        }
    
        if (comentarioActual.length > config.inputMax) {
        setErrorComentario(`El comentario no puede superar los ${config.inputMax} caracteres.`);
        setTimeout(() => setErrorComentario(''), 4000);
        return;
        }

        if (isOnlySpecialCharsOrNumbers(comentarioActual)) {
            const message = 'El comentario debe contener al menos una letra.';
            setErrorComentario(message);
            setTimeout(() => setErrorComentario(''), 4000);
            return;
        }

        if (hasSymbolAtEdges(comentarioActual)) {
            const message = 'El comentario no debe comenzar ni terminar con símbolos.';
            setErrorComentario(message);
            setTimeout(() => setErrorComentario(''), 4000);
            return;
        }

        setErrorComentario('');

        const nuevoComentario = {
          pc_id: keyQuestion.id, 
          pcp_id: preguntaSeleccionada.id,
          texto: comentarioActual,
          creador: user.id
        };

        console.log('comentario enviado',nuevoComentario)
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/comentarios/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoComentario)
          });
      
          if (res.ok) {
            const comentarioGuardado = await res.json();
            console.log(comentarioGuardado)
            setComentarioActual('');
            
            setExitoComentario('El comentario se envio correctamente'); 
            setTimeout(() => setExitoComentario(''), 4000); 
          }

        } catch (err) {
          console.error('Error al enviar comentario:', err);
        }
      };


      const enviarEnlace = async () => {
        if (!enlaceActual.trim()) return;

        try {
            new URL(enlaceActual); 
          } catch (error) {
            console.error('El enlace ingresado no es una URL válida',error);
            alert('Por favor, ingresa un enlace válido (por ejemplo, https://ejemplo.com)');
            return;
          }
      
        const nuevoEnlace = {
          pc_id: keyQuestion.id, 
          pcp_id: preguntaSeleccionada.id,
          texto: enlaceActual,
          creador: user.id
        };
        
        console.log('enlace enviado',nuevoEnlace)
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN}/api/themes/enlace/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoEnlace)
          });
      
          if (res.ok) {
            const enlaceGuardado = await res.json();
            console.log('enlace enviado',enlaceGuardado) 
            setEnlaceActual('');   
            
            setExitoEnlace('El enlace se envio correctamente'); 
            setTimeout(() => setExitoEnlace(''), 4000);
          }


        } catch (err) {
          console.error('Error al enviar el enlace:', err);
        }
      };

      if (loading) {
          return (
            <Container fluid className="d-flex justify-content-center align-items-center vh-100">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Container>
          );
        }
    
        console.log(clavePregunta)

        

        const uploadfile = async () => {
            const file = fileInputRef.current?.files[0];

            if (!file) {
                setErrorMsg("No se seleccionó ningún archivo.");
                setTimeout(() => setErrorMsg(''), 4000);
                return;
              }
            
            const fileSizeKB = file.size / 1024;
            const fileSizeMB = file.size / (1024 * 1024);

            if (fileSizeKB < config.docMin) {
                setErrorMsg(`El archivo es demasiado pequeño. Debe ser al menos ${config.docMin} KB.`);
                setTimeout(() => setErrorMsg(''), 4000);
                return;
            }
        
            if (fileSizeMB > config.docMax) {
                setErrorMsg(`El archivo es demasiado grande. El límite es ${config.docMax} MB.`);
                setTimeout(() => setErrorMsg(''), 4000);
                return;
            }

            const formdata = new FormData();

            formdata.append('archivo',file);

            const nuevoDoc = {
                pc_id: keyQuestion.id, 
                pcp_id: preguntaSeleccionada.id,
                texto: file.name,
                creador: user.id
              };

            console.log('archivo',file)
            formdata.append('metadata', JSON.stringify(nuevoDoc));
            console.log('datos enviados al back',formdata)
            const response = await fetch(`${import.meta.env.BACKEND_ORIGIN}/api/themes/documentos/guardar`, {
                method: 'POST',
                body: formdata
              });

            console.log(response)

            if (response.ok) {
                const enlaceDoc = await response.json();
                console.log('enlace enviado',enlaceDoc) 
                setEnlaceActual('');   
                
                setExitoDoc('El documento se envio correctamente'); 
                setTimeout(() => setExitoDoc(''), 4000);
              }
          
        }

        const handleSwitchChange = (index) => (e) => {
            const newPreguntas = [...pregunta.pregunta_pc];
            newPreguntas[index].activo = e.target.checked; 
            setPregunta({
              ...pregunta,
              pregunta_pc: newPreguntas
            });
          };


        const handleSubmit = async () => {
            try {
                const estadosPreguntas = pregunta.pregunta_pc.map(p => ({
                id: p.id,
                activo: p.activo ?? false,
                }));

                const nuevoEnlace = {
                    pc_id: keyQuestion.id, 
                    creador: user.id,
                    estadosPreguntas: estadosPreguntas
                  };
              
                console.log('enlace enviado',nuevoEnlace)
                try {
                    const res = await fetch(`${import.meta.env.BACKEND_ORIGIN}/api/themes/preguntaClave/guardar/nuevo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoEnlace)
                    });
                
                    console.log('respuesta enviada',res)
                }catch (error){
                    console.error('Error al enviar las respuestas:', error);
                }
                
                setTimeout(() => navigate('/preguntaClave/pregunta/lista'), 2000);
      
              } catch (err) {
                console.error('Error al enviar las respuestas:', err);
              }
        }

        const handleEnviarClick = () => {
            setConfirmVisible(true); // Mostrar popup de confirmación
          };

        const handleConfirmYes = () => {
        setConfirmVisible(false); 
        handleSubmit(); 
        };

        const handleConfirmNo = () => {
        setConfirmVisible(false); 
        };

    return (
        
        <div >
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

            <div className="d-flex justify-content-end" style={{ padding: '10px 30px' }}>
                <button
                    onClick={() => navigate('/preguntaClave/pregunta/lista')}
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

            <Container className="mt-4">
                <Row className="mb-3">
                    <Col>
                    <label className="form-label fs-5"><strong>Pregunta Clave</strong></label>
                    <TextBox
                        value={keyQuestion.name || ""}
                        onValueChanged={(e) => setClavePregunta(e.value)}
                        className="form-control"
                        stylingMode="outlined"
                        width="100%"
                        readOnly
                    />
                    </Col>
                </Row>

                <Row>
                    <Col>
                    <div className="card">
                        <div className="card-body">
                        {pregunta.pregunta_pc.map((question, index) => (
                            <Row className="align-items-center mb-3" key={question.id}>
                            <Col xs="auto" className="d-flex align-items-center">
                            <div className="d-flex align-items-center align-self-center me-3">
                                <input
                                    className="custom-bootstrap-switch"
                                    type="checkbox"
                                    role="switch"
                                    id={`switch-${question.id}`}
                                    checked={question.activo}
                                    onChange={handleSwitchChange(index)}
                                />
                                <span className="switch-label-text ms-2">
                                    {question.activo ? "Sí" : "No"}
                                </span>
                                </div>
                            </Col>
                            <Col >
                                <TextBox
                                value={question.texto || ""}
                                readOnly
                                className="form-control borde-solido"
                                stylingMode="outlined"
                                width="100%"
                                
                                />
                            </Col>
                            <Col xs={2}>
                                <Button text="Comentario" type="normal" className="w-100" 
                                onClick={() => abrirPopupComentario(question)}/>
                            </Col>
                            <Col xs={2}>
                                <Button text="Documento" type="normal" className="w-100" 
                                onClick={() => abrirPopupDocumento(question)}/>
                            </Col>
                            <Col xs={2}>
                                <Button text="Enlace" type="normal" className="w-100"
                                onClick={() => abrirPopupEnlace(question)} />
                            </Col>
                            </Row>
                        ))}
                        </div>
                    </div>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col className="d-flex justify-content-end">
                    <Button
                        text="Enviar"
                        type="success"
                        className="btn btn-success"
                        style={{ backgroundColor: '#00e600', borderColor: '#00e600' }}
                        onClick={handleEnviarClick}
                    />
                    </Col>
                </Row>
            </Container>

            <Popup
                visible={showPopup}
                onHiding={() => setShowPopup(false)}
                dragEnabled
                closeOnOutsideClick
                showCloseButton
                title={preguntaSeleccionada?.texto || "Comentario"}
                width={700}
                height={600}
                >
                <div>
                    <label className="fw-bold mb-2">Bitácora de comentarios</label>
                    {errorComentario && (
                        <div className="alert alert-danger mt-2" role="alert">
                            {errorComentario}
                        </div>
                    )}

                    {exitoComentario && ( 
                        <div className="alert alert-success mt-2" role="alert">
                            {exitoComentario}
                        </div>
                    )}

                    <textarea
                    value={comentarioActual}
                    onChange={(e) => setComentarioActual(e.target.value)}
                    className="form-control mb-3"
                    rows={3}
                    placeholder="Escribe tu comentario aquí..."
                    id="inputComentario"
                    />

                    <div className="d-flex flex-column mb-3">
                        <div className="d-flex justify-content-end">
                            <small className="text-muted">
                                {comentarioActual.length} / {config.inMax} caracteres
                            </small>
                    </div>

                    <div className="d-flex justify-content-start mt-2">
                        <Button
                            text="Enviar comentario"
                            type="success"
                            onClick={enviarComentario}
                        />
                    </div>
                    </div>

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
                visible={showPopupDoc}
                onHiding={() => setShowPopupDoc(false)}
                dragEnabled
                closeOnOutsideClick
                showCloseButton
                title={preguntaSeleccionada?.texto || "Documento"}
                width={700}
                height={600}
                >
                <div className="d-flex flex-column mt-4 px-4">
                    <label className="fw-bold mb-2">Bitácora de Documentos</label>
                    {errorMsg && (
                    <div className="alert alert-danger mt-2" role="alert">
                        {errorMsg}
                    </div>
                    )}

                    {exitoDoc && ( 
                        <div className="alert alert-success mt-2" role="alert">
                            {exitoDoc}
                        </div>
                    )}
                    <input 
                    type="file"
                    ref={fileInputRef}
                    className="form-control mb-2"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,image/*,.txt"
                    />

                    <Button
                    text="Enviar documento"
                    type="success"
                    onClick={uploadfile}
                    className="ms-3"
                    />

                    <DataGrid
                    className="mt-4" 
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

                    {exitoEnlace && ( 
                        <div className="alert alert-success mt-2" role="alert">
                            {exitoEnlace}
                        </div>
                    )}

                    <textarea
                    value={enlaceActual}
                    onChange={(e) => setEnlaceActual(e.target.value)}
                    className="form-control mb-3"
                    rows={3}
                    placeholder="Ingresa tu enlace aquí..."
                    id="inputEnlace"
                    />

                    <Button
                    text="Enviar enlace"
                    type="success"
                    onClick={enviarEnlace}
                    className="mb-3"
                    />

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

            {/* Popup de confirmación */}
            <Popup
                visible={confirmVisible}
                onHiding={() => setConfirmVisible(false)}
                dragEnabled={false}
                closeOnOutsideClick={true}
                showTitle={false}
                width={400}
                height={200}
            >
                <div className="text-center p-4">
                <h5 className="fw-bold mb-4">¿Estás seguro de enviar las respuestas?</h5>
                <div className="d-flex justify-content-center gap-3">
                    <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleConfirmYes}
                    >
                    <i className="bi bi-hand-thumbs-up-fill"></i>
                    Aceptar
                    </button>
                    <button
                    className="btn btn-secondary d-flex align-items-center gap-2"
                    onClick={handleConfirmNo}
                    >
                    <i className="bi bi-hand-thumbs-down-fill"></i>
                    Cancelar
                    </button>
                </div>
                </div>
            </Popup>

            <Popup
                visible={modalRespuestasCompletas}
                onHiding={() => setModalRespuestasCompletas(false)}
                dragEnabled={false}
                closeOnOutsideClick={false}
                showTitle={false}
                width={400}
                height={200}
            >
                <div className="text-center p-4">
                    <h5 className="fw-bold mb-4 text-danger">Ya has respondido todas las preguntas</h5>
                    <p>Serás redirigido a la lista de preguntas clave.</p>
                </div>
            </Popup>

        </div>
    );
}

export default UserKeyQuestion;
