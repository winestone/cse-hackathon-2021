import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import * as api from "@common/api";
import { GameWrapper } from "./pages/Game";
import { GameMath } from "./pages/GameMath";
import Home from "./pages/Home";

function App(): JSX.Element {
  const [exampleGetResult, setExampleGetResult] = React.useState<string | undefined>();
  const [examplePostResult, setExamplePostResult] = React.useState<string | undefined>();

  useEffect(() => {
    (async () => {
      setExampleGetResult(JSON.stringify(await api.exampleGet()));
    })();
    (async () => {
      setExamplePostResult(JSON.stringify(await api.examplePost({})));
    })();
  }, []);

  return (
    // <>
    //   <div>api.exampleGet: {exampleGetResult === undefined ? "Loading ..." : exampleGetResult}</div>
    //   <div>
    //     api.examplePost: {examplePostResult === undefined ? "Loading ..." : examplePostResult}
    //   </div>
    // </>
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
        <Switch>
          <Route exact path="/client">
            <Home />
          </Route>
          <Route path="/client/login">
            <GameWrapper />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("frontend"));
