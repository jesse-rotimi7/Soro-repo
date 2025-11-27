import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';
import { setupBotChatForUser } from '../utils/bot';

export const register = async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected. Please check your MongoDB connection and try again.',
        error: 'DATABASE_NOT_CONNECTED'
      });
    }

    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    // Handle avatar file upload (if provided)
    let avatarPath = '';
    if ((req as any).file) {
      avatarPath = `/uploads/avatars/${(req as any).file.filename}`;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      avatar: avatarPath
    });

    await user.save();
    await setupBotChatForUser((user._id as any).toString());

    // Generate token
    const token = generateToken((user._id as any).toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        error: Object.values(error.errors).map((e: any) => e.message).join(', ')
      });
    }
    
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        message: 'Database error. Please check your MongoDB connection.',
        error: 'DATABASE_ERROR'
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message || 'UNKNOWN_ERROR'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected. Please check your MongoDB connection and try again.',
        error: 'DATABASE_NOT_CONNECTED'
      });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    await setupBotChatForUser((user._id as any).toString());

    // Generate token
    const token = generateToken((user._id as any).toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Provide more specific error messages
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        message: 'Database error. Please check your MongoDB connection.',
        error: 'DATABASE_ERROR'
      });
    }

    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message || 'UNKNOWN_ERROR'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, email } = req.body;

    // Update username if provided
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && (existingUser._id as any).toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    // Update email if provided
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && (existingUser._id as any).toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      user.email = email.toLowerCase();
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!(req as any).file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar file if it exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update avatar path
    const avatarPath = `/uploads/avatars/${(req as any).file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error: any) {
    console.error('Update avatar error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

export const removeAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar file if it exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Remove avatar
    user.avatar = '';
    await user.save();

    res.json({
      message: 'Avatar removed successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
  } catch (error: any) {
    console.error('Remove avatar error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
