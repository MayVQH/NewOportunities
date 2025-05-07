import React, { useEffect,useState } from 'react';
import { useNavigate } from "react-router-dom"; 
import DataGrid, { Column, Export, Editing, SearchPanel, HeaderFilter, GroupPanel, Grouping, Selection } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css"
import saveAs from 'file-saver';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const onExporting = (e) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');

    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'ListaPersonas.xlsx');
        });
    });
};

const Keyquestion = () => {
    const [user, setUser] = useState(null);
    const [loading,setLoading] = useState(true);
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



    const [usuarios] = useState([
        { id: 1, nombre: 'Edgar Lopez', correo: 'edgar.lopez@gmail.com', telefono: '5523819056', puesto: 'Supervisor' },
        { id: 2, nombre: 'Sara Herrera', correo: 'sara.herrera@gmail.com', telefono: '5523450098', puesto: 'Administrador' },
        { id: 3, nombre: 'Guadalupe Perez', correo: 'guadalupe.perez@gmail.com', telefono: '5532780098', puesto: 'Secretaria' },
        { id: 4, nombre: 'Jose Garcia', correo: 'jose.garcia@gmail.com', telefono: '1122345687', puesto: 'Gerente' },
        { id: 5, nombre: 'Pedro Martinez', correo: 'pedro.martinez@gmail.com', telefono: '5567912340', puesto: 'Usuario' },
        { id: 6, nombre: 'Lucia Gomez', correo: 'lucia.gomez@gmail.com', telefono: '6643279087', puesto: 'Usuario' },
        { id: 7, nombre: 'Victor Vazquez', correo: 'victor.vazquez@gmail.com', telefono: '5534218907', puesto: 'usuario' },
    ]);

    const [showDataGrid, setShowDataGrid] = useState(false);
    const [showTemas, setShowTemas] = useState(false);
    const [temasSeleccionados, setTemasSeleccionados] = useState([]);
    const listaTemas = ['Innovación', 'Satisfacción', 'Productividad', 'Liderazgo', 'Compromiso'];

    const toggleTema = (tema) => {
        if (temasSeleccionados.includes(tema)) {
            setTemasSeleccionados(temasSeleccionados.filter(t => t !== tema));
        } else {
            setTemasSeleccionados([...temasSeleccionados, tema]);
        }
    };

    const handleShowDataGrid = () => {
        setShowDataGrid(!showDataGrid);
    };

    if (loading){
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
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
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer active" onClick={() => navigate("/temas")}>Temas</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/enrolamiento")}>Enrolamiento</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>
                                    </Nav>
                                    <Button variant="outline-light" className="ms-auto" onClick={handleLogout}>Sign out</Button> {/* Changed to ms-auto */}
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>

            <button style={{ padding: '6px 12px', backgroundColor: '#007BFF',color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        onClick={() => navigate('/preguntas-clave')}>
                        Volver
            </button>

            <div style={{ padding: '20px', border: '1px solid rgb(178, 176, 176)', borderRadius: '8px', margin: '15px'}}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Pregunta Clave</h3>
                <input 
                    type="text" 
                    value="¿Debo entrar al negocio con gobierno?" 
                    readOnly 
                    style={{ padding: '8px', fontSize: '16px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                </div>


                {/* Botón Elegir Temas */}
                <button
                    onClick={() => setShowTemas(!showTemas)}
                    style={{
                        width: '70%',
                        margin: '10px auto',
                        display: 'block',
                        padding: '10px 20px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d3d3d3',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                        textAlign: 'left'
                    }}
                >
                    1. Elegir Temas
                </button>

                {/* Lista de Temas */}
                {showTemas && (
                    <div style={{ textAlign: 'left', margin: '0 auto', width: '67%', marginBottom: '20px' ,
                        display: 'block',
                        padding: '10px 20px',
                        border: '1px solid #d3d3d3',
                        borderRadius: '8px',
                    }}>
                        {listaTemas.map((tema, index) => (
                            <div key={index}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={temasSeleccionados.includes(tema)}
                                        onChange={() => toggleTema(tema)}
                                    />
                                    {` ${tema}`}
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {/* Botón Elegir Personas */}
                <button
                    onClick={handleShowDataGrid}
                    style={{
                        width: '70%',
                        margin: '10px auto',
                        display: 'block',
                        padding: '10px 20px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d3d3d3',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                        textAlign: 'left'
                    }}
                >
                    2. Elegir Personas
                </button>

                {/* DataGrid */}
                {showDataGrid && (
                    <div style={{ textAlign: 'left', margin: '0 auto', width: '67%', marginBottom: '20px', display: 'block',
                        padding: '10px 20px',
                        border: '1px solid #d3d3d3',
                        borderRadius: '8px', }}>
                    <DataGrid
                    
                    dataSource={usuarios}
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
                    <Selection mode="multiple" />
                    <GroupPanel visible={true} />
                    <HeaderFilter visible={true} />
                    <SearchPanel visible={true} highlightCaseSensitive={true} />
                    <Grouping autoExpandAll={false} />
                    <Export enabled={true} />
                    <Editing
                        mode="row"                        
                        newRowPosition="first"
                    />
                    <Column dataField="id" caption="ID" allowEditing={false} width={50} />
                    <Column dataField="nombre" caption="Nombre" />
                    <Column dataField="correo" caption="Correo" />
                    <Column dataField="telefono" caption="Telefono" />
                    <Column dataField="puesto" caption="Puesto" />
                </DataGrid>

                    </div>
                    
                )}

                <div style={{margin: '0 auto', width: '65%', marginBottom: '20px', display: 'block',
                        padding: '10px 20px',}}>
                    <button style={{ padding: '6px 12px', backgroundColor: '#007BFF',color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                        Guardar Cambios
                    </button>        
                </div>  
            </div>

                      
            
        </div>
    );
};

export default Keyquestion;
