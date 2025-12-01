'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/utils/avatar';

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
    <div className="w-full sm:w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 flex flex-col h-full overflow-hidden min-w-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <Link
            href="/discover"
            className="bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold px-4 py-2 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-[#F18805]/20 hover:shadow-[#F18805]/30 hover:scale-105 active:scale-95"
          >
            <FiPlus className="w-5 h-5" />
            <span className="hidden sm:inline">New</span>
          </Link>
        </div>
        
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F18805] focus:ring-2 focus:ring-[#F18805]/20 transition-all text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiSearch className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {!searchTerm && 'Start a new chat to begin messaging'}
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const otherParticipant = room.participants.find(p => p._id !== user?.id);
            const displayName = room.isGroup ? room.name : otherParticipant?.username || 'Unknown';
            const isOnline = otherParticipant ? onlineUsers.has(otherParticipant._id) : false;
            
            const isSelected = selectedRoomId === room._id;
            const showAvatar = !room.isGroup && otherParticipant?.avatar && getAvatarUrl(otherParticipant.avatar);
            
            return (
              <div
                key={room._id}
                onClick={() => onRoomSelect(room)}
                className={`p-4 cursor-pointer transition-all touch-manipulation ${
                  isSelected 
                    ? 'bg-[#F18805]/10 border-l-4 border-l-[#F18805]' 
                    : 'hover:bg-gray-800/50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    {showAvatar ? (
                      <img
                        src={getAvatarUrl(otherParticipant!.avatar)!}
                        alt={displayName}
                        className={`w-12 h-12 rounded-full object-cover border-2 transition-colors ${
                          isSelected ? 'border-[#F18805]' : 'border-gray-700'
                        }`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-12 h-12 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-full flex items-center justify-center ${
                        showAvatar ? 'hidden' : ''
                      }`}
                    >
                      <span className="text-black font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${isSelected ? 'text-[#F18805]' : 'text-white'}`}>
                        {displayName}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 truncate mt-0.5">
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
