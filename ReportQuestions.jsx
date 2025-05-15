import React, { useEffect,useState } from 'react';
import { useNavigate,useParams } from "react-router-dom";
import DataGrid, { Column, Export, Editing, SearchPanel,HeaderFilter, GroupPanel, Grouping} from 'devextreme-react/data-grid'; 
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css"
import MiniPieChart from './PieChart';
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
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
    const [showPopupCom, setShowPopupCom] = useState(false);
    const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [showPopupUrl, setShowPopupUrl] = useState(false);
    const [enlaces, setEnlaces] = useState([]);
    const navigate = useNavigate();

    const [isSwitchOn, setIsSwitchOn] = useState(false); // Estado para el switch

    const handleSwitchChange = () => {
        setIsSwitchOn(!isSwitchOn); // Cambiar el estado del switch
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

        if (loading){
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            );
        }


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
            setShowPopupUrl(true);
            
            try {
                const res = await fetch(`http://localhost:3000/api/themes/preguntasClave/documentos/${pregunta.id_pcp}`);
                const data = await res.json();
                setEnlaces(data);
            } catch (err) {
                console.error('Error al obtener los enlaces:', err);
            }
            };

        const handleNavigate = (item,keyQuestion) => {
            console.log('Ir al detalle:', item.id_pcp, keyQuestion.id); 
            navigate(`/detalle/preguntaClave/${item.id_pcp}/${keyQuestion.id}`)
        }
    

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
                                style={{
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                width: '400px'
                                }}
                            />
                            <button style={{
                                marginLeft: '10rem',
                                padding: '6px 12px',
                                backgroundColor: '#007BFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>

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
        </div>
    );
};

export default Reportquestion;
