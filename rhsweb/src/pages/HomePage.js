import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../styles/HomePage.scss";

const Homepage = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <div className="homepage">
      <Helmet>
         <title>RHS-Home</title>
      </Helmet>
      <header className="homepage-header">
        <div className="logo">
          <img src="../utils/logo.PNG" alt="School Logo" />
          <h1>ROYAL HERITAGE SCHOOL</h1>
        </div>
        <nav className="homepage-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            {!isLoggedIn ? (
              <li>
                <Link to="/signin">Login</Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => {
                    getAuth().signOut();
                  }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main className="homepage-main">
        <h2>Welcome to Royal Heritage School</h2>
        <p>
          Easily manage student records, grades, and performance. Teachers,
          students, and administrators can access their portals to streamline
          academic processes.
        </p>
        <Link to="/signup" className="cta-btn">
          Get Started
        </Link>
      </main>
    </div>
  );
};

export default Homepage;