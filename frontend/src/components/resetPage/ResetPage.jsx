import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../../Service/authService";
import { addToast } from "../../store/toastSlice";
import "./ResetPage.css";
import logo from "../../assets/images/logo.svg";

const ResetPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasSpecialChar: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("No reset token provided");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password
    if (!validatePassword(password)) {
      setError("Please ensure your password meets all requirements");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword(token, password);
      const data = await response.json();

      if (response.ok) {
        dispatch(addToast({ message: "Password reset successfully!", type: "success" }));
        navigate("/login");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="card flow-content">
          <img src={logo} className="logo" alt="Logo" />
          <div className="card-text">
            <p className="title preset-1">Invalid Reset Link</p>
            <p className="preset-5 error-message">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <Link to="/forgot-password" className="btn btn-primary full-width preset-3">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
          <p className="title preset-1">Reset Your Password</p>
          <p className="preset-5 sub-title">Choose a new password to secure your account.</p>
        </div>
        <form className="reset-form flow-content" onSubmit={handleSubmit}>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="password" className="block preset-4">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter new password"
              required
              value={password}
              onChange={handlePasswordChange}
            />
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
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="conf_password" className="block preset-4">Confirm New Password</label>
            <input
              type="password"
              id="conf_password"
              name="conf_password"
              placeholder="Confirm new password"
              required
              minLength="6"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="preset-5 error-message">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary full-width preset-3"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPage;
