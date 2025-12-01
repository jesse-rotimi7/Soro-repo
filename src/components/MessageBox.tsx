'use client';

import React, { useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl } from '@/utils/avatar';
import { FiMessageCircle } from 'react-icons/fi';

interface MessageBoxProps {
  currentRoom: any;
}

const MessageBox: React.FC<MessageBoxProps> = ({ currentRoom }) => {
  const { messages, typingUsers, loadMessages } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastLoadedRoomRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentRoom && currentRoom._id) {
      const roomId = currentRoom._id.toString();
      if (lastLoadedRoomRef.current !== roomId) {
        lastLoadedRoomRef.current = roomId;
        loadMessages(roomId);
      }
    } else {
      lastLoadedRoomRef.current = null;
    }
  }, [currentRoom?._id]);

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
      <div className="flex-1 flex items-center justify-center bg-gray-950/50">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F18805]/20 to-[#FF9500]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiMessageCircle className="w-10 h-10 text-[#F18805]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Welcome to Soro</h3>
          <p className="text-gray-400">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950/30 min-h-0 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 p-3 sm:p-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          {(() => {
            const otherParticipant = currentRoom.participants?.find((p: any) => p._id !== user?.id);
            const participantAvatar = !currentRoom.isGroup && otherParticipant?.avatar ? getAvatarUrl(otherParticipant.avatar) : null;
            const displayName = currentRoom.isGroup 
                ? currentRoom.name.charAt(0).toUpperCase()
              : otherParticipant?.username?.charAt(0).toUpperCase();
            
            return (
              <>
                {participantAvatar ? (
                  <img
                    src={participantAvatar}
                    alt={currentRoom.isGroup ? currentRoom.name : otherParticipant?.username}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gray-700"
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
                  className={`w-11 h-11 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-full flex items-center justify-center shadow-lg shadow-[#F18805]/10 ${
                    participantAvatar ? 'hidden' : ''
                  }`}
                >
                  <span className="text-black font-semibold">
                    {displayName}
                  </span>
                </div>
              </>
            );
          })()}
          <div>
            <h3 className="text-white font-semibold">
              {currentRoom.isGroup 
                ? currentRoom.name
                : currentRoom.participants.find((p: any) => p._id !== user?.id)?.username
              }
            </h3>
            <div className="flex items-center space-x-1.5">
              {!currentRoom.isGroup && (
                <span className={`w-2 h-2 rounded-full ${
                  currentRoom.participants.find((p: any) => p._id !== user?.id)?.isOnline 
                    ? 'bg-green-500' 
                    : 'bg-gray-500'
                }`}></span>
              )}
              <p className="text-sm text-gray-400">
                {currentRoom.isGroup 
                  ? `${currentRoom.participants.length} members`
                  : currentRoom.participants.find((p: any) => p._id !== user?.id)?.isOnline ? 'Online' : 'Offline'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {(() => {
          const currentRoomId = currentRoom._id?.toString();
          const roomMessages = messages.filter(msg => {
            const msgRoomId = msg.chatRoom?.toString();
            return msgRoomId === currentRoomId;
          });
          
          if (roomMessages.length === 0) {
            return (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageCircle className="w-7 h-7 text-gray-500" />
                </div>
                <p className="text-gray-400">No messages yet</p>
                <p className="text-gray-500 text-sm mt-1">Start the conversation!</p>
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
                <div className={`flex items-end space-x-2 max-w-[85%] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <>
                      {message.sender.avatar && getAvatarUrl(message.sender.avatar) ? (
                        <img
                          src={getAvatarUrl(message.sender.avatar)!}
                          alt={message.sender.username}
                          className="w-8 h-8 rounded-full object-cover border border-gray-700 flex-shrink-0"
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
                        className={`w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender.avatar && getAvatarUrl(message.sender.avatar) ? 'hidden' : ''
                        }`}
                      >
                        <span className="text-white text-xs font-semibold">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                    isOwnMessage 
                      ? 'bg-[#F18805] text-white shadow-[#F18805]/30' 
                      : 'bg-gray-800/90 backdrop-blur-sm text-white border border-gray-700/50'
                  } ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold mb-1.5 text-[#F18805]">
                        {message.sender.username}
                      </p>
                    )}
                    <p className={`text-sm leading-relaxed break-words ${isOwnMessage ? 'font-medium' : ''}`}>{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-white/70' : 'text-gray-500'
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
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">...</span>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-700/50">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-[#F18805] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#F18805] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#F18805] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
