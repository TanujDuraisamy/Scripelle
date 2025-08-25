import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DocumentPage from './pages/DocumentPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import Account from './dashboard/accounts/Account.jsx';
import Credits from './dashboard/credits/Credits.jsx';
import BuyCredits from './dashboard/credits/BuyCredits.jsx';
import About from './dashboard/about/About.jsx';
import Privacy from './dashboard/privacy/Privacy.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home page */}
      <Route path="/" element={<HomePage />} />
      {/* Main document route */}
      <Route path="/doc/:id" element={<DocumentPage />} />
      {/* Account dashboard route */}
      <Route path="/account" element={<Account />} />
      {/* Credits dashboard route */}
      <Route path="/credits" element={<Credits />} />
      {/* Buy Credits route */}
      <Route path="/credits/buy" element={<BuyCredits />} />
      {/* About dashboard route */}
      <Route path="/about" element={<About />} />
      {/* Privacy dashboard route */}
      <Route path="/privacy" element={<Privacy />} />
      {/* TODO: add additional routes (login, settings, 404) here */}
    </Routes>
  );
}


/*  USED FOR REDIRECTING TO HOME PAGE IF USER IS NOT LOGGED IN  */