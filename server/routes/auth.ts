import { Router } from 'express';
import { register, login, logout, getProfile, updateProfile, updateAvatar, removeAvatar } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

// Public routes
router.post('/register', uploadAvatar.single('avatar'), register);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile/:userId', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile/avatar', authenticateToken, uploadAvatar.single('avatar'), updateAvatar);
router.delete('/profile/avatar', authenticateToken, removeAvatar);

export default router;
  