import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ChatRoom from '../models/ChatRoom';
import Message from '../models/Message';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createChatRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, participants, isGroup } = req.body;
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([userId.toString(), ...participants])];

    const chatRoom = new ChatRoom({
      name,
      description,
      participants: allParticipants,
      isGroup: isGroup || allParticipants.length > 2,
      createdBy: userId
    });

    await chatRoom.save();
    await chatRoom.populate('participants', 'username email avatar isOnline');

    res.status(201).json({
      message: 'Chat room created successfully',
      chatRoom
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const chatRooms = await ChatRoom.find({
      participants: userId
    })
    .populate('participants', 'username email avatar isOnline')
    .populate('lastMessage')
    .populate('createdBy', 'username')
    .sort({ updatedAt: -1 });

    res.json({ chatRooms });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const chatRoom = await ChatRoom.findOne({
      _id: roomId,
      participants: userId
    })
    .populate('participants', 'username email avatar isOnline')
    .populate('lastMessage')
    .populate('createdBy', 'username');

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    res.json({ chatRoom });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is participant of the chat room
    const chatRoom = await ChatRoom.findOne({
      _id: roomId,
      participants: userId
    });

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const messages = await Message.find({ chatRoom: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, chatRoom, messageType = 'text' } = req.body;
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is participant of the chat room
    const room = await ChatRoom.findOne({
      _id: chatRoom,
      participants: userId
    });

    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const message = new Message({
      sender: userId,
      content,
      chatRoom,
      messageType
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // Update last message in chat room
    await ChatRoom.findByIdAndUpdate(chatRoom, {
      lastMessage: message._id as any,
      updatedAt: new Date()
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected',
        error: 'DATABASE_NOT_CONNECTED'
      });
    }

    const { search, online, excludeExistingChats } = req.query;
    const userId = req.user?._id as any;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Convert userId to string for consistent comparison
    const userIdStr = userId.toString();

    let query: any = { _id: { $ne: userId } };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (online === 'true') {
      query.isOnline = true;
    }

    let users = await User.find(query)
      .select('username email avatar isOnline lastSeen createdAt')
      .limit(50)
      .sort({ isOnline: -1, username: 1 });

    console.log(`Found ${users.length} users before filtering`);

    // Exclude users you already chat with
    if (excludeExistingChats === 'true') {
      const existingRooms = await ChatRoom.find({
        participants: userId,
        isGroup: false
      }).select('participants');

      console.log(`Found ${existingRooms.length} existing chat rooms`);

      const existingUserIds = new Set<string>();
      existingRooms.forEach(room => {
        room.participants.forEach((id: any) => {
          const idStr = id.toString();
          if (idStr !== userIdStr) {
            existingUserIds.add(idStr);
          }
        });
      });

      console.log(`Excluding ${existingUserIds.size} users from existing chats`);
      
      const beforeFilter = users.length;
      users = users.filter(user => {
        const userStr = (user._id as any).toString();
        return !existingUserIds.has(userStr);
      });
      console.log(`After filtering: ${users.length} users (removed ${beforeFilter - users.length})`);
    }

    console.log(`Returning ${users.length} users`);
    res.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user?._id as any;

    if (!currentUserId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot view your own profile this way' });
    }

    const user = await User.findById(targetUserId)
      .select('username email avatar isOnline lastSeen createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if DM already exists
    const existingRoom = await ChatRoom.findOne({
      participants: { $all: [currentUserId, targetUserId] },
      isGroup: false
    }).select('_id name');

    res.json({
      user,
      hasExistingChat: !!existingRoom,
      existingRoomId: existingRoom?._id || null
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDirectMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user?._id as any;

    if (!currentUserId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot create DM with yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if DM already exists
    const existingRoom = await ChatRoom.findOne({
      participants: { $all: [currentUserId, targetUserId] },
      isGroup: false
    })
    .populate('participants', 'username email avatar isOnline')
    .populate('lastMessage')
    .populate('createdBy', 'username');

    if (existingRoom) {
      return res.json({
        message: 'Chat already exists',
        chatRoom: existingRoom,
        isNew: false
      });
    }

    // Create new DM
    const currentUser = await User.findById(currentUserId);
    const roomName = targetUser.username;

    const newRoom = new ChatRoom({
      name: roomName,
      participants: [currentUserId, targetUserId],
      isGroup: false,
      isBot: false,
      createdBy: currentUserId
    });

    await newRoom.save();
    await newRoom.populate('participants', 'username email avatar isOnline');
    await newRoom.populate('createdBy', 'username');

    res.status(201).json({
      message: 'Direct message created successfully',
      chatRoom: newRoom,
      isNew: true
    });
  } catch (error) {
    console.error('Create direct message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
