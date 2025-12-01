'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import Navbar from '@/components/Navbar';
import ChatList from '@/components/ChatList';
import MessageBox from '@/components/MessageBox';
import MessageInput from '@/components/MessageInput';
import { FiMessageCircle } from 'react-icons/fi';

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

  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId) {
      if (currentRoom && (currentRoom._id === roomId || currentRoom._id?.toString() === roomId)) {
        router.replace('/chat');
        return;
      }

      if (chatRooms.length > 0) {
        const room = chatRooms.find((r: any) => r._id === roomId || r._id?.toString() === roomId);
        if (room) {
          setCurrentRoom(room);
          setSelectedRoom(room);
          router.replace('/chat');
          return;
        }
      }

      if (currentRoom) {
        router.replace('/chat');
      }
    }
  }, [searchParams, chatRooms, currentRoom, setCurrentRoom, router]);

  useEffect(() => {
    if (user && chatRooms.length === 0) {
      loadChatRooms();
    }
  }, [user, chatRooms.length, loadChatRooms]);

  useEffect(() => {
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
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col pb-16 sm:pb-0 overflow-hidden relative">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F18805]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-[#F18805]/3 rounded-full blur-3xl" />
      </div>

      <Navbar 
        onLogout={handleLogout} 
        showBackButton={!!currentRoom}
        onBack={() => setSelectedRoom(null)}
        backLabel="Chats"
      />
      
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        {/* Chat List */}
        <div className={`${currentRoom ? 'hidden' : 'flex'} sm:flex sm:block min-w-0`}>
          <ChatList 
            onRoomSelect={handleRoomSelect} 
            selectedRoomId={currentRoom?._id || null}
          />
        </div>
        
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${currentRoom ? 'flex' : 'hidden sm:flex'}`}>
          {currentRoom ? (
            <>
              <MessageBox currentRoom={currentRoom} />
              <MessageInput currentRoom={currentRoom} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-950/50">
              <div className="text-center max-w-sm px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#F18805]/20 to-[#FF9500]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiMessageCircle className="w-10 h-10 text-[#F18805]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Soro</h2>
                <p className="text-gray-400 mb-6">
                  Select a conversation from the sidebar or start a new chat to begin messaging.
                </p>
                <a
                  href="/discover"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#F18805]/20 hover:shadow-[#F18805]/30 hover:scale-105"
                >
                  <span>Start New Chat</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F18805] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
