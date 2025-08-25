import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";
import reactLogo from "../../assets/react.svg";
import LoginButton from "../../LoginButton.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  const [userDocuments, setUserDocuments] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = React.useRef(null);

  // Helper function to extract preview text from document content
  const extractPreviewText = (docId) => {
    try {
      const docContent = localStorage.getItem(`doc-content-${docId}`);
      if (!docContent) return "No content available";
      
      const pages = JSON.parse(docContent);
      if (!pages || !Array.isArray(pages) || pages.length === 0) return "No content available";
      
      // Get content from all pages
      let allContent = pages.map(page => page.content || '').join(' ');
      
      // Create temporary div to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = allContent;
      
      // Extract title content first
      const h1Elements = tempDiv.querySelectorAll('h1');
      let titleText = '';
      h1Elements.forEach(h1 => {
        const title = h1.textContent || h1.innerText || '';
        if (title.trim()) {
          titleText += title.trim() + ' ';
        }
      });
      
      // Remove title elements to get body content
      h1Elements.forEach(h1 => h1.remove());
      
      // Remove AI diff blocks and highlighting
      const diffBlocks = tempDiv.querySelectorAll('.ai-diff-block, .ai-highlight-added, .ai-highlight-removed');
      diffBlocks.forEach(block => block.remove());
      
      // Get body content
      let bodyText = tempDiv.textContent || tempDiv.innerText || '';
      bodyText = bodyText.replace(/\s+/g, ' ').trim();
      
      // Determine what to show based on content
      let previewText = '';
      
      if (bodyText.length > 0) {
        // Has body content - show body content (Google Docs style)
        previewText = bodyText;
      } else if (titleText.trim().length > 0) {
        // Only has title - show title as preview
        previewText = titleText.trim();
      } else {
        // Completely empty - show placeholder
        return "No content available";
      }
      
      // Return first 100 characters with ellipsis if longer
      return previewText.length > 100 ? previewText.substring(0, 100) + '...' : previewText;
    } catch (error) {
      console.error('Error extracting preview:', error);
      return "Error loading preview";
    }
  };

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

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
          
          // Add preview text to each document
          const docsWithPreviews = sortedDocs.map(doc => ({
            ...doc,
            preview: extractPreviewText(doc.id)
          }));
          
          setUserDocuments(docsWithPreviews);
        } catch (error) {
          console.error('Error loading documents:', error);
        }
      }
    };

    loadDocuments();

    // Listen for storage changes (when documents are updated from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'userDocuments' || (e.key && e.key.startsWith('doc-content-'))) {
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
    
    // Also remove the document content
    localStorage.removeItem(`doc-content-${docId}`);
    
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

  // Only play video on first site load, not when returning to page
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Check if this is the first time visiting the site
      const hasPlayedVideo = sessionStorage.getItem('videoPlayed');
      
      if (!hasPlayedVideo) {
        const playVideo = async () => {
          try {
            await video.play();
            console.log('Video started playing');
            // Mark video as played for this session
            sessionStorage.setItem('videoPlayed', 'true');
          } catch (error) {
            console.error('Video autoplay failed:', error);
          }
        };
        
        // Try to play after a short delay
        setTimeout(playVideo, 100);
      }
    }
  }, []);

  return (
    <div className={`home-root ${userDocuments.length === 0 ? 'empty-state' : 'has-documents'}`}>
      {/* Background Video - only show when no documents */}
      {userDocuments.length === 0 && (
        <video 
          ref={videoRef}
          className="background-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={(e) => {
            console.error('Video error:', e);
            console.error('Error details:', e.target.error);
          }}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
          onLoadedData={() => console.log('Video loaded')}
          onPlay={() => console.log('Video started playing')}
        >
          <source src="videos/Painting Background_4.mp4" type="video/mp4" />
          <source src="/videos/Painting Background_4.mp4" type="video/mp4" />
          Video not supported
        </video>
      )}
      
      {/* Content overlay */}
      <div className="content-overlay">
        {/* Sign in button and Dashboard button in top right */}
        <div className="home-signin-wrapper">
          {isAuthenticated && (
            <button 
              className="dashboard-btn" 
              onClick={() => navigate('/account')}
            >
              Dashboard
            </button>
          )}
          <LoginButton />
        </div>
        
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
                <div className="doc-preview">
                  <div className="doc-preview-content">
                    {doc.preview || "No content available"}
                  </div>
                </div>
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
    </div>
  );
}
