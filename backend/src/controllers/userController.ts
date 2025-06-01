import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = new User(req.body);
    await user.save();
    
    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    res.json(req.user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'profile', 'company'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      res.status(400).json({ error: 'Invalid updates!' });
      return;
    }

    // Find and update the user directly
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    updates.forEach(update => {
      if (update in req.body) {
        (user as any)[update] = req.body[update];
      }
    });
    
    await user.save();
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}; 