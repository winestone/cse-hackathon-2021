import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';

export default function Login () {
  const [username, setUsername] = useState('');
 
  const handleSubmit = () => {
    //check with database 
  }

  return (
    <>
      <Container fluid className="login-container">
        <Row>
        <Col md={6}>
            <div className="login-form-div">
            <Form onSubmit={handleSubmit} className="login-form">
            <h3 className="form-title">SIGN IN</h3>
            <h6 className="login-subtitle">Already registered? Log in to start playing!</h6>

            <Form.Group className="mb-3">
              <Form.Control
                name="name"
                type="text"
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
              />          
              </Form.Group>
            <div className="login-bottom">
            <button className="login-form-button" type="submit">
              Login!
            </button>
            </div>
          </Form>
        </div>

        </Col>
        <Col md={6}></Col>
        </Row>
      </Container>
    </>
  );
}
