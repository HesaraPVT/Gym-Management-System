import React, { useState, useEffect, useMemo } from 'react';
import './AdminWorkoutPage.css';

function AdminWorkoutPage({ workouts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [filterExercise, setFilterExercise] = useState('');
  const [users, setUsers] = useState([]);
  const [userWorkouts, setUserWorkouts] = useState({});
  const [loading, setLoading] = useState(true);

  // Load users and their workouts from backend
  useEffect(() => {
    const loadUsersWorkouts = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all users
        const usersResponse = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);

          // Fetch workouts for each user
          const workoutsMap = {};
          for (const user of usersData) {
            try {
              const wktsResponse = await fetch(`http://localhost:5000/api/users/${user.id}/workouts`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (wktsResponse.ok) {
                const userWorkoutsData = await wktsResponse.json();
                workoutsMap[user.id] = userWorkoutsData;
              }
            } catch (error) {
              console.error(`Error fetching workouts for user ${user.id}:`, error);
              workoutsMap[user.id] = [];
            }
          }
          setUserWorkouts(workoutsMap);
        }
      } catch (error) {
        console.error('Error loading users workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsersWorkouts();
  }, []);

  // Create members array from users and their workouts
  const memberWorkouts = useMemo(() => {
    const memberMap = {};
    users.forEach((user) => {
      memberMap[user.id] = userWorkouts[user.id] || [];
    });
    return memberMap;
  }, [users, userWorkouts]);

  const members = useMemo(() => {
    return users
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        workouts: memberWorkouts[user.id] || [],
        totalWorkouts: (memberWorkouts[user.id] || []).length,
      }))
      .sort((a, b) => b.totalWorkouts - a.totalWorkouts);
  }, [users, memberWorkouts]);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  // Get unique exercises
  const exercises = useMemo(() => {
    const exerciseSet = new Set();
    workouts.forEach((w) => exerciseSet.add(w.exercise));
    return Array.from(exerciseSet).sort();
  }, [workouts]);

  // Get selected member's workouts with filter
  const selectedMemberData = selectedMemberId
    ? memberWorkouts[selectedMemberId]
        .filter(
          (w) =>
            !filterExercise || w.exercise === filterExercise
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    let d;
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      d = new Date(dateStr);
    } else if (typeof dateStr === 'string') {
      d = new Date(dateStr + 'T00:00:00');
    } else {
      d = new Date(dateStr);
    }
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate member statistics
  const getMemberStats = (memberId) => {
    const memberWkts = memberWorkouts[memberId];
    if (!memberWkts || memberWkts.length === 0) return null;

    return {
      totalWorkouts: memberWkts.length,
      lastWorkout: memberWkts[memberWkts.length - 1].date,
    };
  };

  if (loading) {
    return <div className="admin-workout-page"><p>Loading members workouts...</p></div>;
  }

  return (
    <div className="admin-workout-page">
      <div className="admin-header">
        <h1 className="admin-title">Member Workout History</h1>
      </div>

      {/* Search Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-content">
        {/* Left Column - Members List */}
        <div className="members-list-section">
          <h2 className="section-title">Members ({filteredMembers.length})</h2>
          <div className="members-list">
            {filteredMembers.length === 0 ? (
              <div className="no-results">No members found</div>
            ) : (
              filteredMembers.map((member) => {
                const stats = getMemberStats(member.id);
                return (
                  <div
                    key={member.id}
                    className={`member-item ${
                      selectedMemberId === member.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setFilterExercise('');
                    }}
                  >
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-stats">
                        {member.totalWorkouts} workout{member.totalWorkouts !== 1 ? 's' : ''}
                      </p>
                      {stats && (
                        <p className="member-last-workout">
                          Last: {formatDate(stats.lastWorkout)}
                        </p>
                      )}
                    </div>
                    <div className="member-badge">
                      {member.totalWorkouts}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Workout History */}
        {selectedMemberId && selectedMemberData.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <div>
                <h2 className="section-title">
                  Workout History - {users.find(u => u.id === selectedMemberId)?.name || 'Member'}
                </h2>
                <select
                  className="filter-select"
                  value={filterExercise}
                  onChange={(e) => setFilterExercise(e.target.value)}
                >
                  <option value="">All Exercises</option>
                  {exercises
                    .filter((ex) =>
                      memberWorkouts[selectedMemberId].some((w) => w.exercise === ex)
                    )
                    .map((ex) => (
                      <option key={ex} value={ex}>
                        {ex}
                      </option>
                    ))}
                </select>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedMemberId(null)}
              >
                ✕
              </button>
            </div>

            {selectedMemberData.length === 0 ? (
              <div className="no-results">No workouts matching filter</div>
            ) : (
              <div className="workout-history-list">
                {selectedMemberData.map((w) => (
                  <div className="workout-card" key={w.id}>
                    <div className="workout-card-header">
                      <h4 className="workout-exercise">{w.exercise}</h4>
                      <span className="workout-date">{formatDate(w.date)}</span>
                    </div>
                    <div className="workout-card-details">
                      <div className="detail-item">
                        <span className="detail-label">Sets:</span>
                        <span className="detail-value">{w.sets}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Reps:</span>
                        <span className="detail-value">{w.reps}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Weight:</span>
                        <span className="detail-value">{w.weight}kg</span>
                      </div>
                      <div className="detail-item total-volume">
                        <span className="detail-label">Volume:</span>
                        <span className="detail-value">
                          {(w.sets * w.reps * w.weight).toFixed(0)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedMemberId && (
          <div className="empty-state">
            <p>Select a member to view their workout history</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminWorkoutPage;
