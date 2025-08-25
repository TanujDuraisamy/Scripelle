import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Privacy.css';

export default function Privacy() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user info
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.user);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="privacy-container">
        <div className="privacy-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="privacy-container">
      {/* Sidebar Navigation */}
      <div className="privacy-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-item" onClick={() => navigate('/account')}>
            <span>Account</span>
          </div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-item" onClick={() => navigate('/credits')}>
            <span>Credits</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/about')}>
            <span>About Scripelle</span>
          </div>
          <div className="sidebar-item active">
            <span>Data and Privacy</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="privacy-main">
        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
        
        {/* Header */}
        <div className="privacy-header">
          <h1>Data and Privacy</h1>
          <div className="header-divider"></div>
        </div>

        {/* Privacy Content Sections */}
        <div className="privacy-content">
          {/* Data Handling Section */}
          <div className="privacy-section">
            <h2 className="section-title">How we handle your data?</h2>
            <p className="section-text">
              We only keep the bare minimum needed to make Scripelle work smoothly for you. Your documents and information are yours alone. We don't sell, trade, or misuse them. Everything stays safe, and you stay in control.
            </p>
          </div>

          {/* Privacy Handling Section */}
          <div className="privacy-section">
            <h2 className="section-title">How we handle your privacy?</h2>
            <p className="section-text">
              Your words are private. No one else can see them unless you choose to share. We protect your space so you can write freely, without worrying about anyone looking over your shoulder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
