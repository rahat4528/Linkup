import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { instaStore, InstaUser, InstaProfile } from '../services/store.service';
import { config } from '../config';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, name } = req.body;
      if (!email || !username || !password || !name) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const existingEmail = instaStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const existingUsername = instaStore.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (existingUsername) {
        res.status(409).json({ error: 'Username already in use' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `u_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const newUser: InstaUser = {
        id: userId,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        name,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      instaStore.users.push(newUser);

      const newProfile: InstaProfile = {
        id: `prof_${userId}`,
        userId,
        isPrivate: false,
        isVerified: false,
      };
      instaStore.profiles.push(newProfile);

      const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1d' });

      res.status(201).json({
        user: { id: newUser.id, username: newUser.username, email: newUser.email, name: newUser.name },
        profile: newProfile,
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = instaStore.users.find(
        (u) => u.email.toLowerCase() === email?.toLowerCase() || u.username.toLowerCase() === email?.toLowerCase()
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

      const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '1d' });
      const profile = instaStore.profiles.find((p) => p.userId === user.id);

      res.status(200).json({
        user: { id: user.id, username: user.username, email: user.email, name: user.name },
        profile,
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
