import crypto from 'crypto';
import User, { IUser } from '../models/User';
import ChatRoom from '../models/ChatRoom';
import Message from '../models/Message';

const BOT_EMAIL = process.env.BOT_EMAIL || 'soro-bot@soro.app';
const BOT_USERNAME = process.env.BOT_NAME || 'Soro Bot';

let cachedBotUser: IUser | null = null;

export const getBotUser = async (): Promise<IUser> => {
  if (cachedBotUser) {
    return cachedBotUser;
  }

  let bot = await User.findOne({ email: BOT_EMAIL });

  if (!bot) {
    bot = new User({
      username: BOT_USERNAME,
      email: BOT_EMAIL,
      password: crypto.randomBytes(16).toString('hex'),
      avatar: '',
      isOnline: false
    });

    await bot.save();
  }

  cachedBotUser = bot;
  return bot;
};

export const setupBotChatForUser = async (userId: string | null | undefined) => {
  if (!userId) return;

  const bot = await getBotUser();

  const existingRoom = await ChatRoom.findOne({
    isBot: true,
    participants: { $all: [userId, bot._id] }
  });

  if (existingRoom) {
    return existingRoom;
  }

  const newRoom = new ChatRoom({
    name: BOT_USERNAME,
    description: 'Chat with Soro Bot',
    participants: [userId, bot._id],
    isGroup: false,
    isBot: true,
    createdBy: bot._id
  });

  await newRoom.save();

  const welcomeMessage = new Message({
    sender: bot._id,
    content: `Hi there! I'm ${BOT_USERNAME}. Ask me anything or just say hi to see how the chat works.`,
    chatRoom: newRoom._id,
    messageType: 'text'
  });

  await welcomeMessage.save();

  newRoom.lastMessage = welcomeMessage._id as any;
  await newRoom.save();

  return newRoom;
};

export const generateBotReply = (userMessage: string): string => {
  const normalized = userMessage.toLowerCase();

  if (normalized.includes('hello') || normalized.includes('hi')) {
    return 'Hey there! 👋 Great to meet you. Ready to explore what Soro can do?';
  }

  if (normalized.includes('help') || normalized.includes('what can you do')) {
    return 'I can keep you company while you test this UI. Try sending a few messages to see the real-time updates!';
  }

  if (normalized.includes('thanks') || normalized.includes('thank you')) {
    return 'Anytime! Let me know if you want to try anything else.';
  }

  if (normalized.includes('bye') || normalized.includes('goodbye')) {
    return 'Bye for now! I’ll be right here if you need me again.';
  }

  const fillers = [
    "That's cool! Tell me more.",
    "Love where this is going—keep typing!",
    "I'm just a friendly bot, but I'm great at conversation practice 😄",
    "This chat UI is shaping up nicely, don't you think?"
  ];

  return fillers[Math.floor(Math.random() * fillers.length)];
};



