import express from 'express';
import { register, login, getProfile, updateProfile, getAllUsers } from '../controllers/userController';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.get('/users', auth, checkRole(['admin']), getAllUsers);

export default router; 