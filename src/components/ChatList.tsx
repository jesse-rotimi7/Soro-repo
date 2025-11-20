'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

interface ChatListProps {
  onRoomSelect: (room: any) => void;
  selectedRoomId?: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ onRoomSelect, selectedRoomId }) => {
  const { chatRooms, loadChatRooms, onlineUsers } = useSocket();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.participants.some(p => 
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      p._id !== user?.id
    )
  );

  const formatLastMessage = (message: any) => {
    if (!message) return 'No messages yet';
    const isOwnMessage = message.sender._id === user?.id;
    const prefix = isOwnMessage ? 'You: ' : '';
    return prefix + message.content;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-full sm:w-80 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Chats</h2>
          <Link
            href="/discover"
            className="bg-[#F18805] hover:bg-[#F18805]/90 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Chat</span>
          </Link>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F18805] focus:ring-1 focus:ring-[#F18805] transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {searchTerm ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredRooms.map((room) => {
            const otherParticipant = room.participants.find(p => p._id !== user?.id);
            const displayName = room.isGroup ? room.name : otherParticipant?.username || 'Unknown';
            const isOnline = otherParticipant ? onlineUsers.has(otherParticipant._id) : false;
            
            const isSelected = selectedRoomId === room._id;
            
            return (
              <div
                key={room._id}
                onClick={() => onRoomSelect(room)}
                className={`p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 transition-colors ${
                  isSelected ? 'bg-gray-800 border-l-4 border-l-[#F18805]' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#F18805] rounded-full flex items-center justify-center">
                      <span className="text-black font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">
                        {displayName}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatTime(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {formatLastMessage(room.lastMessage)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;



