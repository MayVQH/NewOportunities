import React, { useEffect,useState} from 'react';
import { useNavigate } from "react-router-dom"; 
import DataGrid, { Column, Export, Editing, SearchPanel, HeaderFilter, GroupPanel, Grouping, Selection } from 'devextreme-react/data-grid';
import { CheckBox } from 'devextreme-react/check-box';
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css"
import saveAs from 'file-saver';
import { Workbook } from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { Navbar, Nav, Button, Spinner, Container, Row, Col, Badge } from "react-bootstrap";
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
    const [usuarios, setUsuarios] = useState([]);
    const [themes,setThemes] = useState([]);
    const [SelectedQuestions,setSelectedQuestions] = useState([]);
    const [selectedUserKeys, setSelectedUserKeys] = useState([]);
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [toastMessage,setToastMessage] = useState("");
    const [keyQuestionName, setKeyQuestionName] = useState("");
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
        const fetchUsers = async () => {
          try {
            const response = await fetch('http://localhost:3000/api/themes/roles');
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({
                message: 'Error desconocido'
              }));
              throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
            }
      
            const data = await response.json();
            console.log(data)
      
            // Transformación de datos
            const usuariosMap = new Map();
            const preselected = [];

            data.recordsets[0].forEach(item => {
              const { idUsuario, Nombre, nombreTipo,Email } = item;
              console.log("item:",item)
              console.log("nombre tipo:",nombreTipo)
      
              if (!usuariosMap.has(idUsuario)) {
                usuariosMap.set(idUsuario, {
                  idUsuario,
                  Nombre,
                  nombreTipo,
                  isComite: nombreTipo.toLowerCase() === 'comite',
                  Email
                });
              }

              if (nombreTipo.toLowerCase() === 'comite') {
                preselected.push(idUsuario);
                }
            });

            
      
            const usuariosArray = Array.from(usuariosMap.values());
            setUsuarios(usuariosArray);
            setSelectedUserKeys(preselected);
            console.log('usuariosArray',usuariosArray)
          } catch (error) {
            console.error('Error obteniendo los datos', error);
          }
        };
      
        fetchUsers();
      }, []);


        
      
    useEffect(() => {
            const fetchThemes = async () => {
                try {
                    const response = await fetch('http://localhost:3000/api/themes');
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({
                            message: 'Error desconocido'
                        }));
                        throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
                    }
    
                    const data = await response.json();
                    console.log('respuesta obtenida',data)
                    setThemes(data.map(theme => ({
                        id: theme.id,
                        nombre: theme.nombre,
                        questions: theme.preguntas || [],
                        flag:theme.flag,
                        idQuestions : theme.preguntas_id || [],
                    })));
                } catch (error) {
                    console.error('Error obteniendo los datos', error);
                }
            };
    
            fetchThemes();
        }, []);


    const handleCheckboxChange = (themeId, questionText) => {
        setSelectedQuestions((prev) => {
            const prevSelected = prev[themeId] || [];
            const isSelected = prevSelected.includes(questionText);
            const updated = isSelected
            ? prevSelected.filter((q) => q !== questionText)
            : [...prevSelected, questionText];
            return { ...prev, [themeId]: updated };
        });
       };
      

    const [showDataGrid, setShowDataGrid] = useState(false);
    const [showTemas, setShowTemas] = useState(false);
    

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

    const hasSelectedQuestions = () => {
        return Object.values(SelectedQuestions).some((questions) => questions.length > 0);
    };

    const showValidationPopup = (message) => {
        setToastMessage(message);
        setShowValidationMessage(true);
        setTimeout(() => {
            setShowValidationMessage(false);
        }, 3000);
        console.log(toastMessage)
    };

    const handleSubmit = async () => {

        if (!keyQuestionName.trim().length > 0) {
            const message = 'Debes escribir el nombre de la pregunta clave'
            showValidationPopup(message);

        }

        if (!hasSelectedQuestions()) {
            const message = 'Debes seleccionar al menos una pregunta '
            showValidationPopup(message);

        }

        let formattedQuestion = keyQuestionName.trim();

        formattedQuestion = formattedQuestion.charAt(0).toUpperCase() + formattedQuestion.slice(1);

        if (!formattedQuestion.startsWith('¿')) {
            formattedQuestion = '¿' + formattedQuestion;
        }
        if (!formattedQuestion.endsWith('?')) {
            formattedQuestion += '?';
        }
        setKeyQuestionName(formattedQuestion);

        console.log('Preguntas seleccionadas:', SelectedQuestions);
        console.log('Usuarios seleccionados:', selectedUserKeys);
        console.log('Nombre Pregunta',formattedQuestion);

        const payload = {
            nombrePreguntaClave: formattedQuestion,
            usuarios: selectedUserKeys,
            preguntasPorTema: SelectedQuestions
        };

        console.log('respuesta enviada',payload)

        try {
            const response = await fetch('http://localhost:3000/api/themes/crear/preguntaClave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error('Error al guardar los datos');
            }
    
            showValidationPopup('Datos guardados exitosamente.');
        } catch (error) {
            console.error(error);
            showValidationPopup('Error al guardar los datos.');
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
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer active" onClick={() => navigate("/temas")}>Temas</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/enrolamiento")}>Enrolamiento</Nav.Link>
                                        <Nav.Link as="div" className="nav-link-pointer" onClick={() => navigate("/dashboard")}>Dashboard</Nav.Link>
                                    </Nav>
                                    <Button variant="outline-light" className="ms-auto" onClick={handleLogout}>Sign out</Button> {/* Changed to ms-auto */}
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>

            

            <div style={{ padding: '20px', border: '1px solid rgb(178, 176, 176)', borderRadius: '8px', margin: '15px'}}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Pregunta Clave</h3>
                <input 
                    type="text" 
                    value={keyQuestionName}
                    onChange={(e) => setKeyQuestionName(e.target.value)}
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
                        {themes.map((theme) => (
                            <div key={theme.id} style={{ marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '10px' }}>{theme.nombre}</h3>
                            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                                {theme.questions.map((question, index) => (
                                <li key={`${theme.id}-${index}`} className="mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                                    <Badge bg="secondary" className="me-2">{index + 1}</Badge>
                                    <CheckBox
                                    text={question}
                                    value={SelectedQuestions[theme.id]?.includes(question) || false}
                                    onValueChanged={() => handleCheckboxChange(theme.id, question)}
                                    />
                                </li>
                                ))}
                            </ul>
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
                    keyExpr="idUsuario"
                    showBorders={true}
                    allowColumnReordering={true}
                    rowAlternationEnabled={true}
                    columnAutoWidth={true}
                    repaintChangesOnly={true}
                    onExporting={onExporting}
                    // selectedRowKeys={selectedUserKeys}
                    // onSelectedRowKeysChange={(newSelection) => setSelectedUserKeys(newSelection)}
                >
                    {/* <Selection mode="multiple" /> */}
                    <GroupPanel visible={true} />
                    <HeaderFilter visible={true} />
                    <SearchPanel visible={true} highlightCaseSensitive={true} />
                    <Grouping autoExpandAll={false} />
                    <Export enabled={true} />
                    <Editing
                        mode="row"                        
                        newRowPosition="first"
                    />
                    <Column
                            caption=""
                            width={90}
                            cellRender={({ data }) => (
                                <input
                                    type="checkbox"
                                    checked={selectedUserKeys.includes(data.idUsuario)}
                                    disabled={data.isComite}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        if (checked) {
                                            setSelectedUserKeys(prev => [...prev, data.idUsuario]);
                                        } else {
                                            setSelectedUserKeys(prev => prev.filter(id => id !== data.idUsuario));
                                        }
                                    }}
                                    style={{
                                        width: '20px',  
                                        height: '20px',
                                        cursor: data.isComite ? 'not-allowed' : 'pointer'
                                    }}
                                />
                            )}
                        />
                    <Column dataField="idUsuario" caption="ID" allowEditing={false} width={50} />
                    <Column dataField="Nombre" caption="Nombre" />
                    <Column dataField="Email" caption="Correo" />
                    <Column dataField="nombreTipo" caption="Rol" />
                </DataGrid>

                

                    </div>
                    
                )}

                <div style={{margin: '0 auto', width: '65%', marginBottom: '20px', display: 'block',
                        padding: '10px 20px',}}>
                    <button style={{ padding: '6px 12px', backgroundColor: '#007BFF',color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        onClick={handleSubmit}>
                        Guardar Cambios
                    </button>        
                </div>  

                <div className="w-100 d-flex justify-content-end mt-3">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/preguntas-clave')}
                    >
                        Volver
                    </Button>
                </div>
            </div>
            {showValidationMessage && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                    <div className="toast align-items-center text-white bg-danger border-0 show">
                        <div className="d-flex">
                            <div className="toast-body">
                                Llene todos los campos antes de continuar.
                            </div>
                        </div>
                    </div> 
                    </div>
             )}
    
          
        </div>

        
    );
};

export default Keyquestion;
