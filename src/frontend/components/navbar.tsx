import React, { useState, useEffect } from "react";
import { Nav, Navbar, Button, Container } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";

export interface NavbarCompProps {
  username?: string;
  clearUsername: () => void;
}

export default function NavbarComp({ username, clearUsername }: NavbarCompProps) {
  const history = useHistory();

  const handleLogout = () => {
    // sessionStorage.removeItem('username');
    clearUsername();
    history.push("/home");
  };

  return (
    <>
      <Navbar expand="lg" className="navbar-main">
        <Navbar.Brand as={Link} to="/home" className="nav-brand">
          <b>Gamify</b>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto container-fluid">
            {!username && (
              <>
                <Nav.Link as={Link} to="/home" className="nav-item">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="nav-item">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-item">
                  Register
                </Nav.Link>
              </>
            )}
            {username && (
              <>
                <Nav.Link as={Link} to="/game" className="nav-item">
                  PLAY!
                </Nav.Link>

                <Nav.Link as={Link} to="/profile" className="nav-item">
                  Profile
                </Nav.Link>

                <Button
                  variant="dark"
                  size="sm"
                  name="logOut"
                  className="logout"
                  onClick={handleLogout}
                >
                  {" "}
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
}
