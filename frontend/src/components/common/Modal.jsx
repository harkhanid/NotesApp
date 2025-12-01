import React, { useEffect } from "react";
import CrossIcon from "../../assets/images/icon-cross.svg?react";
import "./Modal.css";

const Modal = ({isOpen, onClose, title,IconComponent, children, message,maxWidth = "500px" }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };


    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      > 
        <div className="modal-header">
          <div className="modal-icon-container">
            <IconComponent className="modal-icon icon delete-icon" />
          </div>
          <div className="modal-header-content flow-content xxs-spacer">
          <h3 className="preset-3">{title}</h3>
          <p className="preset-5">{message}</p>
          </div>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
