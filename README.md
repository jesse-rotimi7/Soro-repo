<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<h1 align="center">🗨️ Soro</h1>

<p align="center">
  <strong>A modern real-time chat application built with cutting-edge web technologies</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 🎯 Overview

**Soro** is a full-stack real-time messaging platform that enables seamless communication between users. Built with a focus on performance, scalability, and user experience, it demonstrates proficiency in modern web development practices including WebSocket communication, JWT authentication, responsive design, and cloud deployment.

### 🌟 Why Soro?

- **Real-time First**: Instant message delivery using Socket.io with WebSocket fallback
- **Modern Stack**: Built with Next.js 15, React 19, and TypeScript for type-safe development
- **Production Ready**: Deployed with split architecture (Vercel + Render) for optimal performance
- **Beautiful UI**: Crafted with Tailwind CSS featuring dark theme with signature orange accents

---

## ✨ Features

### Core Functionality
- 💬 **Real-time Messaging** - Instant message delivery with Socket.io
- 👥 **User Discovery** - Find and connect with other users
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📱 **Responsive Design** - Mobile-first approach with bottom navigation
- 🟢 **Online Status** - Real-time presence indicators
- ⌨️ **Typing Indicators** - See when others are typing
- 😊 **Emoji Support** - Rich emoji picker integration

### User Experience
- 🖼️ **Avatar Upload** - Profile pictures with Cloudinary integration
- 🔍 **Search & Filter** - Find conversations and users easily
- 🌙 **Dark Theme** - Easy on the eyes with glowing orange accents
- ⚡ **Optimistic Updates** - Instant UI feedback for better UX
- 📲 **PWA Ready** - Installable on mobile devices

### Technical Highlights
- 🔄 **Socket.io Rooms** - Efficient message broadcasting
- 🗄️ **MongoDB Atlas** - Cloud-hosted NoSQL database
- ☁️ **Cloudinary CDN** - Optimized image delivery
- 🚀 **Edge Deployment** - Vercel edge network for frontend

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library with latest features |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **Socket.io Client** | Real-time communication |
| **React Icons** | Icon library |
| **Emoji Picker React** | Emoji selection component |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express.js** | Node.js web framework |
| **Socket.io** | WebSocket server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Cloudinary** | Cloud image storage |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **Vercel** | Frontend hosting & CDN |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Database hosting |
| **Git** | Version control |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Vercel)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Next.js 15 Frontend                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │  Pages   │  │Components│  │ Context  │  │  Utils  │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Render)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Express.js Backend                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │  Routes  │  │Controllers│ │ Socket.io│  │Middleware│ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ MongoDB Atlas  │  │   Cloudinary   │  │      JWT       │     │
│  │   (Database)   │  │    (Images)    │  │    (Auth)      │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication Flow**
   ```
   User → Login/Register → Express API → JWT Token → Client Storage
   ```

2. **Messaging Flow**
   ```
   User Types → Socket.io Emit → Server Broadcast → Recipients Receive
   ```

3. **Image Upload Flow**
   ```
   File Select → Multer Parse → Cloudinary Upload → URL Stored in MongoDB
   ```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)
- Cloudinary account (optional, for avatars)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/soro.git
   cd soro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/soro
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   
   # Server
   PORT=5000
   CLIENT_URL=http://localhost:3000
   
   # Cloudinary (Optional - for avatar uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Frontend (in .env.local)
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. **Run the development servers**
   
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```
   
   Or run both concurrently:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
soro/
├── 📂 src/                     # Next.js frontend
│   ├── 📂 app/                 # App router pages
│   │   ├── 📄 page.tsx         # Landing page
│   │   ├── 📂 login/           # Login page
│   │   ├── 📂 register/        # Registration page
│   │   ├── 📂 chat/            # Main chat interface
│   │   ├── 📂 discover/        # User discovery
│   │   └── 📂 settings/        # User settings
│   ├── 📂 components/          # React components
│   │   ├── 📄 Navbar.tsx       # Navigation bar
│   │   ├── 📄 ChatList.tsx     # Conversation list
│   │   ├── 📄 MessageBox.tsx   # Message display
│   │   ├── 📄 MessageInput.tsx # Message composer
│   │   └── ...
│   ├── 📂 context/             # React contexts
│   │   ├── 📄 AuthContext.tsx  # Authentication state
│   │   └── 📄 SocketContext.tsx# Socket.io state
│   └── 📂 utils/               # Utility functions
│
├── 📂 server/                  # Express backend
│   ├── 📄 server.ts            # Entry point
│   ├── 📂 controllers/         # Route handlers
│   ├── 📂 models/              # Mongoose models
│   ├── 📂 routes/              # API routes
│   ├── 📂 middleware/          # Custom middleware
│   └── 📂 utils/               # Backend utilities
│
├── 📄 package.json             # Dependencies & scripts
├── 📄 next.config.ts           # Next.js configuration
├── 📄 tailwind.config.ts       # Tailwind configuration
└── 📄 tsconfig.json            # TypeScript configuration
```

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/profile` | Update profile |
| `POST` | `/api/auth/profile/avatar` | Upload avatar |
| `DELETE` | `/api/auth/profile/avatar` | Remove avatar |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat/rooms` | Get user's chat rooms |
| `POST` | `/api/chat/rooms` | Create chat room |
| `GET` | `/api/chat/rooms/:id/messages` | Get room messages |
| `GET` | `/api/chat/users` | Get discoverable users |
| `GET` | `/api/chat/users/:id/profile` | Get user profile |
| `POST` | `/api/chat/dm` | Create direct message |

### Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | Client → Server | Join a chat room |
| `leave_room` | Client → Server | Leave a chat room |
| `send_message` | Client → Server | Send a message |
| `receive_message` | Server → Client | Receive a message |
| `typing_start` | Client → Server | Start typing indicator |
| `typing_stop` | Client → Server | Stop typing indicator |
| `user_typing` | Server → Client | User is typing |
| `user_online` | Server → Client | User came online |
| `user_offline` | Server → Client | User went offline |

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`
4. Deploy

### Backend (Render)

1. Create a new Web Service
2. Connect your repository
3. Configure:
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server`
   - **Root Directory**: (leave empty)
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `CLOUDINARY_*` (if using)
5. Deploy

---

## 🎨 Design Decisions

### Why Split Deployment?
Socket.io requires a persistent server connection, which isn't possible with serverless functions. Splitting the frontend (Vercel) and backend (Render) allows:
- Edge-deployed frontend for fast page loads
- Persistent WebSocket connections on the backend
- Independent scaling of each service

### Why MongoDB?
- Flexible schema for evolving chat features
- Excellent for document-based data (messages, users)
- Native support for real-time change streams
- Easy cloud hosting with MongoDB Atlas

### Why Tailwind CSS?
- Rapid UI development with utility classes
- Consistent design system
- Excellent dark mode support
- Small production bundle with purging

---

## 🧪 Key Learnings

Building Soro provided hands-on experience with:

- **Real-time Systems**: Implementing WebSocket communication with Socket.io, handling connection states, and broadcasting messages efficiently
- **Authentication**: JWT token management, secure password hashing, and protected routes
- **State Management**: React Context for global state, optimistic updates, and socket event handling
- **Responsive Design**: Mobile-first approach with Tailwind CSS, safe area handling, and touch-optimized UI
- **Cloud Services**: Integrating Cloudinary for image uploads, MongoDB Atlas for database, and multi-platform deployment
- **TypeScript**: End-to-end type safety across frontend and backend

---

## 🔮 Future Enhancements

- [ ] Group chat functionality
- [ ] Message reactions
- [ ] Read receipts
- [ ] File/image sharing in messages
- [ ] Voice messages
- [ ] Push notifications
- [ ] Message search
- [ ] User blocking
- [ ] Chat themes customization
- [ ] End-to-end encryption

---

## 👨‍💻 Author

**Your Name**

- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>⭐ If you found this project interesting, please consider giving it a star!</strong>
</p>

<p align="center">
  Made with ❤️ and lots of ☕
</p>
