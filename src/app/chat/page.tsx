'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Navbar from '@/components/Navbar';
import ChatList from '@/components/ChatList';
import MessageBox from '@/components/MessageBox';
import MessageInput from '@/components/MessageInput';

function ChatContent() {
  const { user, logout, loading } = useAuth();
  const { setCurrentRoom, loadMessages, currentRoom, chatRooms, loadChatRooms } = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Handle room query parameter (when navigating from discover page)
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId) {
      // Check if currentRoom is already set and matches (from context)
      if (currentRoom && (currentRoom._id === roomId || currentRoom._id?.toString() === roomId)) {
        // Room is already set, just remove query parameter
        router.replace('/chat');
        return;
      }

      // Try to find room in existing chatRooms first (fast path)
      if (chatRooms.length > 0) {
        const room = chatRooms.find((r: any) => r._id === roomId || r._id?.toString() === roomId);
        if (room) {
          setCurrentRoom(room);
          setSelectedRoom(room);
          router.replace('/chat');
          return;
        }
      }

      // If room not found and currentRoom is set from context, use it
      // (This handles the case where room was just created and set in context)
      if (currentRoom) {
        router.replace('/chat');
      }
    }
  }, [searchParams, chatRooms, currentRoom, setCurrentRoom, router]);

  // Load chat rooms on mount if not loaded
  useEffect(() => {
    if (user && chatRooms.length === 0) {
      loadChatRooms();
    }
  }, [user, chatRooms.length, loadChatRooms]);

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

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F18805] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}