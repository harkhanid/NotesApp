import { useEffect, useState } from 'react';
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
        <div className="startup-message">
          <p className="preset-3">Waking up the server{dots}</p>
          <p className="preset-5 startup-subtitle">
            Application is hoisted on a free-tier service which may take some time to start up after periods of inactivity.
          </p>
          <p className="preset-5 startup-subtitle" style={{ marginTop: '0.5rem', opacity: 0.7 }}>
            This will take ~60 seconds on first visit
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
