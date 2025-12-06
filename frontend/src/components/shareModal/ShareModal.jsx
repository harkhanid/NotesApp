import React, { useState } from "react";
import Modal from "../common/Modal";
import authService from "../../Service/authService";
import CrossIcon from "../../assets/images/icon-cross.svg?react";
import ShareIcon from "../../assets/images/icon-share.svg?react";
import "./ShareModal.css";

const ShareModal = ({ isOpen, onClose, note, onShare, onRemoveCollaborator }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(true);
  const message = note ? `Share this note with others by adding their email addresses.` : "";
  if (!isOpen || !note) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await onShare([email]);
      setEmail("");
      setDisabled(true);
    } catch (err) {
      setError(err.message || "Failed to share note");
    }
  };

  const handleRemove = async (collaboratorEmail) => {
    try {
      await onRemoveCollaborator(collaboratorEmail);
    } catch (err) {
      setError(err.message || "Failed to remove collaborator");
    }
  };

  const handleEmailBlur = async () => {
    const trimmedEmail = email.trim();

    // Don't validate if empty
    if (!trimmedEmail) {
      setError("");
      return;
    }

    // Check basic email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check if user exists in the system
    const exists = await authService.checkEmailExists(trimmedEmail);
    if (!exists) {
      setError("User not found. The person must have an account to collaborate.");
    } else {
      setDisabled(false);
      setError("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Note" message={message} IconComponent={ShareIcon}>
      <div className="flow-content">
        <form onSubmit={handleShare} className="share-form">
          <div className="form-group">
            <div className="split share-input-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="Enter email address"
                className="share-input"
              />
              <button type="submit" disabled={disabled} className="btn btn-primary">
                Share
              </button>
            </div>
            {error && <p className="error-message preset-5">{error}</p>}
          </div>
        </form>

        {note && note.sharedWith && note.sharedWith.length > 0 && (
          <div className="collaborators-section flow-content xs-spacer">
            <h4 className="preset-4">Collaborators</h4>
            <ul className="collaborators-list">
              {note.sharedWith.map((collaborator) => (
                <li key={collaborator.id} className="collaborator-item split">
                  <div className="collaborator-info">
                    <p className="preset-5">{collaborator.name} ({collaborator.email})</p>
                  </div>
                  <button
                    className="btn-none remove-btn"
                    onClick={() => handleRemove(collaborator.email)}
                    title="Remove collaborator"
                  >
                    <CrossIcon className="icon" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShareModal;
