'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import UserCard from '@/components/UserCard';
import UserProfileModal from '@/components/UserProfileModal';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: string;
}

const DiscoverPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<{ user: User; hasExistingChat: boolean } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [filterOnline, setFilterOnline] = useState(false);

  const { user, logout, token } = useAuth();
  const { createDirectMessage, loadChatRooms } = useSocket();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && token) {
      fetchUsers();
    }
  }, [user, token, searchQuery, filterOnline]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (filterOnline) {
        params.append('online', 'true');
      }
      // Optionally exclude users you already chat with
      // Set to false to show all users, true to hide users you already chat with
      // params.append('excludeExistingChats', 'true');

      const url = `${API_BASE_URL}/chat/users?${params.toString()}`;
      console.log('Fetching users from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Users data:', data);
        console.log('Number of users:', data.users?.length || 0);
        setUsers(data.users || []);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to fetch users:', response.status, errorData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: User) => {
    setIsLoadingProfile(true);
    setSelectedUser(user);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/users/${user._id}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          user: data.user,
          hasExistingChat: data.hasExistingChat,
        });
      } else {
        console.error('Failed to fetch user profile');
        setProfileData({
          user,
          hasExistingChat: false,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfileData({
        user,
        hasExistingChat: false,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleStartChat = async () => {
    if (!selectedUser || !profileData) return;

    setIsCreatingChat(true);
    try {
      const room = await createDirectMessage(selectedUser._id);

      if (room) {
        // Reload chat rooms to ensure it's in the list
        await loadChatRooms();
        
        // Navigate to chat page
        router.push('/chat');
        
        // Close modal
        setSelectedUser(null);
        setProfileData(null);
      } else {
        console.error('Failed to create direct message');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar onLogout={handleLogout} />

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Discover Users</h1>
            <p className="text-gray-400">Find and start conversations with other users</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <SearchBar
              onSearch={(query) => setSearchQuery(query)}
              placeholder="Search by username or email..."
            />
            
            {/* Filter Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="online-only"
                checked={filterOnline}
                onChange={(e) => setFilterOnline(e.target.checked)}
                className="w-4 h-4 text-[#F18805] bg-gray-800 border-gray-700 rounded focus:ring-[#F18805]"
              />
              <label htmlFor="online-only" className="text-gray-300 cursor-pointer">
                Show online users only
              </label>
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#F18805] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                <p className="text-gray-400">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'There are no other users to discover'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    onClick={() => handleUserClick(user)}
                    onStartChat={async () => {
                      setIsCreatingChat(true);
                      const room = await createDirectMessage(user._id);
                      if (room) {
                        await loadChatRooms();
                        router.push('/chat');
                      }
                      setIsCreatingChat(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && profileData && (
        <UserProfileModal
          user={profileData.user}
          hasExistingChat={profileData.hasExistingChat}
          onClose={() => {
            setSelectedUser(null);
            setProfileData(null);
          }}
          onStartChat={handleStartChat}
          isLoading={isCreatingChat}
        />
      )}
    </div>
  );
};

export default DiscoverPage;
