import { Navbar, Nav, Button, Spinner, Container, Row, Col,Alert } from "react-bootstrap";

const Unauthorized = () => {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">
          <h2>Acceso denegado</h2>
          <p>No tiene permisos para entrar a esta ruta</p>
          <Button href="/dashboard">Regresar al Inicio</Button>
        </Alert>
      </Container>
    );
  };

export default Unauthorized;
