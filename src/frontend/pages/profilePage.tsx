import React, { useState, useEffect } from "react";
import { Badge, Container, Row, Col, ProgressBar } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import * as api from "@common/api";

export default function Profile(): React.ReactElement {
  const username = sessionStorage.getItem("username");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [profileNo, setProfileNo] = useState(0);
  const [favGame, setFaveGame] = useState('');
  const [progress, setProgress] = useState<number[]>([]);

  async function getAchievements() {
    const u = sessionStorage.getItem("username");
    if (u) {
      console.log(u);
      const res = await api.getUserAchievements({ name: u });
      const a = [];
      for (let i = 0; i < res.achievements.length; i++) {
        a.push(res.achievements[i].achievements);
      }
      setAchievements(a.slice(0, 3));
      const randomNo = u.length % 3;
      setProfileNo(randomNo);
      if (randomNo == 1) {
        setFaveGame('Spelling bee')
      }
      else if (randomNo === 2) {
        setFaveGame('Math Blocks');
      } 
      else {
        setFaveGame('Biology Boggle')
      }

      // progress bars. 
      let p = []; 
      for (let i = 0; i < u.length; i++) {
        let n = u.charCodeAt(i)%100; 
        if (n < 25) {
          n += 30; 
        }
        p.push(n); 
      }
      if (p.length < 4) {
        for (let x = p.length; x < 4; x++) {
          p.push(20)
        }
      }
      setProgress(p);
    }
  }

  useEffect(() => {
    getAchievements();
  }, []);

  return (
    <>
      <Container fluid>
        <Row>
          <Col md={4} />
          <Col md={4} className="profile-div">
            <img src={`/static/${profileNo}.png`} alt="Profile" />
            <h1 className="profile-title">{username}</h1>
            <div className="badges">
              {achievements.map((achievement, idx) => (
                <div key={idx} className={`badge${idx}`}>
                  {achievement}
                </div>
              ))}
            </div>
            <div className="profile-text">
              <p>Favourite game: <b>{favGame} </b> </p>
            </div>
            
          </Col>
          <Col md={4}> </Col>
        </Row>
        <Row>
          <Col md={3}> </Col>
            <Col md={6}>
              <ProgressBar animated striped now={progress[0]} className='progress-1' label={'Maths'}/> 
              <ProgressBar animated striped now={progress[1]}  className='progress-2' label={'English'}/>
              <ProgressBar animated striped now={progress[2]}  className='progress-3' label={'Science'}/>
              <ProgressBar animated striped now={progress[3]}  className='progress-4' label={'Languages'}/>
            </Col>
          <Col md={3}></Col>

        </Row>
      </Container>
    </>
  );
}
