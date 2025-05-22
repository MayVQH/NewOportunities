import React, { useEffect,useState } from 'react';
import { useNavigate } from "react-router-dom"; 
import DataGrid, { Column, Export, Editing, SearchPanel,HeaderFilter, GroupPanel, Grouping } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css"
import saveAs from 'file-saver';
import 'jspdf-autotable';
import { exportDataGrid as exportToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportToExcel } from 'devextreme/excel_exporter';
import { jsPDF } from 'jspdf';
import { Workbook } from 'exceljs';
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Keyquestion from './KeyQuestions';

  
const onExporting = async (e) => {
    const format = e.format;
  
    if (format === 'xlsx') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Lista');
  
      await exportToExcel({
        component: e.component,
        worksheet,
        autoFilterEnabled: true
      });
  
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'ListaTemas.xlsx');
      e.cancel = true;
  
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      await exportToPdf({
        jsPDFDocument: doc,
        component: e.component
      });
      doc.save('ListaTemas.pdf');
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
      saveAs(blob, "ListaTemas.csv");
      e.cancel = true;
    }
  };

const Listtheme = () => {
    const [user, setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    const [keyQuestions, setKeyQuestions] = useState([]);
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
                try {
                    const response = await fetch('http://localhost:3000/api/themes/preguntaClave/all');
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({
                            message: 'Error desconocido'
                        }));
                        throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                    }
    
                    const data = await response.json();
                    console.log('respuesta',data)

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
                        decisionPosterior : question.decisionImplementada
                      }));
                      
                      setKeyQuestions(formattedQuestions);
                }catch (error) {
                    console.error('Error obteniendo los datos', error);
                }
            }
    
            fetchKeyQuestion();
        }, []);
    
    // const [usuarios] = useState([
    //     { id: 1, pregunta_clave : '¿Debo entrar al negocio con gobierno?', fecha: '10/marzo/2025', decision_final: 'SI', comentario: 'Comentario pregunta clave 1', nombre: 'Edgar Lopez'},
    //     { id: 2, pregunta_clave : '¿Pregunta Clave 2?', fecha: '25/marzo/2025', decision_final: 'NO', comentario: 'Comentario pregunta clave 2', nombre: 'Sara Herrera'},
    //     { id: 3, pregunta_clave : '¿Pregunta Clave 3?', fecha: '17/marzo/2025', decision_final: 'NO', comentario: 'Comentario pregunta clave 3', nombre: 'Guadalupe Perez'},
    //     { id: 4, pregunta_clave : '¿Pregunta Clave 4?', fecha: '30/enero/2025', decision_final: 'SI', comentario: 'Comentario pregunta clave 4', nombre: 'Jose Garcia'},
    //     { id: 5, pregunta_clave : '¿Pregunta Clave 5?', fecha: '12/enero/2025', decision_final: 'SI', comentario: 'Comentario pregunta clave 5', nombre: 'Pedro Martinez'},
    //     { id: 6, pregunta_clave : '¿Pregunta Clave 6?', fecha: '5/febrero/2025', decision_final: 'NO', comentario: 'Comentario pregunta clave 6', nombre: 'Lucia Gomez'},
    //     { id: 7, pregunta_clave : '¿Pregunta Clave 7?', fecha: '16/febrero/2025', decision_final: 'SI', comentario: 'Comentario pregunta clave 7', nombre: 'Victor Vazquez'},
    // ]);

    if (loading){
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

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
                            {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>)}
                            {(user.tipoId === '84F03A04-2891-4DE7-8A3D-DBD2018EAE47') && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntaClave/pregunta/lista")}>Preguntas Clave</Nav.Link>)}
                            {(user.tipoId === '7D532F89-A63E-4667-B7CB-A4B477A55017' || user.tipoId === 'D3B78325-006E-4230-AE7E-C188181AE8B8') && (
                            <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/temas")}>Temas</Nav.Link>)}
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
        
            <div style={{ padding: '20px', border: '1px solid rgb(178, 176, 176)', borderRadius: '8px', margin: '15px'}}>
            <button style={{ padding: '6px 12px', backgroundColor: '#007BFF',color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        onClick={() => navigate("/preguntas-clave/nuevaPregunta")}>
                        Nueva Pregunta
            </button>
                
                <DataGrid
                    dataSource={keyQuestions}
                    keyExpr="id"
                    showBorders={true}
                    allowColumnReordering={true}
                    rowAlternationEnabled={true}
                    columnAutoWidth={true}
                    repaintChangesOnly={true}
                    onExporting={onExporting}
                    onSaving={(e) => {
                    // Acá puedes manejar la lógica para guardar en tu backend
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
                    <Column dataField="nombre" allowEditing={false} caption='Pregunta Clave' 
                    cellRender={({ data }) => {
                        return (
                          <button
                            className="btn btn-link p-0"
                            onClick={() => navigate(`/preguntas-clave/ReportePreguntas/${data.id}`)} // Redirige a la ruta correspondiente
                          >
                            {data.nombre}
                          </button>
                        );
                      }}/>
                    <Column dataField="creador_nombre" caption="Usuario" allowEditing={false} /> 
                    <Column dataField="hora_creacion" caption="Fecha" allowEditing={false}/>
                    {/* <Column dataField="decision_final" caption="Desición Final"/> */}
                    <Column
                    dataField="decision"
                    caption="Decisión Final"
                    allowEditing={false}
                    cellRender={({ value }) => {
                        let backgroundColor = value == 1 ? '#4CAF50' : value == 0 ? '#F44336' : '';
                        let displayText = value == 1 ? 'SI' : value == 0 ? 'NO' : '';

                        return (
                        <div style={{
                            backgroundColor,
                            color: 'white',
                            padding: '5px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            {displayText}
                        </div>
                        );
                    }}
                    />

                    <Column dataField="comentario" caption="Comentario" allowEditing={false}/>
                    <Column dataField="estatus" caption="Estatus Pregunta" allowEditing={false}/>
                    <Column dataField="decisionPosterior" caption="Se aplico la respuesta" allowEditing={false}
                    cellRender={({ value }) => {
                        let backgroundColor = value == 1 ? '#4CAF50' : value == 0 ? '#F44336' : '';
                        let displayText = value == 1 ? 'SI' : value == 0 ? 'NO' : '';

                        return (
                          <div style={{
                            backgroundColor,
                            color: 'white',
                            padding: '5px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            {displayText}
                        </div>
                        );
                      }}/>
                    <Column dataField="comentarioFinal" caption="Comentario Final" allowEditing={false}/>
                </DataGrid>

                <button style={{ padding: '6px 12px', backgroundColor: '#007BFF',color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
                    marginTop: '10px'
                }}
                        onClick={() => navigate("/preguntaClave/pregunta/lista")}>
                        Mis preguntas
                </button>

            </div>
            
            

        
        </div>
    );
};

export default Listtheme;
