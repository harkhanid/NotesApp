import React from "react";
import "./ResetPage.css";
import logo from "../../assets/images/logo.svg";

const ResetPage = () => {
  return (
    <div className="auth-page">
      <div className="card flow-content">
      <img src={logo} className="logo" alt="Logo" />
      <div className="card-text">
      <p className="title preset-1">Reset Your Password</p>
        <p className="preset-5 sub-title">Choose a new password to secure your account.</p>
      </div>
      <form className="reset-form flow-content">
        <div className="form-group flow-content xxs-spacer">
          <label htmlFor="email">New Password </label>
          <input type="password" id="password" name="password" required />
          <p className="intput-warning preset-5"> At least 8 characters</p>
        </div>
        <div className="form-group flow-content xxs-spacer">
          <label htmlFor="password ">Confirm New Password</label>
          <input
            type="password"
            id="conf_password"
            name="conf_password"
            required
          />
          <p className="intput-warning preset-5">Password does not match</p>
        </div>
        <button type="submit" className="btn btn-primary full-width preset-3">
          Reset Password
        </button>
      </form>
      </div>
    </div>
  );
};

export default ResetPage;
