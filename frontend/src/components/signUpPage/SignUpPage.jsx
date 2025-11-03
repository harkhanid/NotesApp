import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../Service/authService";
import logo from "../../assets/images/logo.svg";
import googleIcon from "../../assets/images/icon-google.svg";
import "./SignUpPage.css";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(username, email, password);
      if (response.ok) {
        navigate("/login");
      } else {
        // Handle signup error
        console.error("Signup failed");
      }
    } catch (error) {
      console.error("Signup error", error);
    }
  };

  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
          <p className="title preset-1">Create Your Account</p>
          <p className="preset-5 sub-title">Sign up to start organizing your notes and boost productivity</p>
        </div>
        <form className="signup-form flow-content" onSubmit={handleSignUp}>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="username" className="block preset-4">Username</label>
            <input type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="email" className="block preset-4">Email</label>
            <input type="email" id="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="password" className="preset-4">Password</label>
            <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="intput-warning preset-5"> At least 8 characters</p>
          </div>
          <button type="submit" className="btn btn-primary full-width preset-3">
            Sign up
          </button>
        </form>
        <hr />
        <p>Or log in with:</p>
        <button className="google-login btn btn-secondary split full-width preset-3">
          <img src={googleIcon} alt="Google Icon" />
          <p>Google</p>
        </button>
        <hr />
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
