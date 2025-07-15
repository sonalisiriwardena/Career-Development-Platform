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

    console.log('Update profile request body:', JSON.stringify(req.body, null, 2));

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

    // Process updates with proper date conversion
    updates.forEach(update => {
      if (update in req.body) {
        if (update === 'profile' && req.body.profile) {
          // Handle profile updates with date conversion
          const profileData = { ...req.body.profile };
          
          // Convert experience dates
          if (profileData.experience && Array.isArray(profileData.experience)) {
            profileData.experience = profileData.experience.map((exp: any) => ({
              ...exp,
              startDate: exp.startDate ? new Date(exp.startDate) : undefined,
              endDate: exp.endDate ? new Date(exp.endDate) : undefined
            }));
          }
          
          // Convert education dates
          if (profileData.education && Array.isArray(profileData.education)) {
            profileData.education = profileData.education.map((edu: any) => ({
              ...edu,
              startDate: edu.startDate ? new Date(edu.startDate) : undefined,
              endDate: edu.endDate ? new Date(edu.endDate) : undefined
            }));
          }
          
          console.log('Processed profile data:', JSON.stringify(profileData, null, 2));
          (user as any)[update] = profileData;
        } else {
          (user as any)[update] = req.body[update];
        }
      }
    });
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error: any) {
    console.error('Profile update error:', error);
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