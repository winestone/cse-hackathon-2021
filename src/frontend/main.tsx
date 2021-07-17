import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import Home from './pages/homePage'; 
import NavbarComp from './components/navbar';
import Login from './pages/loginPage';
import Register from './pages/registerPage';

import * as api from "@common/api";

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

function App(): JSX.Element {
  const [username, setUsername] = useState<string | undefined>()

  useEffect(() => {
    setUsername(window.sessionStorage.getItem("username") ?? undefined);
  }, []);

  const changeUsername = (username: string) => {
    sessionStorage.setItem('username', username);
    setUsername(username);
  }

  const clearUsername = () => {
    sessionStorage.removeItem('username');
    setUsername(undefined);
  }

  return (
    <>
      <Router>
        <header> 
          <NavbarComp username={username} clearUsername={clearUsername}/>
        </header> 
      <div>
        <Switch>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/login">
            <Login setUsername={changeUsername}/>
          </Route>
          <Route path="/register">
            <Register setUsername={changeUsername}/>
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>

    </>
  );
}

ReactDOM.render(<App />, document.getElementById("frontend"));
