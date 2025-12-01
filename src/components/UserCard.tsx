'use client';

import React from 'react';
import { getAvatarUrl } from '@/utils/avatar';
import { FiMessageCircle } from 'react-icons/fi';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: string;
}

interface UserCardProps {
  user: User;
  onClick: () => void;
  onStartChat: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick, onStartChat }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-[#F18805]/50 hover:bg-gray-900/90 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar && getAvatarUrl(user.avatar) ? (
            <img
              src={getAvatarUrl(user.avatar)!}
              alt={user.username}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#F18805] transition-colors"
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
            className={`w-14 h-14 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-full flex items-center justify-center shadow-lg shadow-[#F18805]/10 ${
              user.avatar && getAvatarUrl(user.avatar) ? 'hidden' : ''
            }`}
          >
            <span className="text-black font-bold text-xl">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          {user.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-semibold truncate group-hover:text-[#F18805] transition-colors">{user.username}</h3>
            {user.isOnline && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Online</span>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">{user.email}</p>
          {!user.isOnline && user.lastSeen && (
            <p className="text-xs text-gray-500 mt-1">
              Last seen {formatDate(user.lastSeen)}
            </p>
          )}
        </div>

        {/* Start Chat Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartChat();
          }}
          className="bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold px-4 py-2.5 rounded-xl transition-all flex-shrink-0 min-h-[44px] touch-manipulation shadow-lg shadow-[#F18805]/20 hover:shadow-[#F18805]/30 hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <FiMessageCircle className="w-4 h-4" />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;
