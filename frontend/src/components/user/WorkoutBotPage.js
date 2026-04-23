import React, { useState } from 'react';
import './WorkoutBotPage.css';

const MISTRAL_API_URL = 'http://localhost:8000/query';

function WorkoutBotPage() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! 🤖 I\'m your AI Fitness Assistant. I can help you generate personalized workout plans. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to chat
    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: userInput,
      timestamp: new Date()
    };

    setMessages([...messages, newUserMessage]);
    setUserInput('');
    setLoading(true);
    setError(null);

    try {
      // Send request to Mistral AI API
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userInput
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response to chat
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: data.response || data.message || 'Sorry, I couldn\'t generate a response. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error communicating with AI:', err);
      setError(err.message);
      
      const errorMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: `❌ Error: ${err.message}. Make sure your Mistral AI Search API is running on http://localhost:8000`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = (container) => {
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  React.useEffect(() => {
    const messagesContainer = document.querySelector('.chat-messages');
    scrollToBottom(messagesContainer);
  }, [messages]);

  return (
    <div className="workout-bot-page">
      <div className="workout-bot-container">
        {/* Chat Container */}
        <div className="chat-container">
          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender}-message`}
              >
                <div className="message-content">
                  <div className="message-avatar">
                    {msg.sender === 'bot' ? '🤖' : '👤'}
                  </div>
                  <div className="message-text">
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot-message">
                <div className="message-content">
                  <div className="message-avatar">🤖</div>
                  <div className="message-text">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask me anything about fitness, workouts, nutrition, or health..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={loading || !userInput.trim()}
            >
              {loading ? '...' : '📤'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutBotPage;
