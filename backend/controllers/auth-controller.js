import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import 'dotenv/config';

const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password and requested role are required.' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO Users (username, password_hash, role, status) 
      VALUES ($1, $2, $3, 'PENDING') 
      RETURNING id, username, role, status
    `;
    const { rows } = await db.query(query, [username, hashedPassword, role]);

    res.status(201).json({
      message: 'Registration successful! Waiting for manager approval.',
      user: rows[0],
    });
  } catch (error) {
    // Verificăm dacă username-ul există deja (Eroare de constrângere unică în Postgres)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username already exists.' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(`SELECT * FROM Users WHERE username = $1`, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    if (user.status === 'PENDING') {
      return res.status(403).json({ error: 'Your account is pending manager approval.' });
    }
    if (user.status === 'REJECTED') {
      return res.status(403).json({ error: 'Your account request was rejected.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { registerUser, loginUser };
