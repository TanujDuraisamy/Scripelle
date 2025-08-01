import { Router } from 'express';
import { google } from 'googleapis'
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'], // Removed Google Docs scopes
    accessType: 'offline',
    prompt: 'consent',
}));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=auth' }),
    (req, res) => {
        console.log("🔐 Backend: Google OAuth callback received!");
        console.log("🔐 Backend: User authenticated:", {
            id: req.user?.id,
            email: req.user?.email,
            username: req.user?.username,
            provider: req.user?.provider
        });
        console.log("🔐 Backend: Session ID:", req.sessionID);
        console.log("🔐 Backend: Is authenticated:", req.isAuthenticated());
        
        if (req.user) {
            console.log("✅ Backend: Redirecting authenticated user to frontend");
            res.redirect('http://localhost:5173/');
        } else {
            console.log("❌ Backend: No user found, redirecting to error");
            res.redirect('/login?error=auth');
        }
    }
);

// Logout route: destroys session and returns JSON response
router.get('/logout', (req, res, next) => {
  console.log("🚪 Backend: Logout request received");
  console.log("🚪 Backend: Session ID:", req.sessionID);
  console.log("🚪 Backend: Is authenticated before logout:", req.isAuthenticated());
  
  req.logout(function(err) {
    if (err) {
      console.error("❌ Backend: Logout error:", err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log("✅ Backend: User logged out successfully");
    req.session?.destroy?.(() => {
      res.clearCookie('connect.sid');
      console.log("✅ Backend: Session destroyed and cookie cleared");
      res.json({ message: 'Logged out successfully' }); // Changed to JSON response
    });
  });
});

// GET /api/v1/auth/me - returns user info if authenticated
router.get('/me', (req, res) => {
    console.log("🔍 Backend: /me endpoint called");
    console.log("🔍 Backend: Session ID:", req.sessionID);
    console.log("🔍 Backend: Is authenticated:", req.isAuthenticated());
    console.log("🔍 Backend: User object:", req.user);
    
    res.set('Cache-Control', 'no-store');
    if (req.isAuthenticated && req.isAuthenticated()) {
        console.log("✅ Backend: User is authenticated, returning user data");
        res.json({ user: req.user });
    } else if (req.user) {
        console.log("✅ Backend: User object exists, returning user data");
        res.json({ user: req.user });
    } else {
        console.log("❌ Backend: User is not authenticated");
        res.status(401).json({ error: 'Not authenticated' });
    }
});

export default router;