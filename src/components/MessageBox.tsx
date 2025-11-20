'use client';

import React, { useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

interface MessageBoxProps {
  currentRoom: any;
}

const MessageBox: React.FC<MessageBoxProps> = ({ currentRoom }) => {
  const { messages, typingUsers, loadMessages } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastLoadedRoomRef = useRef<string | null>(null);

  // Load messages when currentRoom changes
  useEffect(() => {
    if (currentRoom && currentRoom._id) {
      const roomId = currentRoom._id.toString();
      // Only load if this is a different room than last loaded
      if (lastLoadedRoomRef.current !== roomId) {
        console.log('MessageBox: Loading messages for room:', roomId);
        lastLoadedRoomRef.current = roomId;
        // Clear the ref after a delay to allow reloading if needed
        loadMessages(roomId);
      } else {
        console.log('MessageBox: Already loaded messages for room:', roomId);
      }
    } else {
      lastLoadedRoomRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom?._id]); // Only depend on room ID

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isTyping = typingUsers.size > 0;

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Welcome to Soro</h3>
          <p className="text-gray-400">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Chat Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#F18805] rounded-full flex items-center justify-center">
            <span className="text-black font-semibold">
              {currentRoom.isGroup 
                ? currentRoom.name.charAt(0).toUpperCase()
                : currentRoom.participants.find((p: any) => p._id !== user?.id)?.username.charAt(0).toUpperCase()
              }
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {currentRoom.isGroup 
                ? currentRoom.name
                : currentRoom.participants.find((p: any) => p._id !== user?.id)?.username
              }
            </h3>
            <p className="text-sm text-gray-400">
              {currentRoom.isGroup 
                ? `${currentRoom.participants.length} members`
                : currentRoom.participants.find((p: any) => p._id !== user?.id)?.isOnline ? 'Online' : 'Offline'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(() => {
          // Filter messages for current room (handle both string and ObjectId formats)
          const currentRoomId = currentRoom._id?.toString();
          const roomMessages = messages.filter(msg => {
            const msgRoomId = msg.chatRoom?.toString();
            return msgRoomId === currentRoomId;
          });
          
          console.log('MessageBox: Current room ID:', currentRoomId);
          console.log('MessageBox: Total messages:', messages.length);
          console.log('MessageBox: Filtered messages for this room:', roomMessages.length);
          
          if (roomMessages.length === 0) {
            return (
              <div className="text-center text-gray-400 mt-8">
                <p>No messages yet. Start the conversation!</p>
                <p className="text-xs text-gray-500 mt-2">Room ID: {currentRoomId}</p>
              </div>
            );
          }
          
          return roomMessages.map((message) => {
            const isOwnMessage = message.sender._id === user?.id;
            
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {message.sender.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className={`px-4 py-2 rounded-lg ${
                    isOwnMessage 
                      ? 'bg-[#F18805] text-black' 
                      : 'bg-gray-700 text-white'
                  }`}>
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {message.sender.username}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-black/70' : 'text-gray-400'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          });
        })()}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">...</span>
              </div>
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageBox;



