import React from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import {useHistory} from 'react-router-dom';



export default function Home() {
  const history = useHistory();

  const goToRegister = () => {
    history.push('/register');
  }

  return (
    <>
      <Container>
        <Row>
          <Col md={2}></Col>

          <Col md={8}>
            <h1 className="title">GAMIFY</h1>
            <h3 className="subtitle">Make an account to start playing</h3>
            <div> 
              <button className="register-button" onClick={goToRegister}>Register</button>
              <button className="about-button">About</button>
            </div>
          </Col>
          <Col md={2}></Col>
        </Row>
      </Container>
    </>
  
  );
}