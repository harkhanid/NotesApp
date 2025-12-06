import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { removeToast } from "../../store/toastSlice";
import CheckmarkIcon from "../../assets/images/icon-checkmark.svg?react";
import CrossIcon from "../../assets/images/icon-cross.svg?react";
import CrossplainIcon from "../../assets/images/icon-cross-plain.svg?react";
import InfoIcon from "../../assets/images/icon-info.svg?react";
import "./Toast.css";

const Toast = ({ id, type, message }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      // dispatch(removeToast({ id }));
    }, 3500); 

    return () => clearTimeout(timer);
  }, [id, dispatch]);

  const handleClose = () => {
    dispatch(removeToast({ id }));
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckmarkIcon className="toast-icon" />;
      case "error":
        return <CrossIcon className="toast-icon" />;
      case "info":
      case "warning":
        return <InfoIcon className="toast-icon" />;
      default:
        return <InfoIcon className="toast-icon" />;
    }
  };

  return (
    <motion.div
      className={`toast toast-${type}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="toast-content">
        <div className="toast-icon-wrapper">{getIcon()}</div>
        <p className="toast-message preset-5">{message}</p>
      </div>
      <button className="btn-none toast-close" onClick={handleClose}>
        <CrossplainIcon />
      </button>
    </motion.div>
  );
};

export default Toast;
