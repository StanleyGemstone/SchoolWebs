import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import TeacherPortalNav from "../components/TeacherPortalNav";
import "../styles/TeacherPortal.scss";


const TeacherPortal = () => {
  const [loading, setLoading] = useState(true); // Track loading state
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase auth instance

  useEffect(() => {
    const checkAuth = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoading(false); // User is authenticated, stop loading
        } else {
          alert("You must be signed in to access this page.");
          navigate("/signin"); // Redirect to signin if no user is authenticated
        }
      });
    };

    checkAuth();
  }, [auth, navigate]);

  if (loading) {
    return <p>Loading...</p>; // Show loading state while checking auth
  }

  return (
    <div className="teacher-portal">
      <h1>WELCOME TEACHER __________</h1>
      <TeacherPortalNav />
    </div>
  );
};

export default TeacherPortal;