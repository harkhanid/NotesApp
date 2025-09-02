import React from "react";
import "./SignUpPage.css";

import logo from "../../assets/images/logo.svg";
import googleIcon from "../../assets/images/icon-google.svg";


const SignUpPage = () => {
  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
          <p className="title preset-1">Create Your Account</p>
          <p className="preset-5 sub-title">Sign up to start organizing your notes and boost productivity</p>
        </div>
        <form className="signup-form flow-content">
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="email" className="block preset-4">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group flow-content xxs-spacer">
          <div className="split password-label">
            <label htmlFor="password" className="preset-4">Password</label> <a>forgot</a>
          </div>
            <input type="password" id="password" name="password" required />
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
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
