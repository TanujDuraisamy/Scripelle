import React from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

const seedDocuments = [
  { id: "demo-1", title: "Demo Document 1", date: "August 7th 2025" },
  { id: "demo-2", title: "Demo Document 1", date: "August 7th 2025" },
  { id: "demo-3", title: "Demo Document 1", date: "August 7th 2025" },
  { id: "demo-4", title: "Demo Document 1", date: "August 7th 2025" },
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    const newId = `doc-${Date.now()}`;
    navigate(`/doc/${newId}`);
  };

  const openDoc = (id) => navigate(`/doc/${id}`);

  return (
    <div className="home-root">
      <div className="create-cta-wrapper">
        <button
          className="create-cta"
          onClick={handleCreateNew}
          aria-label="Create a new document"
        >
          Create a new document
        </button>
      </div>

      <div className="docs-grid">
        {seedDocuments.map((doc) => (
          <div
            key={doc.id}
            className="doc-card"
            role="button"
            tabIndex={0}
            onClick={() => openDoc(doc.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") openDoc(doc.id);
            }}
          >
            <div className="doc-preview" />
            <div className="doc-meta">
              <div className="doc-title">{doc.title}</div>
              <div className="doc-date">{doc.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
