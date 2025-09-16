import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/authcontext';
import { useSocket } from '../contexts/socketContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiSend, FiUser, FiUsers, FiMessageCircle, FiSearch, FiUserCheck } from 'react-icons/fi';
import { FaUserTie, FaUserCog, FaUserFriends, FaIndustry } from 'react-icons/fa';
import UserSelector from './UserSelector';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4323';

// Role-based icons and colors for consistent display
const roleConfig = {
  admin: { icon: <FaUserTie size={16} />, color: 'bg-purple-100 text-purple-800' },
  manager: { icon: <FaUserCog size={16} />, color: 'bg-blue-100 text-blue-800' },
  staff: { icon: <FaUserFriends size={16} />, color: 'bg-green-100 text-green-800' },
  supplier: { icon: <FaIndustry size={16} />, color: 'bg-yellow-100 text-yellow-800' },
  default: { icon: <FiUserCheck size={16} />, color: 'bg-gray-100 text-gray-800' }
};

const Chat = () => {
  const { user, token } = useAuth();
  const { socket: contextSocket, connected } = useSocket();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState({});
  const [userDetails, setUserDetails] = useState({});
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Use the socket from context instead of creating a new one
  useEffect(() => {
    if (contextSocket && connected) {
      setSocket(contextSocket);
      console.log('Using socket from context');
    }
  }, [contextSocket, connected]);
  
  // Fallback to direct socket connection if context socket is not available
  useEffect(() => {
    if (!token || !user || (contextSocket && connected)) return;
    
    console.log('Creating direct socket connection (fallback)');
    const newSocket = io(API_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);
    
    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server (direct)');
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error. Please refresh the page.');
    });
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token, user, contextSocket, connected]);
  
  // Set up event listeners after socket is initialized
  useEffect(() => {
    if (!socket || !user) return;
    
    // Listen for new messages
    socket.on('newMessage', (message) => {
      // Add the new message if it's from the current selected conversation
      if (selectedUser && (message.senderId === selectedUser.id)) {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // Mark as read automatically when viewing the conversation
        socket.emit('markMessageRead', { messageId: message.id });
      }
      
      // Update unread count for the sender
      setUnreadCount(prev => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] || 0) + 1
      }));
      
      // Update conversations list
      updateConversationWithMessage(message);
    });
    
    // Listen for message read receipts
    socket.on('messageRead', ({ messageId }) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    });
    
    // Listen for typing indicators
    socket.on('userTyping', ({ userId, isTyping }) => {
      if (selectedUser && userId === selectedUser.id) {
        setIsTyping(isTyping);
      }
      
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping
      }));
    });
    
    // Listen for user status changes
    socket.on('userStatus', ({ userId, status }) => {
      setOnlineUsers(prev => {
        if (status === 'online' && !prev.includes(userId)) {
          return [...prev, userId];
        } else if (status === 'offline') {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    });
    
    // Get list of online users
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users.map(u => u.userId));
    });
    
    return () => {
      socket.off('newMessage');
      socket.off('messageRead');
      socket.off('userTyping');
      socket.off('userStatus');
      socket.off('onlineUsers');
    };
  }, [socket, user, selectedUser]);
  
  // Fetch user details to get roles if missing
  const fetchUserDetails = async (userId) => {
    if (userDetails[userId]) return userDetails[userId];
    
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const details = response.data.data;
        setUserDetails(prev => ({
          ...prev,
          [userId]: details
        }));
        return details;
      }
    } catch (error) {
      console.error(`Error fetching details for user ${userId}:`, error);
    }
    
    return null;
  };

  // Fetch recent conversations
  useEffect(() => {
    if (!token) return;
    
    const fetchRecentConversations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/conversations/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          let conversations = response.data.data;
          
          // Set unread counts
          const unreadCounts = {};
          conversations.forEach(conv => {
            if (conv.unreadCount > 0) {
              unreadCounts[conv.user.id] = conv.unreadCount;
            }
          });
          setUnreadCount(unreadCounts);
          
          // Fetch roles for users who don't have them
          const conversationsWithRoles = await Promise.all(
            conversations.map(async (conv) => {
              if (!conv.user.role) {
                const userDetail = await fetchUserDetails(conv.user.id);
                if (userDetail && userDetail.role) {
                  return {
                    ...conv,
                    user: {
                      ...conv.user,
                      role: userDetail.role
                    }
                  };
                }
              }
              return conv;
            })
          );
          
          setConversations(conversationsWithRoles);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      }
    };
    
    fetchRecentConversations();
  }, [token]);
  
  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser || !token) return;
    
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_URL}/api/messages/conversation/${selectedUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setMessages(response.data.data.messages);
          
          // Reset unread count for this conversation
          setUnreadCount(prev => ({
            ...prev,
            [selectedUser.id]: 0
          }));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Mark conversation as read
    if (socket) {
      socket.emit('markConversationRead', { userId: selectedUser.id });
    }
  }, [selectedUser, token, socket]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !socket) return;
    
    socket.emit('sendMessage', {
      receiverId: selectedUser.id,
      message: newMessage.trim()
    });
    
    // Optimistically add message to the UI
    const tempMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isTemp: true // Flag to mark as temporary until confirmed
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    // Clear typing indicator
    handleTypingStop();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const updateConversationWithMessage = (message) => {
    // Check if conversation exists
    const conversationIndex = conversations.findIndex(
      c => c.user.id === message.senderId || c.user.id === message.receiverId
    );
    
    if (conversationIndex >= 0) {
      // Update existing conversation
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex].lastMessage = {
        id: message.id,
        message: message.message,
        timestamp: message.timestamp,
        sentByMe: message.senderId === user.id
      };
      
      // Move conversation to top
      const [conversation] = updatedConversations.splice(conversationIndex, 1);
      updatedConversations.unshift(conversation);
      
      setConversations(updatedConversations);
    } else {
      // Add new conversation if it's a new contact
      // We would need to fetch user details first
      const fetchUserAndAddConversation = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/api/users/${message.senderId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.success) {
            const newUser = response.data.data;
            
            const newConversation = {
              user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
              },
              lastMessage: {
                id: message.id,
                message: message.message,
                timestamp: message.timestamp,
                sentByMe: false
              },
              unreadCount: 1
            };
            
            setConversations([newConversation, ...conversations]);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      
      fetchUserAndAddConversation();
    }
  };
  
  const handleUserSelect = async (user) => {
    // If the user doesn't have a role, try to fetch it
    if (!user.role) {
      const userDetail = await fetchUserDetails(user.id);
      if (userDetail && userDetail.role) {
        user = {
          ...user,
          role: userDetail.role
        };
      }
    }
    
    setSelectedUser(user);
    setShowUserSelector(false);
    
    // Reset unread count for this conversation
    setUnreadCount(prev => ({
      ...prev,
      [user.id]: 0
    }));
  };
  
  const handleTypingStart = () => {
    if (!socket || !selectedUser) return;
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator
    socket.emit('typing', {
      receiverId: selectedUser.id,
      isTyping: true
    });
    
    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
  };
  
  const handleTypingStop = () => {
    if (!socket || !selectedUser) return;
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send stop typing indicator
    socket.emit('typing', {
      receiverId: selectedUser.id,
      isTyping: false
    });
  };
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTypingStart();
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getMessageStyle = (message) => {
    const isSentByMe = message.senderId === user?.id;
    
    // Adjust the message appearance based on sender
    return {
      alignSelf: isSentByMe ? 'flex-end' : 'flex-start',
      backgroundColor: isSentByMe ? '#0084ff' : '#f1f0f0',
      color: isSentByMe ? 'white' : 'black',
      borderRadius: isSentByMe ? '18px 18px 0 18px' : '18px 18px 18px 0',
      padding: '10px 14px',
      maxWidth: '70%',
      marginBottom: '8px',
      wordBreak: 'break-word',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    };
  };
  
  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getTotalUnreadCount = () => {
    return Object.values(unreadCount).reduce((sum, count) => sum + count, 0);
  };
  
  return (
    <div className="flex h-full flex-col md:flex-row bg-white rounded-lg shadow-lg">
      {/* Sidebar with conversations */}
      <div className="w-full md:w-1/3 border-r border-gray-300 flex flex-col h-full">
        <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold flex items-center">
            <FiMessageCircle className="mr-2" /> 
            Messages
            {getTotalUnreadCount() > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {getTotalUnreadCount()}
              </span>
            )}
          </h2>
          <button 
            onClick={() => setShowUserSelector(true)}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            aria-label="New message"
          >
            <FiUsers size={20} />
          </button>
        </div>
        
        <div className="p-3 border-b border-gray-300">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const userRole = conversation.user.role || 'default';
              const roleInfo = roleConfig[userRole] || roleConfig.default;
              
              return (
                <div
                  key={conversation.user.id}
                  onClick={() => handleUserSelect(conversation.user)}
                  className={`p-3 border-b border-gray-200 flex items-center cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedUser?.id === conversation.user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      {conversation.user.name ? (
                        conversation.user.name.charAt(0).toUpperCase()
                      ) : (
                        <FiUser size={20} />
                      )}
                    </div>
                    
                    {/* Online status indicator */}
                    {onlineUsers.includes(conversation.user.id) && (
                      <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    
                    {/* Role indicator */}
                    <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full ${roleInfo.color} flex items-center justify-center border-2 border-white`}>
                      {roleInfo.icon}
                    </div>
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.user.name}
                        </h3>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${roleInfo.color}`}>
                          {conversation.user.role ? conversation.user.role.charAt(0).toUpperCase() + conversation.user.role.slice(1) : 'User'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-500 truncate mr-1">
                        {conversation.lastMessage.sentByMe ? 'You: ' : ''}
                        {conversation.lastMessage.message}
                      </p>
                      {typingUsers[conversation.user.id] && (
                        <span className="text-xs text-green-500 ml-1">typing...</span>
                      )}
                      {unreadCount[conversation.user.id] > 0 && (
                        <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                          {unreadCount[conversation.user.id]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-300 flex items-center justify-between bg-gray-50">
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Online status indicator */}
                  {onlineUsers.includes(selectedUser.id) && (
                    <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  
                  {/* Role indicator */}
                  {selectedUser.role && (
                    <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full ${
                      roleConfig[selectedUser.role]?.color || roleConfig.default.color
                    } flex items-center justify-center border-2 border-white`}>
                      {roleConfig[selectedUser.role]?.icon || roleConfig.default.icon}
                    </div>
                  )}
                </div>
                
                <div className="ml-3">
                  <div className="flex items-center">
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      roleConfig[selectedUser.role]?.color || roleConfig.default.color
                    }`}>
                      {selectedUser.role ? 
                        selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) 
                        : 'User'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {onlineUsers.includes(selectedUser.id) ? 'Online' : 'Offline'}
                    {isTyping && <span className="ml-2 text-green-500">typing...</span>}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {selectedUser.email}
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="loader"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-gray-500">
                  <div className="mb-4 text-center">
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">This is the beginning of your conversation with {selectedUser.name}</p>
                    <p className="text-xs mt-2">{selectedUser.role && `${selectedUser.name} is a ${selectedUser.role}`}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 max-w-md text-center">
                    Send a message to start collaborating with {selectedUser.name}! All messages are visible only to you and {selectedUser.name}.
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isSentByMe = message.senderId === user?.id;
                  const showSender = index === 0 || messages[index - 1].senderId !== message.senderId;
                  
                  return (
                    <div
                      key={message.id}
                      className="flex flex-col mb-4"
                      style={{ alignItems: isSentByMe ? 'flex-end' : 'flex-start' }}
                    >
                      {/* Show sender name when sender changes */}
                      {showSender && !isSentByMe && (
                        <div className="text-xs font-medium text-gray-500 mb-1 ml-1 flex items-center">
                          {selectedUser.name}
                          {selectedUser.role && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                              roleConfig[selectedUser.role]?.color || roleConfig.default.color
                            }`}>
                              {selectedUser.role}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div style={getMessageStyle(message)}>
                        {message.message}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1 flex items-center" 
                           style={{ marginLeft: !isSentByMe ? '4px' : '0', 
                                  marginRight: isSentByMe ? '4px' : '0' }}>
                        {formatTime(message.timestamp)}
                        {isSentByMe && (
                          <span className="ml-2">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t border-gray-300 p-4">
              <div className="flex">
                <textarea
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 resize-none border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows="2"
                ></textarea>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`px-4 rounded-r-lg flex items-center justify-center ${
                    newMessage.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FiMessageCircle size={64} className="mb-4 text-gray-300" />
            <p className="text-xl">Select a conversation</p>
            <p className="mt-2 text-sm">Or start a new one</p>
            <button
              onClick={() => setShowUserSelector(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              New Message
            </button>
          </div>
        )}
      </div>
      
      {/* User selector modal */}
      {showUserSelector && (
        <UserSelector
          onClose={() => setShowUserSelector(false)}
          onSelectUser={handleUserSelect}
          currentUserId={user?.id}
          token={token}
        />
      )}
    </div>
  );
};

export default Chat;