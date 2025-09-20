import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Dashboard from './components/dashboard/Dashboard.jsx';
import SignUpPage from './components/signUpPage/signUpPage.jsx';
import LoginPage from './components/loginPage/LoginPage.jsx';
import ResetPage from './components/resetPage/ResetPage.jsx';

import './Fonts.css'
import './App.css'

function App() {
const currentFont = useSelector((state)=> state.ui.font);
let fontClass = "";
  switch(currentFont){
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
      <Route path="/resetpassword" element={<ResetPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/home" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App
