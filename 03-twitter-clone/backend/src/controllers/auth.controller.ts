import { Request, Response } from 'express';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import { config } from '../config';
import { twitterStore, TweetUser, TweetProfile } from '../services/store.service';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, name } = req.body;

      if (!email || !username || !password || !name) {
        res.status(400).json({ error: 'All fields (email, username, password, name) are required' });
        return;
      }

      const existingEmail = twitterStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const existingUser = twitterStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existingUser) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'usr_' + Math.random().toString(36).substring(2, 9);

      const user: TweetUser = {
        id: userId,
        email,
        username,
        passwordHash,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const profile: TweetProfile = {
        id: 'prof_' + Math.random().toString(36).substring(2, 9),
        userId,
        bio: '',
        location: '',
        website: ''
      };

      twitterStore.users.push(user);
      twitterStore.profiles.push(profile);

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration successful',
        user: { id: user.id, email: user.email, username: user.username, name: user.name },
        token
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        res.status(400).json({ error: 'Credentials required' });
        return;
      }

      const user = twitterStore.users.find(
        u => u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
             u.username.toLowerCase() === emailOrUsername.toLowerCase()
      );

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, username: user.username, name: user.name },
        token
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
