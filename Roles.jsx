import React, { useEffect,useState } from 'react';
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

  const [usuarios] = useState([
    { id: 1, nombre: 'Edgar Lopez', moderador: false, usuario: true },
    { id: 2, nombre: 'Sara Herrera', moderador: true, usuario: false},
    { id: 3, nombre: 'Guadalupe Perez',  moderador: true, usuario: false},
    { id: 4, nombre: 'Jose Garcia', moderador: false, usuario: true},
    { id: 5, nombre: 'Pedro Martinez', moderador: false, usuario: true},
    { id: 6, nombre: 'Lucia Gomez', moderador: true, usuario: false},
    { id: 7, nombre: 'Victor Vazquez', moderador: false, usuario: true},
  ]);

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
          <button style={{ padding: '6px 12px', backgroundColor: '#007BFF',color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
              Guardar Cambios
          </button>
            
          <DataGrid
            dataSource={usuarios}
            keyExpr="id"
            showBorders={true}
            allowColumnReordering={true}
            rowAlternationEnabled={true}
            columnAutoWidth={true}
            repaintChangesOnly={true}
            onExporting={onExporting}
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
              mode="cell"
              allowUpdating={true}
            />
            <Column dataField="id" caption="ID" allowEditing={false} width={50} />
            <Column dataField="nombre" caption="Nombre" allowEditing={false} />
            <Column dataField="moderador" dataType="boolean" />
            <Column dataField="usuario" dataType="boolean" />
          </DataGrid>
      </div>
    </div>
  );
};

export default PruebaRoles;
