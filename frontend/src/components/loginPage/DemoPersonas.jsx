import React from "react";
import "./DemoPersonas.css";

const DemoPersonas = ({ onSelectDemo }) => {
  const personas = [
    {
      id: 1,
      name:"Alex Smith",
      job: "Product Manager",
      email: "demo-pm@notesapp.com",
      password: "Demo123!",
      emoji: "📊",
      description: "Roadmaps, feature specs, and sprint planning",
      color: "#4F46E5"
    },
    {
      id: 2,
      name:"Jamie Lee",
      job: "Software Developer",
      email: "demo-dev@notesapp.com",
      password: "Demo123!",
      emoji: "💻",
      description: "Code snippets, bug tracking, and API docs",
      color: "#10B981"
    },
    {
      id: 3,
      name:"Morgan Brown",
      job: "UX Designer",
      email: "demo-design@notesapp.com",
      password: "Demo123!",
      emoji: "🎨",
      description: "Design systems, mockups, and user research",
      color: "#F59E0B"
    },
    {
      id: 4,
      name:"Taylor Green",
      job: "Content Writer",
      email: "demo-writer@notesapp.com",
      password: "Demo123!",
      emoji: "✍️",
      description: "Blog drafts, content calendar, and SEO",
      color: "#EC4899"
    },
    {
      id: 5,
      name:"Jordan White",
      job:"Student",
      email: "demo-student@notesapp.com",
      password: "Demo123!",
      emoji: "🎓",
      description: "Lecture notes, study guides, and projects",
      color: "#8B5CF6"
    }
  ];

  return (
    <div className="demo-personas">
      <p className="preset-5 center demo-title">Try a demo account:</p>
      <div className="personas-grid">
        {personas.map((persona) => (
          <button
            key={persona.id}
            className="persona-card"
            onClick={() => onSelectDemo(persona.email, persona.password)}
            style={{ borderTopColor: persona.color }}
          >
            <div className="persona-name preset-4">{persona.name}</div>
            <div className="persona-job preset-5">{persona.job}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DemoPersonas;
