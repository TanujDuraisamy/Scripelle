import { Router } from 'express';
import { google } from 'googleapis'
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
    accessType: 'offline',
    prompt: 'consent',
}));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=auth' }),
    (req, res) => {
        if (req.user) {
            res.redirect('http://localhost:5173/');
        } else {
            res.redirect('/login?error=auth');
        }
    }
);

// Logout route: destroys session and redirects to frontend
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session?.destroy?.(() => {
      res.clearCookie('connect.sid');
      res.redirect('http://localhost:5173/');
    });
  });
});

// GET /api/v1/auth/me - returns user info if authenticated
router.get('/me', (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.json({ user: req.user });
    } else if (req.user) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

export default router;