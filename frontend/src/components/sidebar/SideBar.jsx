import React from "react";
import logo from "../../assets/images/logo.svg";
import HomeIcon from "../../assets/images/icon-home.svg?react";
import ArchiveIcon from "../../assets/images/icon-archive.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";
import { useCurrentEditor } from '@tiptap/react'

import "./SideBar.css";

const SideBar = ({selectedPage, tags, setSelectedPage}) => {
  const sidebarContents = [
    { name: "All Notes", icon: HomeIcon },
    { name: "Archieved Notes", icon: ArchiveIcon},
  ];

  const setPage = (page)=>{
    setSelectedPage(page);
  }

  return (
    <div className="sidebar">
      <div className="container flow-content xxs-spacer">
        <div className="logo">
        <img src={logo} alt="Logo" />
        </div>
        <ul className="flow-content xxs-spacer">
          {sidebarContents.map((item, index) => {
            const IconComponent = item.icon;
            return (
            <li key={index} onClick={()=>{setPage(item.name)}} className={`sidebar-item ${selectedPage == item.name? "selected":""}`}>
              <IconComponent className="icon" />
              <span>{item.name}</span>
            </li>
          )}
          
          )}
        </ul>
        <hr />
        <p className="section-title">Tags</p>
        <ul className="tags-list flow-content xxs-spacer">
          {
            tags.map((tag)=> <li key={tag}onClick={()=>{setPage("Tag:"+tag)}}  className={`tag-item sidebar-item ${selectedPage.includes(":") && selectedPage.substring(selectedPage.indexOf(":")+1) == tag? "selected":""}`}><TagIcon /><span>{tag}</span></li>)
          }
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
