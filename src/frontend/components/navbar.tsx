import React, { useState, useEffect } from 'react';
import { Nav, Navbar, Button, Container } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';


export default function NavbarComp() {
  //const [userName, setUserName] = useState('');
//
  let userName = sessionStorage.getItem('username');
  console.log(userName);

  //Track changes to session storage to re render 

  return (
    <>
      <Navbar expand="lg" className="navbar-main">
        <Navbar.Brand as={Link} to="/">Gamify</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>
            {!userName && (
              <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
            {userName && (
            <Button variant="warning" size="sm" name="logOut">Logout</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

    </>
  
  );

}