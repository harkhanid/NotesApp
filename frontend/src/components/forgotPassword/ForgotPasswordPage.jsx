import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../Service/authService";
import { addToast } from "../../store/toastSlice";
import { useDispatch } from "react-redux";
import logo from "../../assets/images/logo.svg";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      const data = await response.json();

      if (response.ok) {
        dispatch(addToast({ message: "A password reset link has been sent. Please check your inbox.", type: "sucess" }));
        setEmail(""); // Clear the form
      } else {
        dispatch(addToast({ message: data.error || "Failed to send password reset email", type: "error" }));
      }
    } catch (err) {
      dispatch(addToast({ message: "An error occurred. Please try again.", type: "error" }));
      setError("An error occurred. Please try again.");
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
          <p className="title preset-1">Forgot Password?</p>
          <p className="preset-5 sub-title">
            Enter your email address and we'll send you a link to reset your password
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
          <button
            type="submit"
            className="btn btn-primary full-width preset-3"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <hr />

        <p className="preset-5 center">
          Remember your password?{" "}
          <Link to="/login" className="link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
