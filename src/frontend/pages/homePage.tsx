import React from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";

export default function Home(): React.ReactElement {
  const history = useHistory();

  const goToRegister = () => {
    history.push("/register");
  };

  const goToLogin = () => {
    history.push("/login");
  };
  return (
    <>
      <Container fluid className="home-container">
        <Row>
          <Col md={2} />
          <Col md={8}>
            <h1 className="title">GAMIFY</h1>
            <h3 className="subtitle">Make an account to start playing</h3>
            <div>
              <button type="submit" className="register-button" onClick={goToRegister}>
                Register
              </button>
              <button type="submit" className="about-button" onClick={goToLogin}>
                Login
              </button>
            </div>
          </Col>
          <Col md={2} />
        </Row>
      </Container>
    </>
  );
}
