import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Import Firestore instance
import { collection, addDoc } from "firebase/firestore"; // Import Firestore methods
import "../styles/Signup.scss";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    section: "",
    class: "",
    email: "",
    phone: "",
    role: "teacher",
    password: "",
    confirmPassword: "",
  });

  const [classes, setClasses] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Dynamically update class options based on section
    if (name === "section") {
      if (value === "Primary") {
        setClasses([
          "Creche",
          "KG1",
          "KG2",
          "KG3",
          "Primary 1",
          "Primary 2",
          "Primary 3",
          "Primary 4",
          "Primary 5",
          "Primary 6",
        ]);
      } else if (value === "Secondary") {
        setClasses(["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"]);
      } else {
        setClasses([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Save user data to Firestore
      const userDoc = {
        fullName: formData.fullName,
        gender: formData.gender,
        role: formData.role,
        section: formData.section,
        class: formData.class,
        email: formData.email,
        phone: formData.phone,
        uid: user.uid, // Firebase Auth user ID
        createdAt: new Date(),
      };

      await addDoc(collection(db, "users"), userDoc); // Save to "users" collection

      alert("Signup successful! Redirecting to Sign In page...");
      navigate("/signin");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="signup">
      <Helmet>
        <title>RHS-Signup</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <h2>Signup</h2>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <label htmlFor="role">Role:</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>

        {/* Conditional rendering for section and class */}
        {formData.role === "teacher" && (
          <>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
            >
              <option value="">Select Section</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
            </select>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
            >
              <option value="">Select Class</option>
              {classes.map((cls, index) => (
                <option key={index} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;