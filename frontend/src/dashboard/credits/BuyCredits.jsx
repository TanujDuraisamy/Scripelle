import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuyCredits.css';

export default function BuyCredits() {
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

  const handleStartUsing = () => {
    // TODO: Implement start using functionality
    console.log('Start using Free plan clicked');
    navigate('/credits');
  };

  const handlePurchasePro = () => {
    // TODO: Implement purchase Pro plan functionality
    console.log('Purchase Pro plan clicked');
  };

  const handlePurchaseMax = () => {
    // TODO: Implement purchase Max plan functionality
    console.log('Purchase Max plan clicked');
  };

  if (loading) {
    return (
      <div className="buy-credits-container">
        <div className="buy-credits-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="buy-credits-container">
      {/* Sidebar Navigation */}
      <div className="buy-credits-sidebar">
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
      <div className="buy-credits-main">
        {/* Header */}
        <div className="buy-credits-header">
          <h1>Credits</h1>
          <div className="header-divider"></div>
        </div>

        {/* Buy Credits Section */}
        <div className="buy-credits-content">
          <h2 className="buy-credits-title">Buy more credits</h2>
          
          {/* Pricing Cards */}
          <div className="pricing-cards">
            {/* Free Plan */}
            <div className="pricing-card free-plan">
              <div className="plan-header">
                <h3 className="plan-name">Free</h3>
                <div className="plan-price">$0</div>
                <p className="plan-tagline">" A glimpse into the art of writing with Scripelle. "</p>
              </div>
              
              <div className="plan-credits">30 Credits per month</div>
              
              <div className="plan-divider"></div>
              
              <div className="plan-features">
                <p>Get a taste of Scripelle</p>
                <p>Access to the editor</p>
                <p>Auto Suggestions</p>
              </div>
              
              <button className="plan-button free-button" onClick={handleStartUsing}>
                Start Using
              </button>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card pro-plan">
              <div className="plan-header">
                <h3 className="plan-name">Pro</h3>
                <div className="plan-price">$12.99</div>
                <p className="plan-tagline">" For those who wants more freedom, more flow, more expression. "</p>
              </div>
              
              <div className="plan-credits">100 Credits per month</div>
              
              <div className="plan-divider"></div>
              
              <div className="plan-features">
                <p>Everything in Free</p>
                <p>More Personalized</p>
                <p>Better Auto Suggestions</p>
                <p>Faster Response</p>
              </div>
              
              <button className="plan-button pro-button" onClick={handlePurchasePro}>
                Purchase Now
              </button>
            </div>

            {/* Max Plan */}
            <div className="pricing-card max-plan">
              <div className="plan-header">
                <h3 className="plan-name">Max</h3>
                <div className="plan-price">$29.99</div>
                <p className="plan-tagline">" For creators who demand the fullest expression. "</p>
              </div>
              
              <div className="plan-credits">300 Credits per month</div>
              
              <div className="plan-divider"></div>
              
              <div className="plan-features">
                <p>Everything in Pro</p>
                <p>Unlimited Inline Edits</p>
                <p>Best Auto Suggestions</p>
                <p>Fastest Response</p>
              </div>
              
              <button className="plan-button max-button" onClick={handlePurchaseMax}>
                Purchase Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
