import React, { useState, useEffect } from 'react';
import './TrainerHome.css';

function TrainerHome() {
  const [trainerName, setTrainerName] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 24,
    completedSessions: 18,
    upcomingBookings: 5,
    totalEarnings: 12500
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    // Get trainer name from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setTrainerName(user.name || 'Trainer');

    // Mock upcoming sessions
    const today = new Date();
    const mockSessions = [
      {
        id: 1,
        studentName: 'John Doe',
        category: 'Strength Training',
        dateTime: new Date(today.getTime() + 2 * 60 * 60 * 1000),
        duration: '60 mins'
      },
      {
        id: 2,
        studentName: 'Jane Smith',
        category: 'Yoga',
        dateTime: new Date(today.getTime() + 4 * 60 * 60 * 1000),
        duration: '45 mins'
      },
      {
        id: 3,
        studentName: 'Mike Johnson',
        category: 'Cardio',
        dateTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        duration: '60 mins'
      },
      {
        id: 4,
        studentName: 'Sarah Williams',
        category: 'Strength Training',
        dateTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        duration: '60 mins'
      },
      {
        id: 5,
        studentName: 'Tom Brown',
        category: 'Flexibility',
        dateTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: '50 mins'
      }
    ];
    setUpcomingSessions(mockSessions.sort((a, b) => a.dateTime - b.dateTime));
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'Strength Training': '#FF6B6B',
      'Yoga': '#4ECDC4',
      'Cardio': '#FFE66D',
      'Flexibility': '#95E1D3',
      'HIIT': '#F38181',
      'Pilates': '#AA96DA'
    };
    return colors[category] || '#999';
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="trainer-home">
      <h1>Welcome back, {trainerName}! 👋</h1>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedSessions}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.upcomingBookings}</div>
          <div className="stat-label">Upcoming Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${(stats.totalEarnings / 1000).toFixed(1)}K</div>
          <div className="stat-label">Total Earnings</div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="upcoming-sessions">
        <h2>Your Upcoming Sessions</h2>
        <div className="sessions-container">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <h3>{session.studentName}</h3>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(session.category) }}
                  >
                    {session.category}
                  </span>
                </div>
                <p className="session-time">📅 {formatDateTime(session.dateTime)}</p>
                <p className="session-duration">⏱️ {session.duration}</p>
                <div className="session-actions">
                  <button className="btn-confirm">Confirm</button>
                  <button className="btn-message">Message</button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-sessions">No upcoming sessions</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainerHome;
