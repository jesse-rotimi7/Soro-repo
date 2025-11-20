'use client';

import React from 'react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-[#F18805] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-3xl">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full"></div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Username</label>
              <p className="text-white font-semibold text-lg">{user.username}</p>
            </div>

            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-white">{user.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-400">Status</label>
              <p className="text-white">
                {user.isOnline ? (
                  <span className="text-green-400 font-medium">Online</span>
                ) : (
                  <span className="text-gray-400">
                    Offline{user.lastSeen && ` - Last seen ${formatDate(user.lastSeen)}`}
                  </span>
                )}
              </p>
            </div>

            {user.createdAt && (
              <div>
                <label className="text-sm text-gray-400">Member Since</label>
                <p className="text-white">{formatDate(user.createdAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={onStartChat}
            disabled={isLoading}
            className="flex-1 bg-[#F18805] hover:bg-[#F18805]/90 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : hasExistingChat ? 'Open Chat' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
