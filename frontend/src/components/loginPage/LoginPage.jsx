import React from "react";
import "./loginPage.css";
import logo from "../../assets/images/logo.svg";
import googleIcon from "../../assets/images/icon-google.svg";
import "./LoginPage.css";
const LoginPage = () => {
  const [resetPassword, setResetPassword] = React.useState(false);
  const toggleResetPassword = () => {
    setResetPassword(!resetPassword);
  };
  const loginContainer = (
    <div className="login-container flow-content">
      <form className="login-form flow-content">
        <div className="form-group flow-content xxs-spacer">
          <label htmlFor="email" className="block preset-4">Email Address</label>
          <input type="email" id="email" name="email" placeholder="email@example.com" required />
        </div>
        <div className="form-group flow-content xxs-spacer">
          <div className="split password-label">
            <label htmlFor="password" className="preset-4" >Password</label>{" "}
            <a onClick="toggleResetPassword">Forgot?</a>
          </div>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit" className="btn btn-primary full-width preset-3">
          Login
        </button>
      </form>
      <hr />
      <p className="preset-5 center">Or log in with:</p>
      <button className="google-login btn btn-secondary split full-width preset-3">
        <img src={googleIcon} alt="Google Icon" />
        <p>Google</p>
      </button>
      <hr />
      <p className="center preset-5">No Account yet? <a href="/register">Sign up</a></p>
    </div>
  );

  const resetPasswordContainer = (
    <div className="reset-password-container flow-content">
      <form className="reset-password-form flow-content">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <button type="submit" className="btn btn-primary full-width preset-3">
          Send Reset Link
        </button>
      </form>
    </div>
  );
  
  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
        <p className="title preset-1">
          {resetPassword ? "Forgotten your password?" : "Welcome to Notes"}
        </p>
        <p className="preset-5 sub-title">
          {resetPassword
            ? "Enter your email below, and we’ll send you a link to reset it."
            : "Please login to continue"}
        </p>
        </div>
        {resetPassword ? resetPasswordContainer : loginContainer}
        </div>
    </div>
  );
};

export default LoginPage;
