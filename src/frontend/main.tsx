import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import * as api from "@common/api";
import { GameWrapper } from "./pages/Game";

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
    <>
      <div>api.exampleGet: {exampleGetResult === undefined ? "Loading ..." : exampleGetResult}</div>
      <div>
        api.examplePost: {examplePostResult === undefined ? "Loading ..." : examplePostResult}
      </div>
    </>
  );
}

ReactDOM.render(<GameWrapper />, document.getElementById("frontend"));
