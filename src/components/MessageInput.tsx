'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

interface MessageInputProps {
  currentRoom: any;
}

const MessageInput: React.FC<MessageInputProps> = ({ currentRoom }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && currentRoom) {
      sendMessage(message.trim(), currentRoom._id);
      setMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        stopTyping(currentRoom._id);
        setIsTyping(false);
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!currentRoom) return;

    // Start typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      startTyping(currentRoom._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        stopTyping(currentRoom._id);
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!currentRoom) {
    return null;
  }

  const otherParticipant = !currentRoom.isGroup
    ? currentRoom.participants?.find((participant: any) => participant._id !== user?.id)
    : null;

  const placeholderTarget = currentRoom.isGroup
    ? currentRoom.name
    : otherParticipant?.username || currentRoom.name || 'chat';

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${placeholderTarget}...`}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F18805] focus:ring-1 focus:ring-[#F18805] transition-colors"
            maxLength={1000}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-[#F18805] hover:bg-[#F18805]/90 text-black font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      
      <div className="mt-2 text-xs text-gray-400">
        {message.length}/1000 characters
      </div>
    </div>
  );
};

export default MessageInput;

