import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase"; // Import Firestore instance
import { doc, setDoc } from "firebase/firestore"; // Import Firestore methods
import "../styles/Signup.scss";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    section: "",
    class: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [classes, setClasses] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
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

      // Update the user's display name in Firebase Authentication
      const fullName = `${formData.firstName} ${formData.lastName}`;
      await updateProfile(user, { displayName: fullName });

      // Save user data to Firestore with UID as the document ID
      const userDoc = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        section: formData.section,
        class: formData.class,
        email: formData.email,
        phone: formData.phone,
        uid: user.uid, // Firebase Auth user ID
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      setSuccessMessage("Signup successful!!!");
      setTimeout(() => {
        navigate("/signin"); // Redirect to Sign-In page
      }, 5000); // Display message for 2 seconds
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="signup">
      <Helmet>
        <title>RHS-Signup</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <h1>SIGNUP</h1>

        {/* Success Message */}
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="middleName"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
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

        {/* Link to Signin */}
        <p className="form-footer">
          Already have an account? <Link to="/signin">Signin</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;