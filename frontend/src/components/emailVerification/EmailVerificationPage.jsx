import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../../Service/authService";
import { addToast } from "../../store/toastSlice";
import logo from "../../assets/images/logo.svg";
import "./EmailVerificationPage.css";

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent duplicate verification attempts
    if (hasVerified.current) return;
    hasVerified.current = true;

    const token = searchParams.get("token");

    if (!token) {
      dispatch(addToast({ message: "No verification token provided", type: "error" }));
      navigate("/signup");
      return;
    }

    // Verify email on mount
    authService.verifyEmail(token)
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          // Success - redirect to login
          dispatch(addToast({ message: "Email verified successfully!", type: "success" }));
          navigate("/login");
        } else {
          // Failed - redirect to signup
          const errorMessage = data.error || "Verification link is invalid or expired";
          dispatch(addToast({ message: errorMessage, type: "error" }));
          navigate("/signup");
        }
      })
      .catch((error) => {
        console.error("Verification error:", error);
        dispatch(addToast({ message: "An error occurred during verification", type: "error" }));
        navigate("/signup");
      });
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="auth-page">
      <div className="card flow-content">
        <img src={logo} className="logo" alt="Logo" />
        <div className="card-text">
          <p className="title preset-1">Email Verification</p>
        </div>

        <div className="verification-content flow-content">
          <div className="verifying-state">
            <div className="spinner"></div>
            <p className="preset-4">Verifying your email...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
