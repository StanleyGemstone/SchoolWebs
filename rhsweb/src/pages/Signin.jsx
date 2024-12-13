import React, { useState } from "react";
import { Helmet } from 'react-helmet';
import app from "../firebase";
import "./Signin.scss";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Signin = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, emailOrPhone, password);
      alert("Signin successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signin">
      <Helmet>
        <title>RHS-Signin</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <h2>Signin</h2>
        <input
          type="text"
          placeholder="Email or Phone"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
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