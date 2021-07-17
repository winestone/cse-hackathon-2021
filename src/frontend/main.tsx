import React, { useEffect } from "react";
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

  return (
    <>
      <Router>
        <header> 
          <NavbarComp />
        </header> 
      <div>
        <Switch>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
        </Switch>
      </div>
    </Router>

    </>
  );
}

ReactDOM.render(<App />, document.getElementById("frontend"));
