import React, { useEffect } from "react";
import SideBar from "../sidebar/SideBar";
import MainPage from "../mainPage/MainPage";
import { fetchAllNotesAsync, getTagsAsync } from '../../store/notesSlice.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

import "./Dashboard.css"
import { useDispatch } from "react-redux";

const Dashboard = () => {
  const dispatch = useDispatch();

  // Sync URL parameters with Redux state
  useUrlSync();

  useEffect(()=>{
    dispatch(fetchAllNotesAsync());
    dispatch(getTagsAsync());
  },[dispatch])

  return (
    <div className="home-container">
      <SideBar />
      <MainPage  />
    </div>
  );
};

export default Dashboard;
