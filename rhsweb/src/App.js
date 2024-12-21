import React from "react";
// import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import RegisterStudent from "./pages/RegisterStudent";
import AddScore from "./pages/AddScore";
import TeacherPortal from "./pages/TeacherPortal";
import "./index.scss"; // Import global styles

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/add-score" element={<AddScore />} />
        <Route path="/teacherportal" element={<TeacherPortal />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;

