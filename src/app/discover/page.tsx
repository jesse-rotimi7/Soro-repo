'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import UserCard from '@/components/UserCard';
import UserProfileModal from '@/components/UserProfileModal';
import { FiUsers, FiSearch } from 'react-icons/fi';

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
  const { createDirectMessage, loadChatRooms, setCurrentRoom } = useSocket();
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

  useEffect(() => {
    if (user && user.id) {
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === user.id 
            ? { ...u, avatar: user.avatar || '' } 
            : u
        )
      );
    }
  }, [user?.avatar, user?.id]);

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

      const url = `${API_BASE_URL}/chat/users?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
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
        setCurrentRoom(room);
        router.push(`/chat?room=${room._id}`);
        loadChatRooms().catch(console.error);
        setSelectedUser(null);
        setProfileData(null);
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
    <div className="min-h-screen bg-black flex flex-col pb-16 sm:pb-0 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#F18805]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#F18805]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Navbar onLogout={handleLogout} />

      <div className="flex-1 overflow-hidden relative z-10">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F18805]/20 to-[#FF9500]/10 rounded-xl flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-[#F18805]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Discover</h1>
            </div>
            <p className="text-gray-400 ml-13">Find and connect with other users</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <SearchBar
                onSearch={(query) => setSearchQuery(query)}
                placeholder="Search by username or email..."
              />
            </div>
            
            {/* Filter Toggle */}
            <label className="inline-flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filterOnline}
                  onChange={(e) => setFilterOnline(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#F18805] transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">Show online users only</span>
            </label>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-[#F18805] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                  <FiSearch className="w-8 h-8 text-gray-500" />
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
                      try {
                        const room = await createDirectMessage(user._id);
                        if (room) {
                          setCurrentRoom(room);
                          router.push(`/chat?room=${room._id}`);
                          loadChatRooms().catch(console.error);
                        }
                      } catch (error) {
                        console.error('Error creating chat:', error);
                      } finally {
                        setIsCreatingChat(false);
                      }
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
