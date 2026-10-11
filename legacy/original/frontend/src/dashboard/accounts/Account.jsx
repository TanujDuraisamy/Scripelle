import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

export default function Account() {
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

  const handleLogout = () => {
    window.location.href = 'http://localhost:3000/api/v1/auth/logout';
  };

  const handleChangePlan = () => {
    navigate('/credits/buy');
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="account-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="account-container">
      {/* Sidebar Navigation */}
      <div className="account-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-item active">
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
          <div className="sidebar-item" onClick={() => navigate('/privacy')}>
            <span>Data and Privacy</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="account-main">
        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
        
        {/* Header */}
        <div className="account-header">
          <h1>Account</h1>
          <div className="header-divider"></div>
        </div>

        {/* Account Info Section */}
        <div className="account-info-section">
          <div className="account-status">
            <h2>You are currently signed in with Google</h2>
            <p className="user-email">
              {userInfo?.email || 'tanujaravind21@gmail.com'}
            </p>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Plan Section */}
        <div className="plan-section">
          <h2>Your current Plan is Pro</h2>
          
          {/* Payment Method Card */}
          <div className="payment-method-card">
            <div className="payment-method-info">
              <span className="payment-label">Current Payment Method</span>
              <span className="payment-details">*Payment Mode and Icon*</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="plan-actions">
            <button className="action-btn change-plan" onClick={handleChangePlan}>
              Change Plan
            </button>
            <button className="action-btn update-payment">
              Update Payment Method
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
