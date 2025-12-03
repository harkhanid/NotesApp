import React from "react";
import Modal from "./Modal";
import "./ConfirmDialog.css";
import DeleteIcon from "../../assets/images/icon-delete.svg?react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", // "default" or "danger"
  loading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} message={message} IconComponent={DeleteIcon} maxWidth="400px">
      <div className="confirm-dialog-content">
        <div className="confirm-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${variant === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
