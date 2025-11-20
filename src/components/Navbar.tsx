'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/chat" className="text-xl font-bold text-white hover:text-[#F18805] transition-colors">
            Soro
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/chat"
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/chat'
                  ? 'bg-gray-800 text-[#F18805]'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Chat
            </Link>
            <Link
              href="/discover"
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/discover'
                  ? 'bg-gray-800 text-[#F18805]'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Discover
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#F18805] rounded-full flex items-center justify-center">
              <span className="text-black font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-gray-400 text-xs">
                {user?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



