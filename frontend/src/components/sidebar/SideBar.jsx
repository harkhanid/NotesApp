import React from "react";
import logo from "../../assets/images/logo.svg";
import HomeIcon from "../../assets/images/icon-home.svg?react";
import ArchiveIcon from "../../assets/images/icon-archive.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";
import SearchIcon from "../../assets/images/icon-search.svg?react";
import SettingsIcon from "../../assets/images/icon-settings.svg?react";

import "./SideBar.css";
import { useDispatch, useSelector } from "react-redux";
import { updateFilter } from "../../store/uiSlice";

const SideBar = ({ tags, setSelectedPage}) => {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state)=> state.ui.filter);
  const sidebarContents = [
    { name: "All Notes", icon: HomeIcon, filter: "ALL" },
    { name: "Archieved Notes", icon: ArchiveIcon, filter: "ARCHIVED"},
  ];

  const setFilter = (filter)=>{
    dispatch(updateFilter({filter}));
  }

  return (
    <div className="sidebar">
      <div className="sidebar-desktop container flow-content xxs-spacer">
        <div className="logo">
        <img src={logo} alt="Logo" />
        </div>
        <div className="sidebar-content flow-content xsm-spacer">
        <ul className="flow-content xxs-spacer">
          {sidebarContents.map((item, index) => {
            const IconComponent = item.icon;
            return (
            <li key={index} onClick={()=>{setFilter(item.filter)}} className={`sidebar-item ${currentFilter == item.filter? "selected":""}`}>
              <IconComponent className="icon" />
              <span>{item.name}</span>
            </li>
          )}
          
          )}
        </ul>
        <hr />
        <p className="section-title sidebar-content">Tags</p>
        <ul className="tags-list flow-content xxs-spacer">
          {
            tags.map((tag)=> <li key={tag}onClick={()=>{setPage("Tag:"+tag)}}  className={`tag-item sidebar-item`}><TagIcon /><span>{tag}</span></li>)
          }
        </ul>
        </div>
      </div>
      <div className="navbar-mobile">
        <button className={`nav-item ${currentFilter == "ALL"? "selected":""}`} onClick={()=>{setSelectedPage("ALL")}} > 
          <HomeIcon className="icon" />
        </button>
       <button className={`nav-item ${currentFilter == "SEARCH"? "selected":""}`} onClick={()=>{setSelectedPage("ALL")}} > 
          <SearchIcon className="icon" />
        </button>
       <button className={`nav-item ${currentFilter == "ARCHIVED"? "selected":""}`} onClick={()=>{setSelectedPage("ALL")}} > 
          <ArchiveIcon className="icon" />
        </button>
       <button className={`nav-item ${currentFilter == "TAGS"? "selected":""}`} onClick={()=>{setSelectedPage("ALL")}} > 
          <TagIcon className="icon" />
        </button>
       <button className={`nav-item ${currentFilter == "SETTINGS"? "selected":""}`} onClick={()=>{setSelectedPage("ALL")}} > 
          <SettingsIcon className="icon" />
        </button>
       

      </div>
    </div>
  );
};

export default SideBar;
