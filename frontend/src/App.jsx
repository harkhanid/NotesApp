import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Dashboard from './components/dashboard/Dashboard.jsx';
import SignUpPage from './components/signUpPage/SignUpPage.jsx';
import LoginPage from './components/loginPage/LoginPage.jsx';
import ResetPage from './components/resetPage/ResetPage.jsx';
import SettingsPage from './components/settings/SettingsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { checkAuth } from './store/authSlice.js';

import './Fonts.css'
import './App.css'

function App() {
  const dispatch = useDispatch();
  const currentFont = useSelector((state) => state.ui.font);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  let fontClass = "";
  switch (currentFont) {
    case "Sans Serif":
      fontClass = "font-inter";
      break;
    case "Serif":
      fontClass = "font-noto";
      break;
    case "Mono":
      fontClass = "font-mono";
      break;
    default:
      fontClass = "font-sourcecode";
  }

  return (
    <div className={`App ${fontClass}`}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/resetpassword" element={<ResetPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
