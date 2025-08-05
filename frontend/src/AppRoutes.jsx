import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DocumentPage from './pages/DocumentPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to a default document */}
      <Route path="/" element={<Navigate to="/doc/untitled" replace />} />
      {/* Main document route */}
      <Route path="/doc/:id" element={<DocumentPage />} />
      {/* TODO: add additional routes (login, settings, 404) here */}
    </Routes>
  );
}
