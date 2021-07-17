import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import * as api from "@common/api";


export interface RegisterProps {
  setUsername: (username: string) => void;
}
export default function Register (props: RegisterProps) {
  const [username, setUsername] = useState(''); 
  const history = useHistory();
  const [registerErr, setRegisterErr] = useState(false);


  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const res = await api.registerUser({name:username});
    console.log(res);
    if (res.success) {
      props.setUsername(username);
      // sessionStorage.setItem('username', username);
      history.push('/profile');  
      setRegisterErr(false);
    } else {
      setRegisterErr(true);
    }
    

    //Add username to database 
  }
 
  return (
    <>
      <Container fluid className="register-container">
        <Row>
          <Col md={6}></Col>
          <Col md={6}>
            <div className="register-form-div">
            <Form onSubmit={handleSubmit} className="register-form">
            <h3 className="form-title">JOIN NOW</h3>
            <h6 className="register-subtitle">Simply register with a username and start playing for free!</h6>

            <Form.Group className="mb-3">
              <Form.Control
                name="name"
                type="text"
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
              />          
              </Form.Group>
              {registerErr && 
                <h6 className="register-error">Username exists. Choose another</h6>
              }
            <div className="register-bottom">
            <button className="register-form-button" type="submit">
              Register!
            </button>
            </div>
          </Form>
        </div>

          </Col>
        </Row>
      </Container>
    </>
  );
}
