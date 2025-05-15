import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Navbar, Nav, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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
      if (event.origin === 'http://localhost:3000' && event.data.user) {
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    navigate("/preguntas-clave", { state: { selectedDate: newDate } });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    
    const weeks = [];
    let days = [];
    
    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="calendar-day text-muted p-2">
          {daysInPrevMonth - i}
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const isSelected = selectedDate.getDate() === day && 
                         selectedDate.getMonth() === month && 
                         selectedDate.getFullYear() === year;
      
      days.push(
        <div 
          key={day}
          className={`calendar-day p-2 ${isToday ? 'today bg-primary text-white' : ''} ${isSelected ? 'selected bg-info text-dark' : ''}`}
          onClick={() => handleDateClick(day)}
          style={{ cursor: 'pointer' }}
        >
          {day}
        </div>
      );

      if (days.length === 7 || day === daysInMonth) {
        weeks.push(<div key={`week-${day}`} className="d-flex">{days}</div>);
        days = [];
      }
    }
    
    // Next month's days
    if (days.length > 0) {
      const daysNeeded = 7 - days.length;
      for (let i = 1; i <= daysNeeded; i++) {
        days.push(
          <div key={`next-${i}`} className="calendar-day text-muted p-2">
            {i}
          </div>
        );
      }
      weeks.push(<div key={`week-end`} className="d-flex">{days}</div>);
    }
    
    return weeks;
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

      {/* Main Content */}
      <Container fluid className="flex-grow-1 py-4">
        <Row className="g-4">
          {/* Calendar Section */}
          <Col lg={4} className="order-lg-1">
            <div className="border rounded p-3 shadow-sm h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="outline-secondary" onClick={handlePrevMonth}>
                  <i className="bi bi-chevron-left"></i>
                </Button>
                <h4 className="mb-0 text-center">
                  {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                </h4>
                <Button variant="outline-secondary" onClick={handleNextMonth}>
                  <i className="bi bi-chevron-right"></i>
                </Button>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="text-center fw-bold" style={{ width: '14%' }}>{day}</div>
                ))}
              </div>
              
              <div className="calendar-grid">
                {renderCalendar()}
              </div>
            </div>
          </Col>
          
          {/* Main Content Area */}
          <Col lg={8} className="order-lg-2">
            <div className="border rounded p-3 shadow-sm h-100">
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;