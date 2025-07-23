import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import db from './db.js'



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try{
        const email = profile.emails[0].value;
        const providerId = profile.id;

        const existing =await db.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['google', providerId]
        );

        let user = existing.rows[0];

        if(!user){
            const username = profile.displayName;
            const result = await db.query(
                `INSERT INTO users (email, username, provider, provider_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id, email, username`,
                [email, username, 'google', providerId]
            );
            user = result.rows[0];
        }
        user.accessToken  = accessToken
        return done(null,user);

    }catch(error){
        return done(error,null);
    }
}));

passport.serializeUser((user , done) => done(null,user));
passport.deserializeUser((user,done) => done(null,user))

export default passport;