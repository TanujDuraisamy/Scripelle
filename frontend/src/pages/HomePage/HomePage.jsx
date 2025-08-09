import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";
import reactLogo from "../../assets/react.svg";

export default function HomePage() {
  const navigate = useNavigate();
  const [userDocuments, setUserDocuments] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Load user documents from localStorage on component mount and when returning to page
  useEffect(() => {
    const loadDocuments = () => {
      const savedDocs = localStorage.getItem('userDocuments');
      if (savedDocs) {
        try {
          const docs = JSON.parse(savedDocs);
          // Sort documents by creation date (most recent first)
          const sortedDocs = docs.sort((a, b) => {
            // Extract timestamp from document ID (format: doc-timestamp)
            const timestampA = parseInt(a.id.split('-')[1] || 0);
            const timestampB = parseInt(b.id.split('-')[1] || 0);
            return timestampB - timestampA; // Most recent first
          });
          setUserDocuments(sortedDocs);
        } catch (error) {
          console.error('Error loading documents:', error);
        }
      }
    };

    loadDocuments();

    // Listen for storage changes (when documents are updated from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'userDocuments') {
        loadDocuments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for focus events to refresh when coming back to the page
    const handleFocus = () => {
      loadDocuments();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleCreateNew = () => {
    const newId = `doc-${Date.now()}`;
    navigate(`/doc/${newId}`);
  };

  const openDoc = (id) => navigate(`/doc/${id}`);

  const handleMenuClick = (e, docId) => {
    e.stopPropagation(); // Prevent opening the document
    setOpenMenuId(openMenuId === docId ? null : docId);
  };

  const deleteDocument = (docId) => {
    const savedDocs = JSON.parse(localStorage.getItem('userDocuments') || '[]');
    const updatedDocs = savedDocs.filter(doc => doc.id !== docId);
    localStorage.setItem('userDocuments', JSON.stringify(updatedDocs));
    setUserDocuments(updatedDocs);
    setOpenMenuId(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  return (
    <div className={`home-root ${userDocuments.length === 0 ? 'empty-state' : ''}`}>
      <div className="logo-wrapper">
        <img src="/images/Scripelle Logo.png" alt="Scripelle Logo" className="home-logo" />
      </div>
      
      <div className={`create-cta-wrapper ${userDocuments.length === 0 ? 'centered-layout' : ''}`}>
        <button
          className="create-cta"
          onClick={handleCreateNew}
          aria-label="Create a new document"
        >
          Start Writing
        </button>
      </div>

      {userDocuments.length > 0 && (
        <div className="docs-grid">
          {userDocuments.map((doc) => (
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
              
              {/* Three dots menu */}
              <div 
                className="doc-menu"
                onClick={(e) => handleMenuClick(e, doc.id)}
              >
                <span className="doc-menu-dots">⋯</span>
                <div className={`doc-menu-dropdown ${openMenuId === doc.id ? 'show' : ''}`}>
                  <div 
                    className="doc-menu-item delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                  >
                    Delete
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
