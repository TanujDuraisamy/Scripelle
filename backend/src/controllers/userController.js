import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../commons/db.js"; // Assuming you have a db.js file for database connection

export const signupController = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        console.log("Signup request received:", { email, username ,password});

        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (email, username, password, provider)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username`,
            [email, username, hashedPassword, 'email']
        );

        const user = result.rows[0];

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(201).json({ message: 'Signup successful', user, token });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  };


export const signinController = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Signin request received:", { email });

        const result = await db.query('SELECT * FROM users WHERE email = $1 AND provider = $2', [
            email,
            'email',
        ]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({ message: 'Signin successful', user: { id: user.id, email: user.email, username: user.username }, token });
    } catch (err) {
        console.error('Signin error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  };

export const getProfileController = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            'SELECT id, email, username, provider FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  };