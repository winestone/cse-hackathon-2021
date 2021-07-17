import React, { useState, useEffect } from 'react';
import { Nav, Navbar, Button, Container } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';


export default function NavbarComp() {
  //const [userName, setUserName] = useState('');
//
  let userName = sessionStorage.getItem('username');
  console.log(userName);
  const history = useHistory();

  //Track changes to session storage to re render 


  const handleLogout = () => {
    sessionStorage.removeItem('username');
    history.push('/home')
  }

  return (
    <>

      <Navbar expand="lg" className="navbar-main">
        <Navbar.Brand as={Link} to="/" className="nav-item"><b>Gamify</b></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto container-fluid">
            <Nav.Link as={Link} to="/home" className="nav-item">Home</Nav.Link>
            {!userName && (
              <>
              <Nav.Link as={Link} to="/login" className="nav-item">Login</Nav.Link>
              </>
            )}
            {userName && (
              <>
              <Button variant="dark" size="sm" name="logOut" className="logout" onClick={handleLogout}> Logout</Button>
            </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

    </>
  
  );

}