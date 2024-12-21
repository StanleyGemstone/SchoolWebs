import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const RegisterStudent = () => {
  const [studentData, setStudentData] = useState({
    surname: "",
    middleName: "",
    firstName: "",
    gender: "",
    class: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "students"), studentData);
      alert("Student registered successfully!");
      setStudentData({
        surname: "",
        middleName: "",
        firstName: "",
        gender: "",
        class: "",
      });
    } catch (error) {
      console.error("Error registering student:", error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register Student</h2>
      <input type="text" name="surname" placeholder="Surname" value={studentData.surname} onChange={handleChange} required />
      <input type="text" name="middleName" placeholder="Middle Name" value={studentData.middleName} onChange={handleChange} />
      <input type="text" name="firstName" placeholder="First Name" value={studentData.firstName} onChange={handleChange} required />
      <select name="gender" value={studentData.gender} onChange={handleChange} required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <select name="class" value={studentData.class} onChange={handleChange} required>
        <option value="">Select Class</option>
        <option value="Primary 1">Primary 1</option>
        <option value="Primary 2">Primary 2</option>
        {/* Add all primary and secondary classes */}
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterStudent;