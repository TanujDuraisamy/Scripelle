import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index.js';
import session from 'express-session';
import './commons/googleAuth.js'
import passport from 'passport';
const allowedOrigins = ['http://localhost:5173']

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax', // Good for localhost, allows cross-origin with navigation
    secure: false    // Only true if using HTTPS
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// CORS setup for frontend integration
app.use(cors({
  origin: 'http://localhost:5173', // Only allow your frontend
  credentials: true                // Allow cookies to be sent
}));
app.use(express.json());

app.use("/api/v1",router)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
