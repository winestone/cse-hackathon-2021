import React, { useState, useEffect } from 'react';
import { Badge, Container, Row, Col } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import * as api from "@common/api";

export default function Profile () {
  let username = sessionStorage.getItem('username');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [profileNo, setProfileNo] = useState(0);

  async function getAchievements() {
    let u = sessionStorage.getItem('username');
    if (u) {
      console.log(u);
      let res = await api.getUserAchievements({name:u});
      let a = [];
      for (let i = 0; i < res.achievements.length; i++){
        a.push(res.achievements[i].achievements);
      }
      setAchievements(a.slice(0,3));
      let randomNo = (u.length)%3;
      setProfileNo(randomNo);  
    }
  }

  useEffect(() => {
    getAchievements();
  }, []);

  return (
    <>
      <Container fluid>
        <Row>
          <Col md={4}></Col>
          <Col md={4} className="profile-div"> 
            <img src={`static/${profileNo}.png`}/>
            <h1 className="profile-title">{username}</h1>
            <div className="badges">
            {achievements.map((achievement, idx) =>
            ( 
              <div key={idx} className={`badge${idx}`}>{achievement}</div>
            )
            )}
            </div>
          </Col>
          <Col md={4}></Col>
        </Row>
      </Container>
    </>
  )
}