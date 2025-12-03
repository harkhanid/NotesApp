import React from "react";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import Toast from "./Toast";
import "./ToastContainer.css";

const ToastContainer = () => {
  const toasts = useSelector((state) => state.toast.toasts);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
