import React from "react";
import "../styles/TeacherPortal.scss";
import useAuth from "../components/useAuth";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../utils/logo.png";
import { getAuth, signOut } from "firebase/auth";

const TeacherPortal = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/signin"); // Redirect to Sign In page after sign out
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  if (!currentUser) {
    return <p>Loading...</p>; // Handle case where user data is still being fetched
  }

  return (
    <div className="teacher-portal">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src={Logo} alt="School Logo" />
          <h1>ROYAL HERITAGE SCHOOL</h1>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/register-student">Register Student</Link>
          </li>
          <li>
            <Link to="/add-score">Add Scores</Link>
          </li>
          <li>
            <Link to="/view-students">View Students</Link>
          </li>
          <li>
            <Link to="/reportsheet-view">Results Reportsheet</Link>
          </li>
          <li>
            <Link to="/single-view">Singlesheet Results</Link>
          </li>
          <li>
            <button className="sign-out-button" onClick={handleSignOut}>
              Sign Out
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h1>Welcome, Teacher {currentUser.firstName || "Teacher"}!</h1>
        <div className="action-buttons">
          <Link to="/register-student" className="action-button">
            Register Student
          </Link>
          <Link to="/add-score" className="action-button">
            Add Scores
          </Link>
          <Link to="/view-students" className="action-button">
            View Students
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TeacherPortal;