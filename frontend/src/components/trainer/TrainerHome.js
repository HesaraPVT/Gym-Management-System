import React, { useState, useEffect } from 'react';
import './TrainerHome.css';

const API_BASE = 'http://localhost:5001/api';

function TrainerHome() {
  const [trainerName, setTrainerName] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingBookings: 0,
    totalEarnings: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get trainer info from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setTrainerName(user.name || 'Trainer');

        // Fetch dashboard stats
        const statsRes = await fetch(`${API_BASE}/trainers/dashboard-stats`, {
          headers: getAuthHeaders()
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.stats);
          }
        }

        // Fetch upcoming sessions
        const sessionsRes = await fetch(`${API_BASE}/trainers/upcoming-sessions`, {
          headers: getAuthHeaders()
        });

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          if (sessionsData.success) {
            setUpcomingSessions(sessionsData.sessions);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      console.log(`${action} session:`, sessionId);
      alert(`${action} functionality will be implemented`);
    } catch (error) {
      console.error(`Error ${action}ing session:`, error);
    }
  };

  return (
    <div className="trainer-home">
      <h1>Welcome back, {trainerName}! 👋</h1>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{loading ? '...' : stats.totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading ? '...' : stats.completedSessions}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading ? '...' : stats.upcomingBookings}</div>
          <div className="stat-label">Upcoming Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{loading ? '...' : `$${(stats.totalEarnings / 1000).toFixed(1)}K`}</div>
          <div className="stat-label">Total Earnings</div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="upcoming-sessions">
        <h2>Your Upcoming Sessions</h2>
        <div className="sessions-container">
          {loading ? (
            <p className="loading-text">Loading sessions...</p>
          ) : upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => {
              const startDate = new Date(session.startTime);
              const endDate = new Date(session.endTime);
              const durationMs = endDate - startDate;
              const durationMins = Math.floor(durationMs / 60000);

              return (
                <div key={session._id} className="session-card">
                  <div className="session-header">
                    <h3>{session.enrolledMembers?.[0]?.name || 'Student'}</h3>
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(session.sessionType) }}
                    >
                      {session.sessionType}
                    </span>
                  </div>
                  <p className="session-time">📅 {formatDateTime(session.startTime)}</p>
                  <p className="session-duration">⏱️ {durationMins} mins</p>
                  <p className="session-title">📝 {session.title}</p>
                  <p className="enrolled-count">
                    👥 {session.enrolledMembers?.length || 0} / {session.maxParticipants} enrolled
                  </p>
                  <div className="session-actions">
                    <button 
                      className="btn-confirm"
                      onClick={() => handleSessionAction(session._id, 'confirm')}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-sessions">No upcoming sessions with enrolled members</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainerHome;
