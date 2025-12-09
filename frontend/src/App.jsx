import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Dashboard from './components/dashboard/Dashboard.jsx';
import SignUpPage from './components/signUpPage/SignUpPage.jsx';
import LoginPage from './components/loginPage/LoginPage.jsx';
import ResetPage from './components/resetPage/ResetPage.jsx';
import SettingsPage from './components/settings/SettingsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ToastContainer from './components/common/ToastContainer.jsx';
import StartupLoadingScreen from './components/common/StartupLoadingScreen.jsx';
import EmailVerificationPage from './components/emailVerification/EmailVerificationPage.jsx';
import ResendVerificationPage from './components/emailVerification/ResendVerificationPage.jsx';
import ForgotPasswordPage from './components/forgotPassword/ForgotPasswordPage.jsx';
import { checkAuth } from './store/authSlice.js';
import { fetchPreferencesAsync } from './store/uiSlice.js';
import { useBackendStartup } from './hooks/useBackendStartup.js';

import './Fonts.css'
import './App.css'

function App() {
  const dispatch = useDispatch();
  const currentFont = useSelector((state) => state.ui.font);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { isStarting, checkStartup, setIsStarting } = useBackendStartup();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check if backend is starting up on mount
  useEffect(() => {
    const checkBackendAndAuth = async () => {
      const backendStarting = await checkStartup();

      if (backendStarting) {
        // Poll every 3 seconds until backend is ready
        const pollInterval = setInterval(async () => {
          const stillStarting = await checkStartup();
          if (!stillStarting) {
            clearInterval(pollInterval);
            // Backend is ready, now check auth
            dispatch(checkAuth());
            setInitialCheckDone(true);
          }
        }, 3000);
      } else {
        // Backend is already running, check auth immediately
        dispatch(checkAuth());
        setInitialCheckDone(true);
      }
    };

    checkBackendAndAuth();
  }, [dispatch, checkStartup, setIsStarting]);

  // Fetch preferences when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPreferencesAsync());
    }
  }, [isAuthenticated, dispatch]);

  let fontClass = "";
  switch (currentFont) {
    case "Sans Serif":
      fontClass = "font-inter";
      break;
    case "Serif":
      fontClass = "font-noto";
      break;
    case "Mono":
      fontClass = "font-sourcecode";
      break;
    default:
      fontClass = "font-sourcecode";
  }

  // Show startup screen if backend is starting or initial check not done
  if (isStarting || !initialCheckDone) {
    return <StartupLoadingScreen />;
  }

  return (
    <div className={`App ${fontClass}`}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/resetpassword" element={<ResetPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </div>
  )
}

export default App
