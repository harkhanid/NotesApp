import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import SunIcon from "../../assets/images/icon-sun.svg?react";
import MoonIcon from "../../assets/images/icon-moon.svg?react";
import SystemThemeIcon from "../../assets/images/icon-system-theme.svg?react";
import FontIcon from "../../assets/images/icon-font.svg?react";
import FontSansSerrifIcon from "../../assets/images/icon-font-sans-serif.svg?react";
import FontSerifIcon from "../../assets/images/icon-font-serif.svg?react";
import FontMonoIcon from "../../assets/images/icon-font-monospace.svg?react";

import LeftArrowIcon from "../../assets/images/icon-arrow-left.svg?react";
import LockIcon from "../../assets/images/icon-lock.svg?react";
import LogoutIcon from "../../assets/images/icon-logout.svg?react";
import { logout } from "../../store/authSlice";

import { updateTheme, updateFont } from "../../store/uiSlice.js";
import "./InnerSideBar.css";



const SettingsBar = () => {
  const dispatch  = useDispatch();
  const navigate = useNavigate();
  const currentNoteId = useSelector((state)=> state.notes.currentId);
  const currentTheme = useSelector((state)=> state.ui.theme);
  const currentFont = useSelector((state)=> state.ui.font);
  const [currentSetting, setCurrentSetting] = useState(null);//Color Theme
  const settingsContent = [
      { name: "Color Theme", icon: SunIcon, filter: "COLOR_THEME" , className: "home-icon"},
      { name: "Change Font", icon: FontIcon, filter: "FONT", className: "tag-icon" },
      { name: "Change Password", icon: LockIcon, filter: "PASSWORD", className: "tag-icon" },
      { name: "Logout", icon: LogoutIcon, filter: "LOGOUT", className: "setting-icon" },
    ];
  const themeOptions= [{ name: "Light Mode", icon: SunIcon, className: "home-icon", description: "Pick a clean and classic light theme"},
                        { name: "Dark Mode", icon: MoonIcon, className: "home-icon", description: "A dark theme that is easy on the eyes for night time use"},
                        { name: "System Default", icon: SystemThemeIcon, className: "home-icon", description: "Automatically adapt to your system theme"}
  ]

  const fontOptions = [{ name: "Sans Serif", icon: FontSansSerrifIcon, className: "home-icon", description: "A modern sans serif font for a clean look"},
                        { name: "Serif", icon: FontSerifIcon, className: "home-icon", description: "A classic serif font for a traditional feel"},
                        { name: "Mono", icon: FontMonoIcon, className: "home-icon", description: "A monospaced font for better readability"}
  ]
  let Title = "";
  let description = "";

  const handleLogout = () => {
      dispatch(logout()).then(() => navigate("/login"));
  };


  const handleCurrentSettingChange = (item) => {
    if(item.name === "Logout"){
      handleLogout();
    }else{
      setCurrentSetting(item.name);
    }
}
  switch(currentSetting){
    case "Color Theme":
      Title="Color Theme";
      description="Choose a color theme for the application.";
      break;
    case "Change Font":
      Title="Change Font";
      description="Select your preferred font style.";
      break;
    case "Change Password":
      Title="Change Password";
      description="Update your account password regularly to keep your account secure.";
      break;
    default:
  }

  return (
    <>
    <div className={`inner-sidebar ${currentSetting == null ? "" : "mobile-hide" }` } >
        <ul className="flow-content xxs-spacer">
          {settingsContent.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <li key={index} onClick={()=>{handleCurrentSettingChange(item);}} className={`sidebar-item ${currentSetting == item.name? "selected":""}`}>
                <IconComponent className={`icon ${item.className}`} />
                <span>{item.name}</span>
              </li>
            )}
          )}
        </ul>
    </div>
    { <div className={`note-content settings-page flow-content xxs-spacer ${currentSetting != null ? "" :" mobile-hide" } `}>
      <div className={`mobile-topbar ${currentNoteId == null ? "mobile-hide" :"" }`}>
        <button className="btn-none goback-btn" onClick={()=>{setCurrentSetting(null)}}><LeftArrowIcon /><span className="preset-5">Go Back</span></button>
      </div>
      <h1 className="page-title">{Title}</h1>
      <p className="page-description">{description}</p>
     {currentSetting == "Color Theme"? <div className='theme-settings flow-content xxm-spacer'>
        {themeOptions.map((option) => (
        <div
          key={option.name}
          onClick={() => dispatch(updateTheme({ theme: option.name }))}
          className={`setting-option ${currentTheme === option.name ? "selected" : ""} `}
        > 
          <div className="option-icon-container">
            <option.icon className="icon option-icon" />
          </div>
          <div className="option-info flow-content xxs-spacer">
            <p className="option-title preset-4">{option.name}</p>
            <p className="option-description preset-6">{option.description}</p>
          </div>
          <input
            type="radio"
            name="Theme"
            value={option.name}
            checked={currentTheme === option.name}
            onChange={() =>dispatch(updateTheme({ theme: option.name }))}
            className="mt-1"
          />
        </div>
      ))}
      <div className='submit-section'>
        {/* <button className='btn btn-primary' onClick={()=>{dispatch(updateTheme({ theme: currentTheme }))}}>Save Changes</button> */}
      </div>
      </div>:
      currentSetting == "Change Font"? 
      <div className='theme-settings flow-content xxm-spacer'>
        {fontOptions.map((option) => (
        <div
          key={option.name}
          onClick={() => dispatch(updateFont({ font: option.name }))}
          className={`setting-option ${currentFont === option.name ? "selected" : ""} `}
        > 
          <div className="option-icon-container">
            <option.icon className="icon option-icon" />
          </div>
          <div className="option-info flow-content xxs-spacer">
            <p className="option-title preset-4">{option.name}</p>
            <p className="option-description preset-6">{option.description}</p>
          </div>
          <input
            type="radio"
            name="Theme"
            value={option.name}
            checked={currentFont === option.name}
            onChange={() =>dispatch(updateFont({ font: option.name }))}
            className="mt-1"
          />
        </div>
      ))}
      <div className='submit-section'>
        {/* <button className='btn btn-primary' onClick={()=>{dispatch(updateFont({ font: currentfont }))}}>Save Changes</button> */}
      </div>
      </div> :""
      }
    </div>
    }
    </>
  )
}
export default SettingsBar;


