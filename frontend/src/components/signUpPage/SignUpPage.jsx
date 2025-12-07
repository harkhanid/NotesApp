import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../Service/authService";
import { addToast } from "../../store/toastSlice";
import { useDispatch } from "react-redux";
import { API_DOMAIN } from "../../constants/constants";

import logo from "../../assets/images/logo.svg";
import googleIcon from "../../assets/images/icon-google.svg";
import "./SignUpPage.css";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasSpecialChar: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validatePassword = (pwd) => {
    const errors = {
      minLength: pwd.length >= 6,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    setPasswordErrors(errors);
    return Object.values(errors).every(Boolean);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (pwd) {
      validatePassword(pwd);
    } else {
      setPasswordErrors({
        minLength: false,
        hasUpperCase: false,
        hasSpecialChar: false,
      });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate password before submitting
    if (!validatePassword(password)) {
      setError("Please ensure your password meets all requirements");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(name, email, password);
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Don't redirect immediately, show verification message
      } else {
        // Handle specific error messages
        if (data.error) {
          dispatch(addToast({ message: data.error, type: "error" }));
        } else {
          dispatch(addToast({ message:  "Signup failed. Please try again.", type: "error" }));
        }
      }
    } catch (err) {
      dispatch(addToast({ message:  "An error occurred. Please try again.", type: "error" }));
      console.error("Signup error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Redirect to Spring Security's OAuth2 authorization endpoint
    window.location.href = `${API_DOMAIN}/oauth2/authorization/google`;
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="card flow-content">
          <img src={logo} className="logo" alt="Logo" />
          <div className="card-text">
            <p className="title preset-1">Check Your Email!</p>
            <p className="preset-5 sub-title">
              We've sent a verification email to <strong>{email}</strong>
            </p>
          </div>
          <div className="verification-success-message">
            <p className="preset-4">
              Please click the verification link in the email to activate your account.
            </p>
            <p className="preset-5">
              The verification link will expire in 1 hour.
            </p>
          </div>
          <hr />
          <p className="preset-5 center">
            Didn't receive the email?{" "}
            <Link to="/resend-verification" className="link">
              Resend verification email
            </Link>
          </p>
        </div>
      </div>
    );
  }

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
            <label htmlFor="name" className="block preset-4">Full Name</label>
            <input type="text" id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="email" className="block preset-4">Email</label>
            <input type="email" id="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="password" className="preset-4">Password</label>
            <input type="password" id="password" name="password" required value={password} onChange={handlePasswordChange} />
            <div style={{ marginTop: '0.5rem' }}>
              <p className="preset-5" style={{ margin: '0.25rem 0', color: passwordErrors.minLength ? '#4CAF50' : '#999' }}>
                {passwordErrors.minLength ? '✓' : '○'} At least 6 characters
              </p>
              <p className="preset-5" style={{ margin: '0.25rem 0', color: passwordErrors.hasUpperCase ? '#4CAF50' : '#999' }}>
                {passwordErrors.hasUpperCase ? '✓' : '○'} One uppercase letter
              </p>
              <p className="preset-5" style={{ margin: '0.25rem 0', color: passwordErrors.hasSpecialChar ? '#4CAF50' : '#999' }}>
                {passwordErrors.hasSpecialChar ? '✓' : '○'} One special character (!@#$%^&*...)
              </p>
            </div>
          </div>
          <button type="submit" className="btn btn-primary full-width preset-3" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <hr />
        <p>Or log in with:</p>
        <button onClick={handleGoogleSignUp} type="button" className="google-login btn btn-secondary split full-width preset-3">
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
