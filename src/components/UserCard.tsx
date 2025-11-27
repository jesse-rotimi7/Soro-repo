'use client';

import React from 'react';
import { getAvatarUrl } from '@/utils/avatar';

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
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-[#F18805] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {user.avatar && getAvatarUrl(user.avatar) ? (
            <img
              src={getAvatarUrl(user.avatar)!}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover border border-gray-700"
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
            className={`w-12 h-12 bg-[#F18805] rounded-full flex items-center justify-center ${
              user.avatar && getAvatarUrl(user.avatar) ? 'hidden' : ''
            }`}
          >
            <span className="text-black font-semibold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold truncate">{user.username}</h3>
            {user.isOnline && (
              <span className="text-xs text-green-400 font-medium ml-2">Online</span>
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
          className="bg-[#F18805] hover:bg-[#F18805]/90 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default UserCard;


