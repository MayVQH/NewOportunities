import React, { useEffect,useState, useCallback} from 'react';
import { useNavigate } from "react-router-dom"; 
import DataGrid, { Column, Editing, SearchPanel, HeaderFilter, GroupPanel, Grouping, Export } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import "../Styles/Dashboard.css";
import 'jspdf-autotable';
import { exportDataGrid as exportToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportToExcel } from 'devextreme/excel_exporter';
import { jsPDF } from 'jspdf';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Toast } from 'devextreme-react/toast';



// const [toastConfig, setToastConfig] = useState<{
//   isVisible: false,
//   type: 'info' | 'error' | 'success',
//   message: ''
// }>({
//   isVisible: false,
//   type: 'info',
//   message: '',
// });


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



const PruebaRoles = () => {
  const [user, setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const navigate = useNavigate();
  //const [sessionUser, setSessionUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [toastConfig, setToastConfig] =useState({
    isVisible: false,
    type: 'info',
    message: '',
  });

  const onHiding = useCallback(() => {
    setToastConfig({
      ...toastConfig,
      isVisible: false,
    });
  }, [toastConfig, setToastConfig]);
  
 

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
        data.recordsets[0].forEach(item => {
          const { idUsuario, Nombre, nombreTipo } = item;
          console.log("item:",item)
          console.log("nombre tipo:",nombreTipo)
  
          if (!usuariosMap.has(idUsuario)) {
            usuariosMap.set(idUsuario, {
              idUsuario,
              Nombre,
              comite: false,
              moderador: false,
              usuario: false
            });
          }
  
          const usuario = usuariosMap.get(idUsuario);
          if (nombreTipo.toLowerCase() === 'comite') usuario.comite = true;
          if (nombreTipo.toLowerCase() === 'moderador') usuario.moderador = true;
          if (nombreTipo.toLowerCase() === 'usuario') usuario.usuario = true;
        });
  
        const usuariosArray = Array.from(usuariosMap.values());
        setUsuarios(usuariosArray);
      } catch (error) {
        console.error('Error obteniendo los datos', error);
      }
    };
  
    fetchUsers();
  }, []);

  
  

  // const [usuarios] = useState([
  //   { id: 1, nombre: 'Edgar Lopez', comite: false, moderador: false, usuario: true },
  //   { id: 2, nombre: 'Sara Herrera', comite:true, moderador: false, usuario: false},
  //   { id: 3, nombre: 'Guadalupe Perez',  comite:false,moderador: true, usuario: false},
  //   { id: 4, nombre: 'Jose Garcia', comite:false, moderador: false, usuario: true},
  //   { id: 5, nombre: 'Pedro Martinez', comite: false, moderador: false, usuario: true},
  //   { id: 6, nombre: 'Lucia Gomez', comite: true, moderador: false, usuario: false},
  //   { id: 7, nombre: 'Victor Vazquez', comite:false,moderador: false, usuario: true},
  // ]);

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

 

  if (loading){
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );
  }

  
  const handleRowUpdated = async (e) => {
  const tipos = [ 
    {id:'7D532F89-A63E-4667-B7CB-A4B477A55017',nombre:	'comite'},
    {id:'D3B78325-006E-4230-AE7E-C188181AE8B8',nombre:	'moderador'},
    {id:'84F03A04-2891-4DE7-8A3D-DBD2018EAE47',nombre:'usuario'}]
    console.log('Fila actualizada:', e.data);

    const tipoActivo = tipos.find(tipo => e.data[tipo.nombre] === true);
    const id = tipoActivo ? tipoActivo.id : null;
    const idUsuario = e.data.idUsuario

    console.log('TipoId',id)
    console.log('idUsuario',idUsuario)

    console.log('tipos',tipos)

    try {
      const response = await fetch(`http://localhost:3000/api/themes/updatedroles/${idUsuario}/${id}`,{method:'PUT'});
      if (!response.ok) {
        const errorData =  response.json().catch(() => ({
          message: 'Error desconocido'
        }));
        throw new Error(errorData.message || 'La respuesta de la web no fue satisfactoria');
      }

      setToastConfig({
        ...toastConfig,
        isVisible: true,
        type:'success',
        message:'Usuario actualizado',
      });
      
      

      
    } catch (error) {
      console.error('Error obteniendo los datos', error);
    }

    
  };

  

  const booleanFields = ['comite', 'usuario', 'moderador'];

  const handleCellValueChanged = (e) => {
    const changedField = e.column.dataField;
  
    if (booleanFields.includes(changedField) && e.value === true) {
      const rowData = e.data;
  
      booleanFields.forEach((field) => {
        if (field !== changedField && rowData[field] === true) {
          rowData[field] = false;
        }
      });
  
      e.component.refresh(true); // Forzar redibujo
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
          
            
          <DataGrid
            dataSource={usuarios}
            keyExpr="idUsuario"
            showBorders={true}
            allowColumnReordering={true}
            rowAlternationEnabled={true}
            columnAutoWidth={true}
            repaintChangesOnly={true}
            onExporting={onExporting}
            //editing={{ mode: 'row', allowUpdating: true }}
            onRowUpdated={handleRowUpdated}
            onCellValueChanged={handleCellValueChanged}
            // onEditorPreparing={(e) => {
            //   if (["comite", "usuario", "moderador"].includes(e.dataField) && e.parentType === "dataRow") {
            //     e.editorOptions.onValueChanged = (args) => {
            //       if (args.value === true) {
            //         const keys = ["comite", "usuario", "moderador"];
            //         keys.forEach((key) => {
            //           if (key !== e.dataField) {
            //             e.row.data[key] = false;
            //           }
            //         });
            //       }
          
            //       // Actualiza el valor actual
            //       e.setValue(args.value);
            //     };
            //   }
            // }}                   
          >
            <GroupPanel visible={true} />
            <HeaderFilter visible={true} />
            <SearchPanel visible={true} highlightCaseSensitive={true} />
            <Grouping autoExpandAll={false} />
            <Export
              enabled={true}
              formats={['pdf', 'xlsx', 'csv']}
              fileName="Roles"
              allowExportSelectedData={false}
            />

            <Editing
              mode="row"            
              allowUpdating={true}  
              useIcons={true}  
            />
            <Column dataField="idUsuario" caption="ID" allowEditing={false} width={50} />
            <Column dataField="Nombre" caption="Nombre" allowEditing={false} />
            <Column dataField="comite" caption="Comité" dataType="boolean" />
            <Column dataField="moderador" caption="Moderador" dataType="boolean" />
            <Column dataField="usuario" caption="Usuario" dataType="boolean" />
          </DataGrid>
          
          <Toast
            visible={toastConfig.isVisible}
            message={toastConfig.message}
            type={toastConfig.type}
            onHiding={onHiding}
            displayTime={600}
          />

          
      </div>
    </div>
  );
};

export default PruebaRoles;
