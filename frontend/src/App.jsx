import { useState } from 'react'
import LoginPage from './components/loginPage/LoginPage.jsx';
import ResetPage from './components/resetPage/ResetPage.jsx'
import './Fonts.css'
import './App.css'
import { Route, Routes } from 'react-router';
import Dashboard from './components/dashboard/Dashboard.jsx';
import SignUpPage from './components/signUpPage/signUpPage';
import Demio from './components/Demio/Demio.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App font-inter'>
      <Routes>
      {/* <LoginPage /> */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/resetpassword" element={<ResetPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/home" element={<Dashboard />} />
      <Route path="/demo" element={<Demio />} />
      
      
      </Routes>
    </div>
  )
}

export default App
