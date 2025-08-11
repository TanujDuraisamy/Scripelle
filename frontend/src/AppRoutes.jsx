import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DocumentPage from './pages/DocumentPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home page */}
      <Route path="/" element={<HomePage />} />
      {/* Main document route */}
      <Route path="/doc/:id" element={<DocumentPage />} />
      {/* TODO: add additional routes (login, settings, 404) here */}
    </Routes>
  );
}


/*  USED FOR REDIRECTING TO HOME PAGE IF USER IS NOT LOGGED IN  */