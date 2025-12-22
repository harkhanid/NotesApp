import React from "react";
import "./DemoPersonasModal.css";

const DemoPersonasModal = ({ isOpen, onClose, onSelectDemo }) => {
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

  const handleSelectDemo = (email, password) => {
    onSelectDemo(email, password);
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="demo-modal">
        <div className="modal-header">
          <h3 className="preset-2">Try a Demo Account</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="preset-5 modal-subtitle">
            Explore NotesApp with pre-populated demo accounts
          </p>
          <div className="personas-list">
            {personas.map((persona) => (
              <button
                key={persona.id}
                className="persona-item"
                onClick={() => handleSelectDemo(persona.email, persona.password)}
                style={{ borderLeftColor: persona.color }}
              >
                <div className="persona-item-emoji">{persona.emoji}</div>
                <div className="persona-item-content">
                  <div className="persona-item-name preset-4">{persona.name}</div>
                  <div className="persona-item-job preset-5">{persona.job}</div>
                  <div className="persona-item-description preset-5">
                    {persona.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoPersonasModal;
