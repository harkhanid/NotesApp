import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import { addToast } from "../../store/toastSlice";
import { API_DOMAIN } from "../../constants/constants";
import DemoPersonas from "./DemoPersonas";
import DemoPersonasModal from "./DemoPersonasModal";

import logo from "../../assets/images/logo.svg";
import googleIcon from "../../assets/images/icon-google.svg";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check for account status errors
    if (error && typeof error === 'string') {
      if (error.includes('account pending approval')) {
        dispatch(addToast({ message: "Your account is pending admin approval. Please wait for an administrator to verify your account.", type: "warning" }));
      } else if (error.includes('account rejected')) {
        dispatch(addToast({ message: "Your account has been rejected. Please contact support for more information.", type: "error" }));
      }
    }
  }, [error, dispatch]);

  // Check for OAuth error in URL params
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      dispatch(addToast({ message: decodeURIComponent(oauthError), type: "error" }));
    }
  }, [searchParams, dispatch]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = () => {
    // Redirect to Spring Security's OAuth2 authorization endpoint
    window.location.href = `${API_DOMAIN}/oauth2/authorization/google`;
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    console.log("Demo login selected:", demoEmail);
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Automatically submit login after setting credentials
    // setTimeout(() => {
    //   dispatch(login({ email: demoEmail, password: demoPassword }));
    // }, 100);
  };

  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
          <p className="title preset-1">Welcome to Notes</p>
          <p className="preset-5 sub-title">Please login to continue</p>
        </div>
        <DemoPersonas onSelectDemo={handleDemoLogin} />
        <form className="login-form flow-content" onSubmit={handleLogin}>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="email" className="block preset-4">Email Address</label>
            <input type="email" id="email" name="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group flow-content xxs-spacer">
            <label htmlFor="password" className="preset-4">Password</label>
            <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="preset-5 error-message">{typeof error === 'object' ? JSON.stringify(error) : error}</p>}
          <button type="submit" className="btn btn-primary full-width preset-3" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <Link to="/forgot-password" className="preset-5 center forgot-password-link">
            Forgot password?
          </Link>
        </form>
        <hr />
        <p className="preset-5 center">Or log in with:</p>
        <button onClick={handleGoogleLogin} type="button" className="google-login btn btn-secondary split full-width preset-3">
          <img src={googleIcon} alt="Google Icon" />
          <p>Google</p>
        </button>
        <hr />
        <p className="center preset-5">No Account yet? <Link to="/signup">Sign up</Link></p>
      </div>

      {/* Mobile floating button */}
      <button
        className="demo-floating-btn"
        onClick={() => setIsModalOpen(true)}
        aria-label="Try demo accounts"
      >
        <span className="demo-btn-icon">✨</span>
        <span className="demo-btn-text">Try Demo</span>
      </button>

      {/* Mobile modal */}
      <DemoPersonasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectDemo={handleDemoLogin}
      />
    </div>
  );
};

export default LoginPage;
