import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useNotesNavigation } from "../../hooks/useNotesNavigation.js";
import logo from "../../assets/images/logo.svg";
import HomeIcon from "../../assets/images/icon-home.svg?react";
import ArchiveIcon from "../../assets/images/icon-archive.svg?react";
import ShareIcon from "../../assets/images/icon-share.svg?react";
import TagIcon from "../../assets/images/icon-tag.svg?react";
import SearchIcon from "../../assets/images/icon-search.svg?react";
import SettingsIcon from "../../assets/images/icon-settings.svg?react";
import LogoutIcon from "../../assets/images/icon-logout.svg?react";
import SkeletonTag from "../common/SkeletonTag.jsx";

import "./SideBar.css";

const SideBar = () => {
  const navigate = useNavigate();
  const { navigateToMyNotes, navigateToShared, navigateToSearch, navigateToTag, navigateToSettings } = useNotesNavigation();
  const currentFilter = useSelector((state) => state.ui.filter);
  const currentTag = useSelector((state) => state.ui.selectedTag);
  const tags = useSelector((state) => state.notes.tags);
  const loading = useSelector((state) => state.notes.loading);
  const user = useSelector((state) => state.auth.user);

  // Check if user is admin
  const isAdmin = user && user.roles && user.roles.includes("ROLE_ADMIN");

  const handleMyNotesClick = () => {
    navigateToMyNotes();
  };

  const handleSharedNotesClick = () => {
    navigateToShared();
  };

  const handleSearchClick = () => {
    navigateToSearch();
  };

  const handleTagsClick = () => {
    navigateToTag();
  };

  const handleTagClick = (tag) => {
    navigateToTag(tag);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-desktop container flow-content xxs-spacer">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="sidebar-content flow-content xsm-spacer">
          <ul className="flow-content xxs-spacer">
            <li onClick={handleMyNotesClick} className={`sidebar-item ${currentFilter == "MY_NOTES" ? "selected" : ""}`}>
              <HomeIcon className="icon home-icon" />
              <span>My Notes</span>
            </li>
            <li onClick={handleSharedNotesClick} className={`sidebar-item ${currentFilter == "SHARED_NOTES" ? "selected" : ""}`}>
              <ShareIcon className="icon share-icon" />
              <span>Shared Notes</span>
            </li>
          </ul>
          <hr />
          <p className="section-title sidebar-content">Tags</p>
          <ul className="tags-list flow-content xxs-spacer">
            {
              loading ? (
                <>
                  <SkeletonTag />
                  <SkeletonTag />
                  <SkeletonTag />
                </>
              ) : (
                tags.map((tag) => <li key={tag} onClick={() => { handleTagClick(tag) }} className={`tag-item sidebar-item ${currentFilter == "TAG" && currentTag == tag ? "selected" : ""}`}><TagIcon className="icon tag-icon" /><span>{tag}</span></li>)
              )
            }
          </ul>
          {isAdmin && (
            <>
              <hr />
              <ul className="flow-content xxs-spacer">
                <li onClick={() => navigate("/admin")} className="sidebar-item admin-link">
                  <SettingsIcon className="icon setting-icon" />
                  <span>Admin Panel</span>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
      <div className="navbar-mobile">
        <button className={`nav-item  ${currentFilter == "MY_NOTES" ? "selected" : ""}`} onClick={handleMyNotesClick} >
          <HomeIcon className="icon home-icon" />
        </button>
        <button className={`nav-item  ${currentFilter == "SHARED_NOTES" ? "selected" : ""}`} onClick={handleSharedNotesClick} >
          <ShareIcon className="icon share-icon" />
        </button>
        <button className={`nav-item  ${currentFilter == "SEARCH" ? "selected" : ""}`} onClick={handleSearchClick} >
          <SearchIcon className="icon search-icon" />
        </button>
        <button className={`nav-item  ${currentFilter == "TAG" ? "selected" : ""}`} onClick={handleTagsClick} >
          <TagIcon className="icon tag-icon" />
        </button>
        <button className={`nav-item  ${currentFilter == "SETTINGS" ? "selected" : ""}`} onClick={navigateToSettings} >
          <SettingsIcon className="icon setting-icon" />
        </button>
      </div>
    </div>
  );
};

export default SideBar;
