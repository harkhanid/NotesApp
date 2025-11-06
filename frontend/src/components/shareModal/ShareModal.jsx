import React, { useState } from "react";
import CrossIcon from "../../assets/images/icon-cross.svg?react";
import "./ShareModal.css";

const ShareModal = ({ isOpen, onClose, note, onShare, onRemoveCollaborator }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="preset-2">Share Note</h3>
          <button className="btn-none close-btn" onClick={onClose}>
            <CrossIcon />
          </button>
        </div>

        <div className="modal-body flow-content">
          <form onSubmit={handleShare} className="share-form">
            <div className="form-group">
              <label htmlFor="email" className="preset-5">
                Add collaborator by email
              </label>
              <div className="split">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="share-input"
                />
                <button type="submit" className="btn btn-primary">
                  Share
                </button>
              </div>
              {error && <p className="error-message preset-5">{error}</p>}
            </div>
          </form>

          {note.sharedWith && note.sharedWith.length > 0 && (
            <div className="collaborators-section flow-content xs-spacer">
              <h4 className="preset-4">Collaborators</h4>
              <ul className="collaborators-list">
                {note.sharedWith.map((collaborator) => (
                  <li key={collaborator.id} className="collaborator-item split">
                    <div className="collaborator-info">
                      <p className="preset-5">{collaborator.email}</p>
                      {collaborator.username && (
                        <p className="preset-6 text-muted">{collaborator.username}</p>
                      )}
                    </div>
                    <button
                      className="btn-none remove-btn"
                      onClick={() => handleRemove(collaborator.email)}
                      title="Remove collaborator"
                    >
                      <CrossIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
