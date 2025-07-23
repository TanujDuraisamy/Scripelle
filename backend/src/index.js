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

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.use("/api/v1",router)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
