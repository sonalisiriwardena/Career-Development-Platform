import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import type { Message } from '../api/messages';

function getOtherUser(message: Message, userId: string) {
  if (message.senderId === userId) return message.receiver;
  return message.sender;
}

function getInitials(user?: { firstName: string; lastName: string }) {
  if (!user) return '?';
  return (
    (user.firstName?.[0] || '') + (user.lastName?.[0] || '')
  ).toUpperCase();
}

export default function Messages() {
  const { user } = useAuthStore();
  const {
    conversations,
    currentConversation,
    isLoading: loading,
    error,
    fetchConversations,
    fetchMessagesByUser,
    sendMessage,
  } = useMessageStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Demo conversation state
  const demoUser = {
    _id: 'demo-user',
    firstName: 'Demo',
    lastName: 'Bot',
    email: 'demo@bot.com',
  };
  const [demoConversation, setDemoConversation] = useState([
    {
      _id: 'demo-msg-1',
      content: 'Hi there! 👋 It is great to connect with you !! Looking foward to staying in touch !',
      senderId: 'demo-user',
      receiverId: user?._id || 'me',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      sender: demoUser,
      receiver: user ? {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      } : demoUser,
    },
    {
      _id: 'demo-msg-2',
      content: 'Test msg----------.',
      senderId: 'demo-user',
      receiverId: user?._id || 'me',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      sender: demoUser,
      receiver: user ? {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      } : demoUser,
    },
  ]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newMessage.trim()) return;
    try {
      await sendMessage({
        receiverId: selectedUserId,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      // Optionally show error toast
      console.error('Error sending message:', error);
    }
  };

  const handleSelectConversation = (otherUserId: string) => {
    setSelectedUserId(otherUserId);
    fetchMessagesByUser(otherUserId);
  };

  // Demo send message handler
  const handleSendDemoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const newMsg = {
      _id: `demo-msg-${Date.now()}`,
      content: newMessage.trim(),
      senderId: user?._id || 'me',
      receiverId: demoUser._id,
      read: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: user ? {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      } : demoUser,
      receiver: demoUser,
    };
    setDemoConversation((prev) => [...prev, newMsg]);
    setNewMessage('');
    setTimeout(() => {
      // Demo bot reply
      setDemoConversation((prev) => [
        ...prev,
        {
          _id: `demo-msg-bot-${Date.now()}`,
          content: ' Hi there! 👋 It is great to connect with you !',
          senderId: demoUser._id,
          receiverId: user?._id || 'me',
          read: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sender: demoUser,
          receiver: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          } : demoUser,
        },
      ]);
    }, 1000);
  };

  if (loading && !conversations.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please sign in to view your messages
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-4 gap-6">
      {/* Conversations List */}
      <div className="col-span-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
          {conversations.length === 0 && (
            <button
              className={`w-full flex items-center gap-3 p-4 text-left bg-blue-50`}
              onClick={() => setSelectedUserId('demo-user')}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                {getInitials(demoUser)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {demoUser.firstName} {demoUser.lastName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  Hi there! 👋 This is a demo chat. Feel free to send a message!
                </div>
              </div>
              <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                {new Date(demoConversation[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          )}
          {conversations.map((conv, idx) => {
            if (!conv.length) return null;
            const lastMessage = conv[conv.length - 1];
            const otherUser = getOtherUser(lastMessage, user._id);
            if (!otherUser) return null;
            return (
              <button
                key={otherUser._id}
                onClick={() => handleSelectConversation(otherUser._id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedUserId === otherUser._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                  {getInitials(otherUser)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {otherUser.firstName} {otherUser.lastName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {lastMessage.content || 'No messages'}
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="col-span-3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        {/* Demo Chat */}
        {selectedUserId === 'demo-user' && (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                {getInitials(demoUser)}
              </div>
              <div className="font-semibold">
                {demoUser.firstName} {demoUser.lastName}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {demoConversation.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                      message.senderId === user?._id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70 text-right">
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendDemoMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
        {selectedUserId !== 'demo-user' && selectedUserId && currentConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              {(() => {
                const firstMsg = currentConversation[0];
                const otherUser = getOtherUser(firstMsg, user._id);
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                      {getInitials(otherUser)}
                    </div>
                    <div className="font-semibold">
                      {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
                    </div>
                  </>
                );
              })()}
            </div>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {currentConversation.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">No messages yet. Start the conversation!</div>
              ) : (
                currentConversation.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                        message.senderId === user._id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border rounded-bl-none'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : null}
        {selectedUserId !== 'demo-user' && !selectedUserId && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Select a conversation to start messaging
          </div>
        )}
        {error && (
          <div className="p-2 text-red-500 text-center border-t bg-red-50">{error}</div>
        )}
      </div>
    </div>
  );
}