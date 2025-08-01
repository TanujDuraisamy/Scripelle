//Google Sign-in related
import React, { useState, useEffect } from "react";

const LoginButton = ({ onLogin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log("🔍 LoginButton: Checking authentication status...");
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/me', {
        credentials: 'include', // Include cookies for session-based auth
        headers: { 'Content-Type': 'application/json' },
      });
      console.log("🔍 LoginButton: /me response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ LoginButton: USER IS AUTHENTICATED!", data);
        console.log("✅ LoginButton: User details:", {
          id: data.user?.id,
          email: data.user?.email,
          username: data.user?.username,
          provider: data.user?.provider
        });
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.log("❌ LoginButton: User is NOT authenticated");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ LoginButton: Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    console.log("🚀 LoginButton: Redirecting to Google OAuth...");
    window.location.href = "http://localhost:3000/api/v1/auth/google";
  };

  const handleLogout = async () => {
    console.log("🚪 LoginButton: Logout button clicked...");
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/logout', {
        credentials: 'include',
      });
      console.log("🚪 LoginButton: Logout response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ LoginButton: Logout successful:", data);
        setIsAuthenticated(false);
        setUser(null);
        window.location.reload(); // Refresh the page to clear any cached state
      } else {
        console.error("❌ LoginButton: Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error('❌ LoginButton: Error logging out:', error);
    }
  };

  if (loading) {
    return (<button className="sign-in-btn" disabled>Loading...</button>);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {isAuthenticated ? (
        <>
          <span style={{ fontSize: '14px', color: '#f1f1f1' }}>
            {user?.displayName || user?.email || 'User'}
          </span>
          <button onClick={handleLogout} className="sign-in-btn">Sign out</button>
        </>
      ) : (
        <button onClick={handleLogin} className="sign-in-btn">Sign in</button>
      )}
    </div>
  );
};

export default LoginButton; 