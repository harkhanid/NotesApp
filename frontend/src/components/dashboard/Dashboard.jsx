import React, { useEffect, useState } from "react";
import SideBar from "../sidebar/SideBar";
import MainPage from "../mainPage/MainPage";
import {MENU} from '../../constants/constants.js';

import "./Dashboard.css"
const Dashboard = () => {
  const [selectedPage, setSelectedPage] = useState(MENU.ALL_NOTES);
  

  const [tags, setTags] = useState(()=>{
    const tagList = localStorage.getItem("Tags");
    return tagList ? JSON.parse(tagList):["Cooking","Fitness"]
  })


  return (
    <div className="home-container">
      <SideBar selectedPage={selectedPage} setSelectedPage={setSelectedPage} tags={tags} />
      <MainPage selectedPage={selectedPage} />
    </div>
  );
};

export default Dashboard;
