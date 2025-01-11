import React from "react";
// import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import RegisterStudent from "./pages/RegisterStudent";
import AddScores from "./pages/AddScores";
import TeacherPortal from "./pages/TeacherPortal";
import StudentPortal from "./pages/StudentPortal";
import StudentProfile from "./pages/StudentProfile";
import StudentResults from "./pages/StudentResults";
import ViewStudents from "./pages/ViewStudents";
import NotFound from "./components/NotFound";
import SingleView from "./pages/SingleView";
import BroadsheetView from "./pages/BroadsheetView";
import "./index.scss"; // Import global styles

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/add-score" element={<AddScores />} />
        <Route path="/teacher-portal" element={<TeacherPortal />} />
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/student-results" element={<StudentResults />} />
        <Route path="/view-students" element={<ViewStudents />} />
        <Route path="/single-view" element={<SingleView />} />
        <Route path="/broadsheet-view" element={<BroadsheetView />} />
        <Route path="*" element={<NotFound />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;

