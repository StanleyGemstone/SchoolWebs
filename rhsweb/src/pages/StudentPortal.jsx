import React from "react";
import { Link } from "react-router-dom";
import "../styles/StudentPortal.scss"; // For styling

const StudentPortal = () => {
  return (
    <div className="student-portal">
      <h1>Welcome to the Student Portal</h1>
      <nav className="student-nav">
        <ul>
          <li>
            <Link to="/student-profile">View Profile</Link>
          </li>
          <li>
            <Link to="/student-results">View Results</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default StudentPortal;
