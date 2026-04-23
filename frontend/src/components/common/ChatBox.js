import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:5001/api';

const ChatBox = ({ currentUser, otherUser, scheduleId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      await fetch(`${API_BASE}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  // Fetch messages for the schedule
  const fetchMessages = useCallback(async () => {
    try {
      if (!scheduleId) return;

      const res = await fetch(`${API_BASE}/messages/${scheduleId}`, {
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (data.success && data.messages) {
        setMessages(data.messages);
        
        // Mark unread messages as read
        data.messages.forEach((msg) => {
          if (msg.receiver_id && msg.receiver_id._id === currentUser.id && !msg.isRead) {
            markMessageAsRead(msg._id);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [scheduleId, currentUser.id, markMessageAsRead]);

  useEffect(() => {
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !scheduleId) return;

    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiver_id: otherUser._id,
          schedule_id: scheduleId,
          text: inputText.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setInputText('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  if (!otherUser) return null;

  return (
    <div className="chat-box">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-avatar">{otherUser.name?.charAt(0).toUpperCase()}</div>
          <div className="chat-user-details">
            <h3>{otherUser.name}</h3>
            <p>{otherUser.role || 'Trainer'}</p>
          </div>
        </div>
        <button 
          className="chat-close" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id && msg.sender_id._id === currentUser.id;
          return (
            <div key={msg._id} className={`chat-message ${isMe ? 'sent' : 'received'}`}>
              <div className="message-content">{msg.text}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="chat-input"
          disabled={sending}
        />
        <button 
          className="chat-send-btn" 
          onClick={handleSend} 
          disabled={!inputText.trim() || sending}
        >
          {sending ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
