import React, { useState } from "react";
import "./DemoPersonasModal.css";

const DemoPersonasModal = ({ isOpen, onClose, onSelectDemo }) => {
  const [selectedPersona, setSelectedPersona] = useState(null);

  const personas = [
    {
      id: 1,
      name: "Alex Smith",
      job: "Product Manager",
      email: "demo-pm@notesapp.com",
      password: "Demo123!",
      emoji: "📊",
      description: "Roadmaps, feature specs, and sprint planning",
      color: "#4F46E5"
    },
    {
      id: 2,
      name: "Jamie Lee",
      job: "Software Developer",
      email: "demo-dev@notesapp.com",
      password: "Demo123!",
      emoji: "💻",
      description: "Code snippets, bug tracking, and API docs",
      color: "#10B981"
    },
    {
      id: 3,
      name: "Morgan Brown",
      job: "UX Designer",
      email: "demo-design@notesapp.com",
      password: "Demo123!",
      emoji: "🎨",
      description: "Design systems, mockups, and user research",
      color: "#F59E0B"
    },
    {
      id: 4,
      name: "Taylor Green",
      job: "Content Writer",
      email: "demo-writer@notesapp.com",
      password: "Demo123!",
      emoji: "✍️",
      description: "Blog drafts, content calendar, and SEO",
      color: "#EC4899"
    },
    {
      id: 5,
      name: "Jordan White",
      job: "Student",
      email: "demo-student@notesapp.com",
      password: "Demo123!",
      emoji: "🎓",
      description: "Lecture notes, study guides, and projects",
      color: "#8B5CF6"
    }
  ];

  if (!isOpen) return null;

  const handleLogin = () => {
    if (selectedPersona) {
      onSelectDemo(selectedPersona.email, selectedPersona.password);
      onClose();
      setSelectedPersona(null);
    }
  };

  const handleCancel = () => {
    setSelectedPersona(null);
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={handleCancel}></div>
      <div className="demo-modal">
        <div className="modal-header">
          <h3 className="preset-2">Try a Demo Account</h3>
          <button className="modal-close" onClick={handleCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p className="preset-5 modal-subtitle">
            Explore NotesApp with pre-populated demo accounts
          </p>
          <div className="personas-grid">
            {personas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                className={`setting-option ${selectedPersona?.id === persona.id ? "selected" : ""}`}
              >
                <div className="persona-icon-container">
                  <div className="persona-emoji">{persona.emoji}</div>
                </div>
                <div className="persona-info flow-content xxs-spacer">
                  <p className="persona-name preset-4">{persona.name}</p>
                  <p className="persona-job preset-6">{persona.job}</p>
                </div>
                <input
                  type="radio"
                  name="persona"
                  value={persona.id}
                  checked={selectedPersona?.id === persona.id}
                  onChange={() => setSelectedPersona(persona)}
                  className="persona-radio"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={!selectedPersona}
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
};

export default DemoPersonasModal;
