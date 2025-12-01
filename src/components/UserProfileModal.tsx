'use client';

import React from 'react';
import { FiX, FiMail, FiCalendar, FiMessageCircle } from 'react-icons/fi';
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

interface UserProfileModalProps {
  user: User | null;
  hasExistingChat: boolean;
  onClose: () => void;
  onStartChat: () => void;
  isLoading?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  hasExistingChat,
  onClose,
  onStartChat,
  isLoading = false
}) => {
  if (!user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative h-24 bg-gradient-to-br from-[#F18805] to-[#FF9500]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar overlapping header */}
        <div className="flex justify-center -mt-12">
          <div className="relative">
            {user.avatar && getAvatarUrl(user.avatar) ? (
              <img
                src={getAvatarUrl(user.avatar)!}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-900 shadow-xl"
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
              className={`w-24 h-24 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-full flex items-center justify-center border-4 border-gray-900 shadow-xl ${
                user.avatar && getAvatarUrl(user.avatar) ? 'hidden' : ''
              }`}
            >
              <span className="text-black font-bold text-3xl">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          {/* Username and status */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
            <div className="flex items-center justify-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span className={user.isOnline ? 'text-green-400' : 'text-gray-400'}>
                {user.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* User Info Cards */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="w-10 h-10 bg-[#F18805]/20 rounded-lg flex items-center justify-center">
                <FiMail className="w-5 h-5 text-[#F18805]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white text-sm">{user.email}</p>
              </div>
            </div>

            {!user.isOnline && user.lastSeen && (
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Last Seen</p>
                  <p className="text-white text-sm">{formatDate(user.lastSeen)}</p>
                </div>
              </div>
            )}

            {user.createdAt && (
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="w-10 h-10 bg-[#F18805]/20 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-[#F18805]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-white text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800/80 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-gray-700 hover:border-gray-600"
          >
            Close
          </button>
          <button
            onClick={onStartChat}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F18805]/20 hover:shadow-[#F18805]/30 flex items-center justify-center space-x-2"
          >
            <FiMessageCircle className="w-4 h-4" />
            <span>{isLoading ? 'Loading...' : hasExistingChat ? 'Open Chat' : 'Start Chat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
