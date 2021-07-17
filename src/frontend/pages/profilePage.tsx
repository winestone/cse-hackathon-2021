import React, { useState } from 'react';
import { Badge, Container, Row, Col } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

export default function Profile () {
  let username = sessionStorage.getItem('username');
  return (
    <>
      <Container fluid>
        <Row>
          <Col md={4}></Col>
          <Col md={4} className="profile-div"> 
            <img src="static/cat.png"/>
            <h1 className="profile-title">{username}</h1>
            <div className="badges">
              <div className="badge1">new</div>
              <div className="badge2">spelling bee champion</div>
              <div className="badge3">1000 points</div>
            </div>
          </Col>
          <Col md={4}></Col>
        </Row>
      </Container>
    </>
  )
}