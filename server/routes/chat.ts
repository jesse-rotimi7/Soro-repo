import { Router } from 'express';
import {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  getMessages,
  createMessage,
  getUsers,
  getUserProfile,
  createDirectMessage
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// Chat room routes
router.post('/rooms', createChatRoom);
router.get('/rooms', getChatRooms);
router.get('/rooms/:roomId', getChatRoomById);

// Message routes
router.get('/rooms/:roomId/messages', getMessages);
router.post('/messages', createMessage);

// User routes
router.get('/users', getUsers);
router.get('/users/:userId/profile', getUserProfile);
router.post('/direct-message', createDirectMessage);

export default router;
