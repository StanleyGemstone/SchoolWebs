import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Added for navigation
import "./Signin.scss";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Added error state
  const navigate = useNavigate(); // Navigation instance
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Signin successful!");
      navigate("/teacherportal"); // Redirect to Teacher Portal
    } catch (err) {
      setError("Invalid credentials. Please check your email or password.");
    }
  };

  return (
    <div className="signin">
      <Helmet>
        <title>RHS-Signin</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <h2>Signin</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Signin</button>
      </form>
    </div>
  );
};

export default Signin;