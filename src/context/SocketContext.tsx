'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  chatRoom: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: string;
}

interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  participants: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
  }>;
  isGroup: boolean;
  isBot?: boolean;
  createdBy: {
    _id: string;
    username: string;
  };
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  onlineUsers: Set<string>;
  typingUsers: Set<string>;
  setCurrentRoom: (room: ChatRoom | null) => void;
  sendMessage: (content: string, chatRoom: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  loadMessages: (roomId: string) => Promise<void>;
  loadChatRooms: () => Promise<void>;
  createDirectMessage: (targetUserId: string) => Promise<ChatRoom | null>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoomState] = useState<ChatRoom | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const currentRoomRef = useRef<ChatRoom | null>(null);
  
  const { user, token } = useAuth();
  
  // Keep ref in sync with state
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    if (user && token) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('join-rooms');
      });

      newSocket.on('new-message', (message: Message) => {
        const messageRoomId = message.chatRoom?.toString();
        console.log('New message received for room:', messageRoomId, 'Current room:', currentRoom?._id?.toString());
        
        // Add message to the list (filtering happens in MessageBox)
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(msg => {
            const msgId = msg._id?.toString();
            const newMsgId = message._id?.toString();
            return msgId === newMsgId;
          });
          
          if (exists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          
          console.log('Adding new message to list');
          return [...prev, message];
        });
      });

      newSocket.on('room-updated', (room: ChatRoom) => {
        setChatRooms(prev => 
          prev.map(r => r._id === room._id ? room : r)
        );
      });

      newSocket.on('user-status-changed', (data: { userId: string; isOnline: boolean }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (data.isOnline) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });

      newSocket.on('user-typing', (data: { userId: string; username: string }) => {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      });

      newSocket.on('user-stop-typing', (data: { userId: string }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const sendMessage = (content: string, chatRoom: string) => {
    if (socket) {
      socket.emit('send-message', {
        content,
        chatRoom,
        messageType: 'text'
      });
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave-room', roomId);
    }
  };

  const startTyping = (roomId: string) => {
    if (socket) {
      socket.emit('typing', { chatRoom: roomId });
    }
  };

  const stopTyping = (roomId: string) => {
    if (socket) {
      socket.emit('stop-typing', { chatRoom: roomId });
    }
  };

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      console.log('Loading messages for room:', roomId);
      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        console.log('Loaded messages:', newMessages.length);
        
        // Merge messages: remove old messages for this room, then add new ones
        setMessages(prev => {
          // Remove messages from this room
          const otherRoomMessages = prev.filter(msg => {
            const msgRoomId = msg.chatRoom?.toString();
            return msgRoomId !== roomId;
          });
          
          // Remove duplicates from newMessages (in case we're reloading)
          const uniqueNewMessages = newMessages.filter((newMsg: Message) => {
            const newMsgId = newMsg._id?.toString();
            return !otherRoomMessages.some(existing => existing._id?.toString() === newMsgId);
          });
          
          // Combine with new messages for this room
          const combined = [...otherRoomMessages, ...uniqueNewMessages];
          console.log('Total messages after merge:', combined.length, '(other rooms:', otherRoomMessages.length, ', new for this room:', uniqueNewMessages.length, ')');
          return combined;
        });
      } else {
        console.error('Failed to load messages:', response.status);
        // Don't clear all messages, just log the error
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't clear all messages on error
    }
  }, [token]);

  const handleSetCurrentRoom = useCallback((room: ChatRoom | null) => {
    console.log('handleSetCurrentRoom called with room:', room?._id, room?.name);
    
    // Don't do anything if it's the same room (use ref to avoid dependency)
    const prevRoom = currentRoomRef.current;
    if (prevRoom && room && prevRoom._id === room._id) {
      console.log('Same room, skipping');
      return;
    }
    
    // Leave previous room if exists
    if (prevRoom && socket && prevRoom._id) {
      console.log('Leaving previous room:', prevRoom._id);
      socket.emit('leave-room', prevRoom._id);
    }

    // Set new current room first (don't clear messages yet - let loadMessages handle it)
    setCurrentRoomState(room);

    // Join new room and load messages
    if (room && room._id && socket) {
      const roomId = room._id.toString();
      console.log('Joining room:', roomId);
      socket.emit('join-room', roomId);
      
      // Load messages - this will replace messages for the new room
      console.log('Loading messages for room:', roomId);
      loadMessages(roomId);
    } else if (!room) {
      // Clear everything if no room selected
      console.log('No room selected, clearing messages');
      setMessages([]);
    }
  }, [socket, loadMessages]);

  const loadChatRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.chatRooms);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const createDirectMessage = async (targetUserId: string): Promise<ChatRoom | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/direct-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        const newRoom = data.chatRoom;

        // Update chat rooms list
        if (data.isNew) {
          setChatRooms(prev => [newRoom, ...prev]);
        } else {
          // Update existing room if it was already in the list
          setChatRooms(prev => 
            prev.map(room => room._id === newRoom._id ? newRoom : room)
          );
        }

        // Join the room via socket if connected
        if (socket && newRoom._id) {
          socket.emit('join-room', newRoom._id);
        }

        return newRoom;
      } else {
        const errorData = await response.json();
        console.error('Error creating direct message:', errorData.message);
        return null;
      }
    } catch (error) {
      console.error('Error creating direct message:', error);
      return null;
    }
  };

  const value: SocketContextType = {
    socket,
    messages,
    chatRooms,
    currentRoom,
    onlineUsers,
    typingUsers,
    setCurrentRoom: handleSetCurrentRoom,
    sendMessage,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    loadMessages,
    loadChatRooms,
    createDirectMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

