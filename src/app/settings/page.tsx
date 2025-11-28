'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/utils/avatar';
import Navbar from '@/components/Navbar';

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
    // Always update avatar preview from user.avatar (clears preview if no avatar)
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setAvatar(file);
      setError('');
      
      // Create preview
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
      // Clear preview - it will be updated from user.avatar via useEffect
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
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar onLogout={handleLogout} />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your profile and account</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Avatar Section */}
          <div className="mb-8 pb-8 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {(avatarPreview || (user.avatar && getAvatarUrl(user.avatar))) ? (
                  <img
                    src={avatarPreview || getAvatarUrl(user.avatar)!}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#F18805]"
                    onError={(e) => {
                      // If image fails to load, hide img and show placeholder
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
                  className={`w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center ${
                    (avatarPreview || (user.avatar && getAvatarUrl(user.avatar))) ? 'hidden' : ''
                  }`}
                >
                  <span className="text-2xl text-gray-400">{user.username[0]?.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-3">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {avatar ? 'Change Image' : 'Upload Image'}
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
                      className="bg-[#F18805] hover:bg-[#F18805]/90 text-black font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Avatar
                    </button>
                  )}
                  {user.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  JPG, PNG, GIF or WEBP. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <form onSubmit={handleUpdateProfile} className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F18805] focus:ring-1 focus:ring-[#F18805] transition-colors"
                placeholder="Username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F18805] focus:ring-1 focus:ring-[#F18805] transition-colors"
                placeholder="Email"
              />
            </div>

            <button
              type="submit"
              disabled={loading || (username === user.username && email === user.email)}
              className="w-full bg-[#F18805] hover:bg-[#F18805]/90 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Logout Section */}
          <div className="pt-8 border-t border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Account Actions</h2>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

