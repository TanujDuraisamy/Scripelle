import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './db.js';

// Main Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
        // TODO: Restore Google Docs import functionality - removed temporarily
        // 'https://www.googleapis.com/auth/drive.readonly',
        // 'https://www.googleapis.com/auth/documents.readonly'
    ],
    accessType: 'offline', // Needed for refresh tokens
    prompt: 'consent',     // Always ask for consent to get refresh token
}, 
async (accessToken, refreshToken, profile, done) => {
    console.log("🔐 GoogleAuth: OAuth callback received!");
    console.log("🔐 GoogleAuth: Profile info:", {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value
    });
    
    try {
        const email = profile.emails[0].value;
        const providerId = profile.id;

        console.log("🔐 GoogleAuth: Looking up user in database...");

        // Check if user already exists
        const existing = await db.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['google', providerId]
        );

        let user = existing.rows[0];

        if (!user) {
            console.log("🔐 GoogleAuth: Creating new user...");
            const username = profile.displayName;
            const result = await db.query(
                `INSERT INTO users (email, username, provider, provider_id, access_token, refresh_token)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, email, username, access_token, refresh_token`,
                [email, username, 'google', providerId, accessToken, refreshToken]
            );
            user = result.rows[0];
            console.log("✅ GoogleAuth: New user created:", {
                id: user.id,
                email: user.email,
                username: user.username
            });
        } else {
            console.log("🔐 GoogleAuth: Updating existing user tokens...");
            // Always update tokens on login
            await db.query(
                'UPDATE users SET access_token = $1, refresh_token = $2 WHERE provider = $3 AND provider_id = $4',
                [accessToken, refreshToken, 'google', providerId]
            );
            user.access_token = accessToken;
            user.refresh_token = refreshToken;
            console.log("✅ GoogleAuth: Existing user updated:", {
                id: user.id,
                email: user.email,
                username: user.username
            });
        }

        console.log("✅ GoogleAuth: Authentication successful, returning user");
        return done(null, user);
    } catch (error) {
        console.error("❌ GoogleAuth: Authentication error:", error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    console.log("🔐 GoogleAuth: Serializing user:", user.id);
    done(null, user);
});

passport.deserializeUser((user, done) => {
    console.log("🔐 GoogleAuth: Deserializing user:", user.id);
    done(null, user);
});

export default passport;
