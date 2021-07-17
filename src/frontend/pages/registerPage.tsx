import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';


export default function Register () {
  const [username, setUsername] = useState(''); 
  const history = useHistory();


  const handleSubmit = (event: any) => {
    event.preventDefault();
    sessionStorage.setItem('username', username);
    history.push('/home');

    //Add username to database 

    
  }
 
  return (
    <>
      <Container fluid>
        <h1>Register</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Enter username</Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />          
            </Form.Group>

          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}
