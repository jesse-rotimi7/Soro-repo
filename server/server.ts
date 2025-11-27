import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import { authenticateToken } from './middleware/auth';
import User from './models/User';
import Message from './models/Message';
import ChatRoom from './models/ChatRoom';
import { getBotUser, generateBotReply } from './utils/bot';
import { ensureDemoUser } from './utils/demo';

// Extend Socket interface to include custom properties
interface CustomSocket extends Socket {
  userId?: string;
  user?: any;
}

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB (non-blocking - server will run even if DB fails)
connectDB().then((connected) => {
  if (connected) {
    ensureDemoUser();
  }
}).catch((error) => {
  console.error('Failed to initialize database:', error);
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files for avatars
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io authentication middleware
io.use(async (socket: CustomSocket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.userId = (user._id as any).toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket: CustomSocket) => {
  console.log(`User connected: ${socket.user?.username}`);

  // Update user online status
  User.findByIdAndUpdate(socket.userId, { isOnline: true });

  // Join user to their chat rooms
  socket.on('join-rooms', async () => {
    try {
      const chatRooms = await ChatRoom.find({
        participants: socket.userId
      });

      chatRooms.forEach(room => {
        socket.join((room._id as any).toString());
      });
    } catch (error) {
      console.error('Error joining rooms:', error);
    }
  });

  // Join a specific room
  socket.on('join-room', (roomId: string) => {
    try {
      socket.join(roomId);
      console.log(`User ${socket.user?.username} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  // Leave a specific room
  socket.on('leave-room', (roomId: string) => {
    try {
      socket.leave(roomId);
      console.log(`User ${socket.user?.username} left room ${roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Handle new messages
  socket.on('send-message', async (data) => {
    try {
      const { content, chatRoom, messageType = 'text' } = data;

      const room = await ChatRoom.findById(chatRoom);

      if (!room) {
        return socket.emit('error', { message: 'Chat room not found' });
      }

      const isParticipant = room.participants.some(participant =>
        participant.toString() === socket.userId
      );

      if (!isParticipant) {
        return socket.emit('error', { message: 'You are not part of this chat room' });
      }

      // Create message
      const message = new Message({
        sender: socket.userId,
        content,
        chatRoom,
        messageType
      });

      await message.save();
      await message.populate('sender', 'username avatar');

      // Update last message in chat room
      await ChatRoom.findByIdAndUpdate(chatRoom, {
        lastMessage: message._id,
        updatedAt: new Date()
      });

      // Emit message to all users in the chat room
      io.to(chatRoom).emit('new-message', message);

      // Emit updated chat room to participants
      const updatedRoom = await ChatRoom.findById(chatRoom)
        .populate('participants', 'username email avatar isOnline')
        .populate('lastMessage')
        .populate('createdBy', 'username');

      io.to(chatRoom).emit('room-updated', updatedRoom);

      if (room.isBot) {
        setTimeout(async () => {
          try {
            const botUser = await getBotUser();
            const botReply = new Message({
              sender: botUser._id,
              content: generateBotReply(content),
              chatRoom,
              messageType: 'text'
            });

            await botReply.save();
            await botReply.populate('sender', 'username avatar');

            await ChatRoom.findByIdAndUpdate(chatRoom, {
              lastMessage: botReply._id,
              updatedAt: new Date()
            });

            io.to(chatRoom).emit('new-message', botReply);

            const botUpdatedRoom = await ChatRoom.findById(chatRoom)
              .populate('participants', 'username email avatar isOnline')
              .populate('lastMessage')
              .populate('createdBy', 'username');

            io.to(chatRoom).emit('room-updated', botUpdatedRoom);
          } catch (botError) {
            console.error('Bot reply error:', botError);
          }
        }, 800);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.chatRoom).emit('user-typing', {
      userId: socket.userId,
      username: socket.user?.username,
      chatRoom: data.chatRoom
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.chatRoom).emit('user-stop-typing', {
      userId: socket.userId,
      chatRoom: data.chatRoom
    });
  });

  // Handle user disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.user?.username}`);
    
    try {
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify all chat rooms about user going offline
      const chatRooms = await ChatRoom.find({
        participants: socket.userId
      });

      chatRooms.forEach(room => {
        socket.to((room._id as any).toString()).emit('user-status-changed', {
          userId: socket.userId,
          isOnline: false,
          lastSeen: new Date()
        });
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
