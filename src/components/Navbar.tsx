'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/utils/avatar';
import { FiMessageCircle, FiSearch, FiSettings, FiLogOut, FiChevronLeft } from 'react-icons/fi';

interface NavbarProps {
  onLogout: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, showBackButton = false, onBack, backLabel = 'Back' }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between h-12 sm:h-auto max-w-full mx-auto">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Mobile Back Button */}
            {showBackButton && (
              <button
                onClick={handleBack}
                className="sm:hidden p-2 -ml-2 text-gray-400 hover:text-white active:text-[#F18805] transition-colors touch-manipulation"
                aria-label={backLabel}
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            {/* Logo */}
            <Link 
              href="/chat" 
              className="flex items-center space-x-2 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-[#F18805]/20">
                <FiMessageCircle className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-[#F18805] transition-colors ">
                Soro
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/chat"
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  pathname === '/chat'
                    ? 'bg-[#F18805]/20 text-[#F18805]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FiMessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </Link>
              <Link
                href="/discover"
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  pathname === '/discover'
                    ? 'bg-[#F18805]/20 text-[#F18805]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FiSearch className="w-4 h-4" />
                <span>Discover</span>
              </Link>
              <Link
                href="/settings"
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                  pathname === '/settings'
                    ? 'bg-[#F18805]/20 text-[#F18805]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FiSettings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Right side - User Avatar and Logout */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link 
              href="/settings" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity touch-manipulation group"
            >
              {user?.avatar && getAvatarUrl(user.avatar) ? (
                <img
                  src={getAvatarUrl(user.avatar)!}
                  alt={user.username}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#F18805] transition-colors"
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
                className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-full flex items-center justify-center ${
                  user?.avatar && getAvatarUrl(user.avatar) ? 'hidden' : ''
                }`}
              >
                <span className="text-black font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="">
                <p className="text-white font-medium text-sm">{user?.username}</p>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  <p className="text-gray-400 text-xs">
                    {user?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </Link>

            <button
              onClick={onLogout}
              className="hidden sm:flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all border border-gray-700 hover:border-gray-600"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 sm:hidden safe-area-bottom z-50">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/chat"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              pathname === '/chat'
                ? 'text-[#F18805]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${pathname === '/chat' ? 'bg-[#F18805]/20' : ''}`}>
              <FiMessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium mt-1">Chat</span>
          </Link>
          <Link
            href="/discover"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              pathname === '/discover'
                ? 'text-[#F18805]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${pathname === '/discover' ? 'bg-[#F18805]/20' : ''}`}>
              <FiSearch className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium mt-1">Discover</span>
          </Link>
          <Link
            href="/settings"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              pathname === '/settings'
                ? 'text-[#F18805]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${pathname === '/settings' ? 'bg-[#F18805]/20' : ''}`}>
              <FiSettings className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
