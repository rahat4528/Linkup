import { Request, Response } from 'express';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-music-streaming-key-change-in-production-2026';

// In-memory user store for mock/test runs alongside Prisma
export const mockUsers = new Map<string, any>();

export class AuthController {
  public async register(req: Request, res: Response) {
    try {
      const { email, username, password, displayName, role } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ error: 'Email, username, and password are required' });
      }

      // Check existing
      for (const u of mockUsers.values()) {
        if (u.email === email || u.username === username) {
          return res.status(409).json({ error: 'User with this email or username already exists' });
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email,
        username,
        displayName: displayName || username,
        passwordHash,
        role: role === 'CREATOR' ? 'CREATOR' : 'USER',
        createdAt: new Date().toISOString()
      };

      mockUsers.set(newUser.id, newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          displayName: newUser.displayName,
          role: newUser.role
        },
        token
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Registration failed', details: err.message });
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      let user: any = null;
      for (const u of mockUsers.values()) {
        if (u.email === email) {
          user = u;
          break;
        }
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          role: user.role
        },
        token
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Login failed', details: err.message });
    }
  }

  public async getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = mockUsers.get(req.user.id);
    if (!user) {
      return res.status(200).json({ user: req.user });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
  }
}
