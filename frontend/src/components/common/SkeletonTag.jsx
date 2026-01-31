import React from 'react';
import './Skeleton.css';
import TagIcon from "../../assets/images/icon-tag.svg?react";

const SkeletonTag = () => {
  return (
    <li className="skeleton-tag">
      <TagIcon className="icon tag-icon" />
      <div className="skeleton-tag-text skeleton"></div>
    </li>
  );
};

export default SkeletonTag;
