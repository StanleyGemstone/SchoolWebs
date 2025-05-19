import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import useAuth from "../components/useAuth"; // Custom hook to get current user
import "../styles/RegisterStudent.scss";

const RegisterStudent = () => {
  const [surname, setSurname] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState("");
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { currentUser } = useAuth(); // Get logged-in user details
  const navigate = useNavigate();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!surname || !firstName || !gender || !term) {
      setError("Please fill in all required fields.");
      setSuccess("");
      return;
    }

    try {
      // Add student to Firestore
      const teacherRef = collection(db, "users", currentUser.uid, "students");
      await addDoc(teacherRef, {
        surname,
        middleName,
        firstName,
        gender,
        term,
        class: currentUser.class, // Teacher's assigned class
        teacherId: currentUser.uid, // Teacher's ID
        createdAt: new Date(),
      });

      setSuccess("Student registered successfully!");
      setError("");

      // Clear form
      setSurname("");
      setMiddleName("");
      setFirstName("");
      setGender("");
      setTerm(""); // Reset to default term
    } catch (err) {
      setError("Failed to register student. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="register-student">
      <form onSubmit={handleSubmit}>
        <h2>Register Student</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <input
          type="text"
          placeholder="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Middle Name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
        />

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select 
          value={term}
          onChange={(e) => setTerm(e.target.value)} 
          required>
          <option value="">Select Term</option>
          <option value="First Term">1st Term</option>
          <option value="Second Term">2nd Term</option>
          <option value="Third Term">3rd Term</option>
        </select>

        <button type="submit">Register Student</button>
      </form>

      <button onClick={() => navigate("/teacher-portal")}>Back to Dashboard</button>
    </div>
  );
};

export default RegisterStudent;