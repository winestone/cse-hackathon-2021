import React from "react";
import { Link } from "react-router-dom";

const Home = (): JSX.Element => {
  return (
    <div>
      <ul>
        <li>
          <button type="button">
            <Link to="/client">Home</Link>
          </button>
        </li>
        <li>
          <button type="button">
            <Link to="/client/login">Login</Link>
          </button>
        </li>
      </ul>
      <p>This is a home page</p>
    </div>
  );
};

export default Home;
