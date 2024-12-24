// import React, { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import TeacherPortalNav from "../components/TeacherPortalNav";
// import "../styles/TeacherPortal.scss";


// const TeacherPortal = () => {
//   const [loading, setLoading] = useState(true); // Track loading state
//   const navigate = useNavigate();
//   const auth = getAuth(); // Initialize Firebase auth instance

//   useEffect(() => {
//     const checkAuth = () => {
//       onAuthStateChanged(auth, (user) => {
//         if (user) {
//           setLoading(false); // User is authenticated, stop loading
//         } else {
//           alert("You must be signed in to access this page.");
//           navigate("/signin"); // Redirect to signin if no user is authenticated
//         }
//       });
//     };

//     checkAuth();
//   }, [auth, navigate]);

//   if (loading) {
//     return <p>Loading...</p>; // Show loading state while checking auth
//   }

//   return (
//     <div className="teacher-portal">
//       <h1>WELCOME TEACHER __________</h1>
//       <TeacherPortalNav />
//     </div>
//   );
// };

// export default TeacherPortal;

import React from "react";
import "../styles/TeacherPortal.scss";
import { Link } from "react-router-dom";
import Logo from '../utils/logo.png';

const TeacherPortal = () => {
  return (
    <div className="teacher-portal">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src={Logo} sizes="16x16" alt="School Logo" />
          <h1>ROYAL HERITAGE SCHOOL</h1>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/register-student">Register Student</Link></li>
          <li><Link to="/add-score">Add Scores</Link></li>
          <li><Link to="/view-students">View Students</Link></li>
          <li><Link to="/signin">Sign Out</Link></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h1>Welcome to Your Portal</h1>
        <p>Select an option to proceed:</p>
        <div className="action-buttons">
          <Link to="/register-student" className="action-button">Register Student</Link>
          <Link to="/add-score" className="action-button">Add Scores</Link>
          <Link to="/view-students" className="action-button">View Students</Link>
        </div>
      </main>
    </div>
  );
};

export default TeacherPortal;