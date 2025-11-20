'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Navbar from '@/components/Navbar';
import ChatList from '@/components/ChatList';
import MessageBox from '@/components/MessageBox';
import MessageInput from '@/components/MessageInput';

export default function ChatPage() {
  const { user, logout, loading } = useAuth();
  const { setCurrentRoom, loadMessages, currentRoom } = useSocket();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // setCurrentRoom now handles everything: clearing messages, joining socket room, and loading messages
    setCurrentRoom(selectedRoom);
  }, [selectedRoom, setCurrentRoom]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F18805] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar onLogout={handleLogout} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List - Hidden on mobile, shown on larger screens */}
        <div className="hidden sm:block">
          <ChatList 
            onRoomSelect={handleRoomSelect} 
            selectedRoomId={currentRoom?._id || null}
          />
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <MessageBox currentRoom={currentRoom} />
          <MessageInput currentRoom={currentRoom} />
        </div>
      </div>

      {/* Mobile Chat List Overlay */}
      {!currentRoom && (
        <div className="sm:hidden">
          <ChatList 
            onRoomSelect={handleRoomSelect}
            selectedRoomId={null}
          />
        </div>
      )}
    </div>
  );
}