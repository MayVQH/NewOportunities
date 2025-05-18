import React, { useEffect,useState} from 'react';
import { useNavigate,useParams } from "react-router-dom"; 
import DataGrid, { Column, Editing, SearchPanel, HeaderFilter, GroupPanel, Grouping, Export } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css";
import 'jspdf-autotable';
import { exportDataGrid as exportToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportToExcel } from 'devextreme/excel_exporter';
import { jsPDF } from 'jspdf';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import TextBox from 'devextreme-react/text-box';
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Toast } from 'devextreme-react/toast';
import { Popup } from 'devextreme-react/popup';

const onExporting = async (e) => {
  
    const format = e.format;
  
    if (format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Roles');
  
      await exportToExcel({
        component: e.component,
        worksheet,
        autoFilterEnabled: true
      });
  
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'RolesPersonas.xlsx');
      e.cancel = true;
  
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      await exportToPdf({
        jsPDFDocument: doc,
        component: e.component
      });
      doc.save('RolesPersonas.pdf');
      e.cancel = true;
  
    } else if (format === 'csv') {
      const rows = e.component.getVisibleRows();
      const columns = e.component.getVisibleColumns();
  
      let csvContent = columns.map(c => `"${c.caption}"`).join(",") + "\n";
  
      rows.forEach(row => {
        const values = columns.map(col => `"${row.data[col.dataField] ?? ''}"`);
        csvContent += values.join(",") + "\n";
      });
  
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "RolesPersonas.csv");
      e.cancel = true;
    }
  };


const KeyquestionDetail = () => {
    const [user, setUser] = useState(null);
    const {pcp_id,pc_id } = useParams();
    const [loading,setLoading] = useState(true);
    const [keyQuestions, setKeyQuestions] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [documentos, setDocumentos] = useState([]);
    const [respuestas, setRespuestas] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupDoc, setShowPopupDoc] = useState(false);
    const [showPopupUlr, setShowPopupUrl] = useState(false);
    const [url, setUrls] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [usuariosConRespuestas, setUsuariosConRespuestas] = useState([]);
    const navigate = useNavigate();

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
        const fetchKeyQuestion = async () => {
            console.log('id_pregunta clave',pc_id)
            console.log('id de la pregunta unica',pcp_id)
            try {
                const response = await fetch(`http://localhost:3000/api/themes/preguntaClave/all/preguntas/preguntaClave/${pc_id}/${pcp_id}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: 'Error desconocido'
                    }));
                    throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                }
                
                const data = await response.json();
                console.log('respuesta',data)

                setKeyQuestions(data)

                const users = data.usuarios
                setUsuarios(users)

                const comments = data.comentarios
                setComentarios(comments)

            }catch (error) {
                console.error('Error obteniendo los datos', error);
            }
        }

        fetchKeyQuestion();
    }, []);

    useEffect(() => {
        const fetchAnswerKeyQuestion = async () => {
            console.log('id_pregunta clave respuestas',pc_id)
            console.log('id de la pregunta unica respuestas',pcp_id)
            try {
                const response = await fetch(`http://localhost:3000/api/themes/preguntasClave/respuestas/${pcp_id}`);
                
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
    }, []);

    useEffect(() => {
        if (usuarios.length > 0 && respuestas.length > 0) {
            const combinados = usuarios.map((usuario) => {
                const respuestaUsuario = respuestas.find(
                    (resp) => resp.creador === usuario.usuario_id
                );
    
                return {
                    ...usuario,
                    respuesta: respuestaUsuario ? respuestaUsuario.respuesta === true
                    ? "Sí"
                    : "No"
                    : null,
                    hora_creacion: respuestaUsuario ? respuestaUsuario.hora_creacion : null,
                    respuesta_id: respuestaUsuario ? respuestaUsuario.id : null,
                    flag: respuestaUsuario ? respuestaUsuario.flag : null
                };
            });
    
            setUsuariosConRespuestas(combinados);
        }
    }, [usuarios, respuestas]);

        if (loading){
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            );
        }

        console.log(usuarioSeleccionado)

        const handleOpenPopup = async (usuario) => {
            console.log('los datos son estos',usuario)
            setUsuarioSeleccionado(usuario);
            setShowPopup(true);
            console.log('el id de la pregunta',keyQuestions.pcp_id)

            try {
                const res = await fetch(`http://localhost:3000/api/themes/preguntasClave/comentarios/${keyQuestions.pcp_id}/${usuario.usuario_id}`);
                const datos = await res.json();
                setComentarios(datos);
              } catch (err) {
                console.error('Error al obtener comentarios:', err);
              }
          };


          const handleOpenDocument = async (usuario) => {
            console.log('los datos son estos',usuario)
            setUsuarioSeleccionado(usuario);
            setShowPopupDoc(true);
            console.log('el id de la pregunta',keyQuestions.pcp_id)

            try {
                const res = await fetch(`http://localhost:3000/api/themes/preguntasClave/documentos/${keyQuestions.pcp_id}/${usuario.usuario_id}`);
                const datos = await res.json();
                setDocumentos(datos);
              } catch (err) {
                console.error('Error al obtener documentos:', err);
              }
          };

          const handleOpenUrl = async (usuario) => {
            console.log('los datos son estos',usuario)
            setUsuarioSeleccionado(usuario);
            setShowPopupUrl(true);
            console.log('el id de la pregunta',keyQuestions.pcp_id)

            try {
                const res = await fetch(`http://localhost:3000/api/themes/preguntasClave/enlaces/${keyQuestions.pcp_id}/${usuario.usuario_id}`);
                const datos = await res.json();
                setUrls(datos);
              } catch (err) {
                console.error('Error al obtener comentarios:', err);
              }
          };
          

    return (
        <div>
            {/* Opciones de preguntas y personas en el centro */}
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
            
            <Container className="mt-4">
                {/* Pregunta Clave */}
                <Row className="mb-3">
                    <Col>
                        <label className="form-label fs-5"><strong>Pregunta Clave.</strong></label>
                        <TextBox
                            value={keyQuestions.nombre || ""}
                            className="form-control"
                            stylingMode="outlined"
                            width="100%"
                            readOnly
                            placeholder="¿Debo entrar al negocio con gobierno?"
                        />
                    </Col>
                </Row>

                <Row className="mb-3 align-items-center">
                <Col xs="auto">
                    <div style={{
                        border: '1px solid #ccc',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa',
                        minWidth: '38px',
                        textAlign: 'center'
                    }}>
                        1.
                    </div>
                </Col>
                <Col>
                    <TextBox
                        value={keyQuestions.nombre_pc}
                        className="form-control"
                        stylingMode="outlined"
                        width="100%"
                        readOnly
                    />
                </Col>
        </Row>

            </Container>
            <div style={{ padding: '20px', border: '1px solid rgb(178, 176, 176)', borderRadius: '8px', margin: '15px'}}>
            <DataGrid
                    dataSource={usuariosConRespuestas}
                    keyExpr="id"
                    showBorders={true}
                    allowColumnReordering={true}
                    rowAlternationEnabled={true}
                    columnAutoWidth={true}
                    repaintChangesOnly={true}
                    onExporting={onExporting}
                    onSaving={(e) => {
                    console.log('Cambios guardados:', e.changes);
                    }}
                >
                    <GroupPanel visible={true} />
                    <HeaderFilter visible={true} />
                    <SearchPanel visible={true} highlightCaseSensitive={true} />
                    <Grouping autoExpandAll={false} />
                    <Export
                                enabled={true}
                                formats={['pdf', 'xlsx', 'csv']}
                                fileName="ListaTemas"
                                allowExportSelectedData={false}
                              />
                    <Editing
                    mode="cell"
                    allowUpdating={true}
                    />
                    <Column dataField="id" caption="ID" allowEditing={false} width={50} />
                    <Column dataField="NombreUsuario" allowEditing={false} caption='Usuarios' />
                    <Column dataField="respuesta" allowEditing={false} caption='Respuesta' />
                    
                    
                    <Column caption="Comentarios" allowEditing={false} 
                    cellRender={({ data }) => (
                        <button
                          onClick={() => handleOpenPopup(data)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }} >
                          Ver bitácora de comentarios
                        </button> )}
                    /> 
                    <Column  caption="Documentos" allowEditing={false}
                    cellRender={({ data }) => (
                        <button
                          onClick={() => handleOpenDocument(data)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }} >
                          Ver bitácora de documentos
                        </button> )}
                    /> 
                    <Column
                    caption="Enlaces"
                    allowEditing={false}
                    cellRender={({ data }) => (
                        <button
                          onClick={() => handleOpenUrl(data)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }} >
                          Ver bitácora de enlaces
                        </button> )}
                    />
                </DataGrid>

                <Popup
                visible={showPopup}
                onHiding={() => setShowPopup(false)}
                dragEnabled
                closeOnOutsideClick
                showCloseButton
                width={700}
                height={600}
                >
                <div>
                    <label className="fw-bold mb-2">Bitácora de comentarios</label>

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

            <Popup
                visible={showPopupUlr}
                onHiding={() => setShowPopupUrl(false)}
                dragEnabled
                closeOnOutsideClick
                showCloseButton
                width={700}
                height={600}
                >
                <div>
                    <label className="fw-bold mb-2">Bitácora de enlaces</label>

                    <DataGrid
                    dataSource={url.recordset}
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

            <div className="d-flex justify-content-end" style={{ padding: '10px 30px' }}>
                <button
                    onClick={() => navigate(`/preguntas-clave/ReportePreguntas/${keyQuestions.id}`)}
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
                </div>
                    

            
        </div>

        
    );


}

export default KeyquestionDetail