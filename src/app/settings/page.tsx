'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/utils/avatar';
import Navbar from '@/components/Navbar';
import { FiUser, FiMail, FiCamera, FiLogOut, FiTrash2, FiSave } from 'react-icons/fi';

export default function SettingsPage() {
  const { user, token, updateProfile, updateAvatar, removeAvatar, logout } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    setUsername(user.username);
    setEmail(user.email);
    if (user.avatar) {
      const avatarUrl = getAvatarUrl(user.avatar);
      if (avatarUrl) {
        setAvatarPreview(avatarUrl);
      } else {
        setAvatarPreview('');
      }
    } else {
      setAvatarPreview('');
    }
  }, [user, token, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setAvatar(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const success = await removeAvatar();
    if (success) {
      setAvatar(null);
      setAvatarPreview('');
      setSuccess('Avatar removed successfully');
    } else {
      setError('Failed to remove avatar');
    }
    setLoading(false);
  };

  const handleUpdateAvatar = async () => {
    if (!avatar) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const success = await updateAvatar(avatar);
    if (success) {
      setSuccess('Avatar updated successfully');
      setAvatar(null);
      setAvatarPreview('');
    } else {
      setError('Failed to update avatar');
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const success = await updateProfile(
      username !== user?.username ? username : undefined,
      email !== user?.email ? email : undefined
    );

    if (success) {
      setSuccess('Profile updated successfully');
    } else {
      setError('Failed to update profile. Username or email may already be taken.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col pb-16 sm:pb-0 overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#F18805]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#F18805]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Navbar onLogout={handleLogout} />
      
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your profile and account preferences</p>
          </div>

          {/* Main Card */}
          <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
            {/* Alerts */}
            {error && (
              <div className="mx-6 mt-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mx-6 mt-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Avatar Section */}
            <div className="p-6 sm:p-8 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <FiCamera className="w-5 h-5 text-[#F18805]" />
                <span>Profile Picture</span>
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  {(avatarPreview || (user.avatar && getAvatarUrl(user.avatar))) ? (
                    <img
                      src={avatarPreview || getAvatarUrl(user.avatar)!}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-3 border-[#F18805] shadow-lg shadow-[#F18805]/20"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = 'none';
                        const placeholder = img.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#F18805] to-[#FF9500] flex items-center justify-center shadow-lg shadow-[#F18805]/20 ${
                      (avatarPreview || (user.avatar && getAvatarUrl(user.avatar))) ? 'hidden' : ''
                    }`}
                  >
                    <span className="text-3xl font-bold text-black">{user.username[0]?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex-1 w-full sm:w-auto space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl transition-all border border-gray-700 hover:border-gray-600"
                    >
                      <FiCamera className="w-4 h-4" />
                      <span>{avatar ? 'Change' : 'Upload'}</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    
                    {avatar && (
                      <button
                        onClick={handleUpdateAvatar}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-[#F18805]/25"
                      >
                        <FiSave className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    )}
                    
                    {user.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2.5 rounded-xl transition-all border border-red-500/30 hover:border-red-500/50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG, GIF or WEBP. Max size 5MB</p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <FiUser className="w-5 h-5 text-[#F18805]" />
                <span>Profile Information</span>
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F18805] focus:ring-2 focus:ring-[#F18805]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F18805] focus:ring-2 focus:ring-[#F18805]/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || (username === user.username && email === user.email)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#F18805]/25"
                >
                  <FiSave className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>

            {/* Account Actions */}
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                <FiLogOut className="w-5 h-5 text-red-400" />
                <span>Account Actions</span>
              </h2>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-3 px-6 rounded-xl transition-all border border-red-500/30 hover:border-red-500/50"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
