import React, { useState, useEffect, useRef } from 'react';

const ChatBox = ({ currentUser, otherUser, onClose }) => {
  const [messages, setMessages] = useState([
    {
      _id: '1',
      sender_id: 'trainer-1',
      receiver_id: 'user-1',
      text: 'hello',
      timestamp: new Date(Date.now() - 5000).toISOString()
    },
    {
      _id: '2',
      sender_id: 'user-1',
      receiver_id: 'trainer-1',
      text: 'how can i help u',
      timestamp: new Date(Date.now() - 2000).toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      _id: Date.now(),
      sender_id: currentUser.id,
      receiver_id: otherUser._id,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // TODO: Send message through socket or API
    console.log('Message sent:', newMessage);
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
            <p>{otherUser.role}</p>
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
          const isMe = msg.sender_id === currentUser.id;
          return (
            <div key={msg._id} className={`chat-message ${isMe ? 'sent' : 'received'}`}>
              <div className="message-content">{msg.text}</div>
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
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!inputText.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
