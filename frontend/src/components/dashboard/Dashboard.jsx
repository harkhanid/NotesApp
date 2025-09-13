import React, { useEffect, useState } from "react";
import SideBar from "../sidebar/SideBar";
import MainPage from "../mainPage/MainPage";
import { fetchAllNotesAsync } from '../../store/notesSlice.js';

import "./Dashboard.css"
import { useDispatch } from "react-redux";
const Dashboard = () => {
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(fetchAllNotesAsync());
  },[])

  const [tags, setTags] = useState(()=>{
    const tagList = localStorage.getItem("Tags");
    return tagList ? JSON.parse(tagList):["Cooking","Fitness"]
  })


  return (
    <div className="home-container">
      <SideBar tags={tags} />
      <MainPage  />
    </div>
  );
};

export default Dashboard;
