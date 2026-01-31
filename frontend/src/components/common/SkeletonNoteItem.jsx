import React from 'react';
import './Skeleton.css';

const SkeletonNoteItem = () => {
  return (
    <div className="skeleton-note-item flow-content xsm-spacer">
      <div className="skeleton-note-title skeleton"></div>
      <div className="skeleton-note-tags">
        <div className="skeleton-note-tag skeleton"></div>
        <div className="skeleton-note-tag skeleton"></div>
      </div>
      <div className="skeleton-note-date skeleton"></div>
    </div>
  );
};

export default SkeletonNoteItem;
