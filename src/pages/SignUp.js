// src/pages/SignUp.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import '../styles/SignUp.css'; // Should match the file name

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Confermpassword, setConfermpassword] = useState("");
  const [phone, setPhone] = useState("");

  // Initialize useNavigate
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "Name:",
      name,
      "Email:",
      email,
      "Password:",
      password,
      "Phone:",
      phone,
      "Confermpassword:",
      Confermpassword // Fixed here to log Confermpassword correctly
    );

    // After handling logic, navigate to ServiceDiscovery page
    navigate("/servicediscovery");
  };

  return (
    <div className="signup-container">
      <h2>Create a New Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
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
        <input
          type="password" // Fixed type to 'password'
          placeholder="Confirm Password" // Fixed placeholder
          value={Confermpassword}
          onChange={(e) => setConfermpassword(e.target.value)} // Fixed to use setConfermpassword
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
