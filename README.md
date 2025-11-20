# Soro - Real-time Chat Application

A modern, full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## Features

- 🔐 JWT Authentication (Signup/Login)
- 💬 Real-time messaging with Socket.io
- 👥 User management with online/offline status
- 📱 Responsive design with dark theme
- 🎨 Modern UI with Tailwind CSS
- 🔒 Protected routes and middleware
- 📊 MongoDB with Mongoose ODM

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
soro/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── login/           # Login page
│   │   ├── register/        # Register page
│   │   ├── chat/            # Chat page
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── Navbar.tsx
│   │   ├── ChatList.tsx
│   │   ├── MessageBox.tsx
│   │   └── MessageInput.tsx
│   ├── context/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx
│   ├── pages/              # Page components
│   └── utils/              # Utility functions
├── server/                 # Backend server
│   ├── config/             # Configuration
│   │   └── database.ts
│   ├── controllers/        # Route controllers
│   │   ├── authController.ts
│   │   └── chatController.ts
│   ├── middleware/         # Custom middleware
│   │   └── auth.ts
│   ├── models/            # Mongoose models
│   │   ├── User.ts
│   │   ├── Message.ts
│   │   └── ChatRoom.ts
│   ├── routes/            # API routes
│   │   ├── auth.ts
│   │   └── chat.ts
│   └── server.ts          # Main server file
└── env.example            # Environment variables template
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your MongoDB connection details:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/soro-chat
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/soro-chat

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/soro-chat` as your MONGODB_URI

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `<username>`, `<password>`, and `<cluster>` in the connection string
5. Use the Atlas connection string as your MONGODB_URI

### 4. Run the Application

```bash
# Start both frontend and backend concurrently
npm run dev

# Or run them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Chat**: Start messaging in real-time
4. **Features**:
   - Real-time message delivery
   - Online/offline user status
   - Typing indicators
   - Responsive design
   - Dark theme with orange accent (#F18805)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile/:userId` - Get user profile

### Chat
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms` - Get user's chat rooms
- `GET /api/chat/rooms/:roomId` - Get specific chat room
- `GET /api/chat/rooms/:roomId/messages` - Get messages
- `POST /api/chat/messages` - Send message
- `GET /api/chat/users` - Search users

## Socket.io Events

### Client to Server
- `join-rooms` - Join user's chat rooms
- `send-message` - Send a message
- `typing` - Start typing indicator
- `stop-typing` - Stop typing indicator

### Server to Client
- `new-message` - New message received
- `room-updated` - Chat room updated
- `user-status-changed` - User online/offline status changed
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing

## Development

### Scripts
- `npm run dev` - Start both frontend and backend
- `npm run client` - Start frontend only
- `npm run server` - Start backend only
- `npm run build` - Build for production
- `npm run start` - Start production build
- `npm run lint` - Run ESLint

### Adding Features
1. Backend: Add routes in `server/routes/`, controllers in `server/controllers/`
2. Frontend: Add components in `src/components/`, pages in `src/pages/`
3. Real-time: Add Socket.io events in `server/server.ts` and `src/context/SocketContext.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions, please open an issue in the repository.
