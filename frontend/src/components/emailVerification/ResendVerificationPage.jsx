import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../Service/authService";
import logo from "../../assets/images/logo.svg";
import "./EmailVerificationPage.css";

const ResendVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await authService.resendVerification(email);
      const data = await response.json();

      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
        setEmail(""); // Clear the form
      } else {
        setError(data.error || "Failed to send verification email");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Resend verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
          <p className="title preset-1">Resend Verification Email</p>
          <p className="preset-5 sub-title">
            Enter your email address and we'll send you a new verification link
          </p>
        </div>

        <form className="login-form flow-content" onSubmit={handleSubmit}>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="email" className="block preset-4">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {message && <p className="preset-5 success-message">{message}</p>}
          {error && <p className="preset-5 error-message">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary full-width preset-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Email"}
          </button>
        </form>

        <hr />

        <p className="preset-5 center">
          Already verified?{" "}
          <Link to="/login" className="link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResendVerificationPage;
