//Google Sign-in related
import React from "react";

const LoginButton = ({ onLogin }) => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/v1/auth/google";
  };

  return (
    <button
      onClick={handleLogin}
      className="sign-in-btn"
    >
      Sign in
    </button>
  );
};

export default LoginButton; 