import React from "react";
import logo from "../../assets/images/logo.svg";
import HomeIcon from "../../assets/images/icon-home.svg?react";
import ArchiveIcon from "../../assets/images/icon-archive.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";
import SearchIcon from "../../assets/images/icon-search.svg?react";
import SettingsIcon from "../../assets/images/icon-settings.svg?react";

import "./SideBar.css";
import { useDispatch, useSelector } from "react-redux";
import { updateFilter,selectTag } from "../../store/uiSlice";

const SideBar = () => {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state)=> state.ui.filter);
  const currentTag = useSelector((state)=> state.ui.selectedTag);
  const tags = useSelector((state)=> state.notes.tags);
  const sidebarContents = [
    { name: "All Notes", icon: HomeIcon, filter: "ALL" , className: "home-icon"},
    { name: "Archieved Notes", icon: ArchiveIcon, filter: "ARCHIVED", className: "archive-icon" },
  ];

  const setFilter = (filter)=>{
    dispatch(updateFilter({filter}));
  }

  const setTag = (tag)=>{
    dispatch(selectTag({tag}));
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
                <IconComponent className={`icon ${item.className}`} />
                <span>{item.name}</span>
              </li>
            )}
            
            )}
          </ul>
          <hr />
          <p className="section-title sidebar-content">Tags</p>
          <ul className="tags-list flow-content xxs-spacer">
            {
              tags.map((tag)=> <li key={tag}onClick={()=>{setTag(tag)}}  className={`tag-item sidebar-item ${currentFilter == "TAG" && currentTag == tag? "selected":""}`}><TagIcon className="icon tag-icon"/><span>{tag}</span></li>)
            }
          </ul>
        </div>
      </div>
      <div className="navbar-mobile">
        <button className={`nav-item  ${currentFilter == "ALL"? "selected":""}`} onClick={()=>{setFilter("ALL")}} > 
          <HomeIcon className="icon home-icon" />
        </button>
       <button className={`nav-item  ${currentFilter == "SEARCH"? "selected":""}`} onClick={()=>{setFilter("SEARCH")}} > 
          <SearchIcon className="icon search-icon" />
        </button>
       <button className={`nav-item  ${currentFilter == "ARCHIVED"? "selected":""}`} onClick={()=>{setFilter("ARCHIVED")}} > 
          <ArchiveIcon className="icon archive-icon" />
        </button>
       <button className={`nav-item  ${currentFilter == "TAG"? "selected":""}`} onClick={()=>{setFilter("TAG")}} > 
          <TagIcon className="icon tag-icon" />
        </button>
       <button className={`nav-item  ${currentFilter == "SETTING"? "selected":""}`} onClick={()=>{setFilter("SETTING")}} > 
          <SettingsIcon className="icon setting-icon" />
        </button>
       

      </div>
    </div>
  );
};

export default SideBar;
