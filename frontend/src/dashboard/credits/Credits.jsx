import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Credits.css';

export default function Credits() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState({ used: 100, total: 500 });

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

  const handleBuyMoreCredits = () => {
    navigate('/credits/buy');
  };

  if (loading) {
    return (
      <div className="credits-container">
        <div className="credits-loading">Loading...</div>
      </div>
    );
  }

  const creditPercentage = (credits.used / credits.total) * 100;

  return (
    <div className="credits-container">
      {/* Sidebar Navigation */}
      <div className="credits-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-item" onClick={() => navigate('/account')}>
            <span>Account</span>
          </div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-item active">
            <span>Credits</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/about')}>
            <span>About Scripelle</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/privacy')}>
            <span>Data and Privacy</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="credits-main">
        {/* Header */}
        <div className="credits-header">
          <h1>Credits</h1>
          <div className="header-divider"></div>
        </div>

        {/* What are Credits Section */}
        <div className="credits-info-section">
          <h2>What are Credits?</h2>
          <p className="credits-description">
            In Scripelle, you work with Credits, which are like small tokens you spend whenever you want to make changes or improve your writing. Each time you use the tools to adjust or polish something, it uses up one credit. You get a set amount of these credits every month, and once they're finished, you'll need to wait until the next month to get more.
          </p>
        </div>

        {/* Credits Usage Section */}
        <div className="credits-usage-section">
          <div className="credits-display">
            <span className="credits-used">{credits.used}</span>
            <span className="credits-total">/ {credits.total}</span>
          </div>
          
          <div className="credits-progress-bar">
            <div 
              className="credits-progress-fill" 
              style={{ width: `${creditPercentage}%` }}
            ></div>
          </div>
          
          <p className="credits-info">
            {credits.total} credits included in your plan. Last reset on: August 23 2025
          </p>
        </div>

        {/* Buy More Credits Button */}
        <div className="buy-credits-section">
          <button className="buy-credits-btn" onClick={handleBuyMoreCredits}>
            Buy more credits
          </button>
        </div>
      </div>
    </div>
  );
}
