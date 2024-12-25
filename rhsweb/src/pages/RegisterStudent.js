// import React, { useState } from "react";
// import { db } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";

// const RegisterStudent = () => {
//   const [studentData, setStudentData] = useState({
//     surname: "",
//     middleName: "",
//     firstName: "",
//     gender: "",
//     class: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setStudentData({ ...studentData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await addDoc(collection(db, "students"), studentData);
//       alert("Student registered successfully!");
//       setStudentData({
//         surname: "",
//         middleName: "",
//         firstName: "",
//         gender: "",
//         class: "",
//       });
//     } catch (error) {
//       console.error("Error registering student:", error.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Register Student</h2>
//       <input type="text" name="surname" placeholder="Surname" value={studentData.surname} onChange={handleChange} required />
//       <input type="text" name="middleName" placeholder="Middle Name" value={studentData.middleName} onChange={handleChange} />
//       <input type="text" name="firstName" placeholder="First Name" value={studentData.firstName} onChange={handleChange} required />
//       <select name="gender" value={studentData.gender} onChange={handleChange} required>
//         <option value="">Select Gender</option>
//         <option value="Male">Male</option>
//         <option value="Female">Female</option>
//       </select>
//       <select name="class" value={studentData.class} onChange={handleChange} required>
//         <option value="">Select Class</option>
//         <option value="Primary 1">Primary 1</option>
//         <option value="Primary 2">Primary 2</option>
//         {/* Add all primary and secondary classes */}
//       </select>
//       <button type="submit">Register</button>
//     </form>
//   );
// };

// export default RegisterStudent;

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { currentUser } = useAuth(); // Get logged-in user details
  const navigate = useNavigate();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!surname || !firstName || !gender) {
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

        <button type="submit">Register Student</button>
      </form>

      <button onClick={() => navigate("/teacher-portal")}>Back to Dashboard</button>
    </div>
  );
};

export default RegisterStudent;