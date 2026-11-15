import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { memoryStore, StoredUser, StoredProfile } from '../services/store.service';
import { config } from '../config';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, name } = req.body;

      if (!email || !username || !password || !name) {
        res.status(400).json({ error: 'Missing required registration fields' });
        return;
      }

      const existingEmail = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const existingUsername = memoryStore.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (existingUsername) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `u_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const newUser: StoredUser = {
        id: userId,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        name,
        passwordHash,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.push(newUser);

      const newProfile: StoredProfile = {
        id: `p_${userId}`,
        userId,
        profilePrivacy: 'PUBLIC',
        allowSearchIndex: true,
      };
      memoryStore.profiles.push(newProfile);

      const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1d' });

      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' });
        return;
      }

      const user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '1d' });

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
