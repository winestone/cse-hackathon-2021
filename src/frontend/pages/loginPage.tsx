import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import * as api from "@common/api";

export interface LoginProps {
  setUsername: (username: string) => void;
}

export default function Login (props: LoginProps) {
  const [username, setUsername] = useState('');
  const history = useHistory();
  const [loginErr, setLoginErr] = useState(false);

 
  const handleSubmit = async (event:any) => {
    event.preventDefault();
    const res = await api.loginUser({name:username});
    if (res.success) {
      props.setUsername(username);
      history.push('/home');  
      setLoginErr(false);
    } else {
      setLoginErr(true);
    }

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
              {loginErr && 
                <h6 className="login-error">Username doesn't exist.</h6>
              }

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
