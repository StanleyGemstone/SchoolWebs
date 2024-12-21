import React from "react";
import { Helmet } from "react-helmet";
import "../styles/HomePage.scss";

const HomePage = () => {
  return (
    <div className="homepage">
      <Helmet>
        <title>RHS-Home</title>
      </Helmet>
      <header className="homepage__header">
        <div className="homepage__logo">
          <h1>Royal Heritage Schools</h1>
        </div>
        <nav className="homepage__nav">
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/signin">Signin</a></li>
            <li><a href="/signup">Signup</a></li>
          </ul>
        </nav>
      </header>
      <main className="homepage__main">
        <h2>Welcome to Our School</h2>
        <p>Empowering students for a brighter future!</p>
      </main>
    </div>
  );
};

export default HomePage;
