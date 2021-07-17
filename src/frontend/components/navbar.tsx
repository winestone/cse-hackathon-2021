import React, { useState, useEffect } from 'react';
import { Nav, Navbar, Button, Container } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';

export interface NavbarCompProps {
  username?: string;
  clearUsername: () => void;
}

export default function NavbarComp({ username, clearUsername }: NavbarCompProps) {
//   const [username, setUsername] = useState('');
// //
//   let userName = sessionStorage.getItem('username');
//   console.log(userName);
  const history = useHistory();

  //window.addEventListener('storage',(e) => {
  //  console.log('change');
  //  let user = sessionStorage.getItem('username');
  //  if (user) {
  //    setUsername(user);
  //  } else {
  //    setUsername('');
  //  }
  //})

  //Track changes to session storage to re render 


  const handleLogout = () => {
    //sessionStorage.removeItem('username');
    clearUsername();
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
            {!username && (
              <>
              <Nav.Link as={Link} to="/login" className="nav-item">Login</Nav.Link>
              </>
            )}
            {username && (
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