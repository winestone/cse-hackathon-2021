import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import * as api from "@common/api";
import { Username } from "@common/common";
import Home from "./pages/homePage";
import NavbarComp from "./components/navbar";
import Login from "./pages/loginPage";
import Register from "./pages/registerPage";
import Profile from "./pages/profilePage";
import { Game } from "./pages/Game";
// import { GameWrapper } from "./pages/Game";

function App(): React.ReactElement {
  const [username, setUsername] = useState<string | undefined>();

  useEffect(() => {
    setUsername(window.sessionStorage.getItem("username") ?? undefined);
  }, []);

  const changeUsername = (newUsername: string) => {
    sessionStorage.setItem("username", newUsername);
    setUsername(newUsername);
  };

  const clearUsername = () => {
    sessionStorage.removeItem("username");
    setUsername(undefined);
  };

  return (
    <Router basename="/client">
      <header>
        <NavbarComp username={username} clearUsername={clearUsername} />
      </header>
      <div>
        <Switch>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/login">
            <Login setUsername={changeUsername} />
          </Route>
          <Route path="/register">
            <Register setUsername={changeUsername} />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/game">
            <Game username={username as Username} />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("frontend"));
