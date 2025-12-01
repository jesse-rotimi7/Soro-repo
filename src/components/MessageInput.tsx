'use client';

import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { FiSmile, FiSend } from 'react-icons/fi';

interface MessageInputProps {
  currentRoom: any;
}

const MessageInput: React.FC<MessageInputProps> = ({ currentRoom }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerWidth, setEmojiPickerWidth] = useState(350);
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const updateWidth = () => {
      setEmojiPickerWidth(Math.min(350, window.innerWidth - 32));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && currentRoom) {
      sendMessage(message.trim(), currentRoom._id);
      setMessage('');
      
      if (isTyping) {
        stopTyping(currentRoom._id);
        setIsTyping(false);
      }
      
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

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      startTyping(currentRoom._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
    <div className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 p-4 safe-area-bottom">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Emoji Button */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-all ${
              showEmojiPicker 
                ? 'bg-[#F18805]/20 text-[#F18805]' 
                : 'text-gray-400 hover:text-[#F18805] hover:bg-gray-800'
            }`}
            aria-label="Toggle emoji picker"
          >
            <FiSmile className="w-5 h-5" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl">
              <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl shadow-black/50">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={Theme.DARK}
                  width={emojiPickerWidth}
                  height={400}
                  previewConfig={{
                    showPreview: false
                  }}
                  skinTonesDisabled
                />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${placeholderTarget}...`}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F18805] focus:ring-2 focus:ring-[#F18805]/20 transition-all text-sm"
            maxLength={1000}
          />
        </div>
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-3 bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#F18805]/20 hover:shadow-[#F18805]/30 hover:scale-105 active:scale-95 disabled:hover:scale-100"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </form>
      
      {/* Character count */}
      <div className="flex justify-end mt-2">
        <span className={`text-xs ${message.length > 900 ? 'text-[#F18805]' : 'text-gray-600'}`}>
          {message.length}/1000
        </span>
      </div>
    </div>
  );
};

export default MessageInput;
