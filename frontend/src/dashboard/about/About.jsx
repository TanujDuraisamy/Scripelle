import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

export default function About() {
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

  const handleContactUs = () => {
    // TODO: Implement contact us functionality
    console.log('Contact us clicked');
  };

  if (loading) {
    return (
      <div className="about-container">
        <div className="about-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="about-container">
      {/* Sidebar Navigation */}
      <div className="about-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-item" onClick={() => navigate('/account')}>
            <span>Account</span>
          </div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-item" onClick={() => navigate('/credits')}>
            <span>Credits</span>
          </div>
          <div className="sidebar-item active">
            <span>About Scripelle</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate('/privacy')}>
            <span>Data and Privacy</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="about-main">
        {/* Header */}
        <div className="about-header">
          <h1>About Scripelle</h1>
          <div className="header-divider"></div>
        </div>

        {/* About Description Sections */}
        <div className="about-content">
          <div className="about-section">
            <p className="about-text">
              Scripelle is a brand new writing tool that is personalized. It's a place where you can sit down, put your thoughts into words, and shape them neatly without any fuss. Everything is laid out simply so you don't have to struggle with complicated buttons or menus—just write, and let Scripelle help you keep things clear, tidy, and easy to manage.
            </p>
          </div>

          <div className="about-section">
            <p className="about-text">
              Our mission is to make writing feel natural, effortless, and personal. We believe everyone has something worth saying, and our goal is to remove the barriers that make writing feel difficult or overwhelming. Scripelle makes your words come first—tools stay in the background, and you stay focused on what matters, which is expressing yourself clearly and confidently.
            </p>
          </div>

          <div className="about-quote-section">
            <h2 className="about-quote">
              Obsession. That is what this is all about.
            </h2>
          </div>

          <div className="contact-section">
            <button className="contact-btn" onClick={handleContactUs}>
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
