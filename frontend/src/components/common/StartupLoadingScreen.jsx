import React, { useEffect, useState } from 'react';
import './StartupLoadingScreen.css';
import logo from '../../assets/images/logo.svg';

const StartupLoadingScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="startup-loading-screen">
      <div className="startup-content">
        <img src={logo} alt="Notes Logo" className="startup-logo" />
        <h1 className="startup-title">Notes</h1>
        <div className="startup-message">
          <p className="preset-3">Starting up the server{dots}</p>
          <p className="preset-5 startup-subtitle">
            This may take a minute on first load
          </p>
        </div>
        <div className="startup-spinner">
          <div className="spinner-ring"></div>
        </div>
      </div>
    </div>
  );
};

export default StartupLoadingScreen;
