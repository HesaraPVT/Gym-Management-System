import React, { useState, useEffect, useMemo } from 'react';
import './AdminStatsPage.css';

function AdminStatsPage({ measurements }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('name');
  const [filterValue, setFilterValue] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userMeasurements, setUserMeasurements] = useState({});
  const [loading, setLoading] = useState(true);

  // Load users and their measurements from backend
  useEffect(() => {
    const loadUsersData = async () => {
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
          const usersList = usersData.users || usersData;
          setUsers(Array.isArray(usersList) ? usersList : []);

          // Fetch measurements for each user
          const measurementsMap = {};
          for (const user of (Array.isArray(usersList) ? usersList : [])) {
            try {
              const measResponse = await fetch(`http://localhost:5000/api/users/${user.id}/measurements`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (measResponse.ok) {
                const measurements = await measResponse.json();
                measurementsMap[user.id] = measurements;
              }
            } catch (error) {
              console.error(`Error fetching measurements for user ${user.id}:`, error);
              measurementsMap[user.id] = [];
            }
          }
          setUserMeasurements(measurementsMap);
        }
      } catch (error) {
        console.error('Error loading users data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsersData();
  }, []);

  // Create members array from users and their measurements
  const members = useMemo(() => {
    return users.map((user) => {
      const userMeasures = userMeasurements[user.id] || [];
      const latest = userMeasures.length > 0 ? userMeasures[userMeasures.length - 1] : null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        measurements: userMeasures,
        latest,
      };
    });
  }, [users, userMeasurements]);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    let filtered = members.filter(m => m.latest !== null); // Only show members with measurements

    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType === 'weight' && filterValue) {
      const [min, max] = filterValue.split('-').map(Number);
      filtered = filtered.filter((m) => {
        const weight = parseFloat(m.latest.weight);
        return weight >= min && weight <= max;
      });
    }

    if (filterType === 'bodyFat' && filterValue) {
      const [min, max] = filterValue.split('-').map(Number);
      filtered = filtered.filter((m) => {
        const bf = parseFloat(m.latest.bodyFat);
        return bf >= min && bf <= max;
      });
    }

    return filtered;
  }, [members, searchQuery, filterType, filterValue]);

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

  const selectedMemberData =
    selectedMemberId && userMeasurements[selectedMemberId]
      ? userMeasurements[selectedMemberId]
      : [];

  if (loading) {
    return <div className="admin-stats-page"><p>Loading members data...</p></div>;
  }

  return (
    <div className="admin-stats-page">
      <div className="admin-header">
        <h1 className="admin-title">Member Statistics</h1>
      </div>

      {/* Search & Filter Section */}
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

        <div className="filter-section">
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue('');
            }}
          >
            <option value="name">Filter by...</option>
            <option value="weight">Weight Range</option>
            <option value="bodyFat">Body Fat Range</option>
          </select>

          {filterType === 'weight' && (
            <select
              className="filter-select"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="">All Weight Ranges</option>
              <option value="0-60">Below 60kg</option>
              <option value="60-75">60-75kg</option>
              <option value="75-90">75-90kg</option>
              <option value="90-150">Above 90kg</option>
            </select>
          )}

          {filterType === 'bodyFat' && (
            <select
              className="filter-select"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="">All Body Fat Ranges</option>
              <option value="0-10">Below 10%</option>
              <option value="10-20">10-20%</option>
              <option value="20-30">20-30%</option>
              <option value="30-100">Above 30%</option>
            </select>
          )}
        </div>
      </div>

      <div className="admin-content">
        {/* Left Column - Members Table */}
        <div className="members-section">
          <h2 className="section-title">Members ({filteredMembers.length})</h2>
          <div className="members-table">
            <div className="table-header">
              <div className="table-cell">Member</div>
              <div className="table-cell">Weight</div>
              <div className="table-cell">Body Fat</div>
              <div className="table-cell">Muscle Mass</div>
              <div className="table-cell">Height</div>
              <div className="table-cell">Last Update</div>
              <div className="table-cell">Action</div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="no-results">No members found</div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="table-row"
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <div className="table-cell">{member.name}</div>
                  <div className="table-cell">{member.latest?.weight || '--'} kg</div>
                  <div className="table-cell">{member.latest?.bodyFat || '--'}%</div>
                  <div className="table-cell">{member.latest?.muscleMass || '--'} kg</div>
                  <div className="table-cell">{member.latest?.height || '--'} cm</div>
                  <div className="table-cell">
                    {formatDate(member.latest?.date)}
                  </div>
                  <div className="table-cell">
                    <button className="view-btn">View</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Measurement History */}
        {selectedMemberId && selectedMemberData.length > 0 && (
          <div className="history-section">
            <div className="history-header">
              <h2 className="section-title">
                Measurement History - {users.find(u => u.id === selectedMemberId)?.name || 'Member'}
              </h2>
              <button
                className="close-btn"
                onClick={() => setSelectedMemberId(null)}
              >
                ✕
              </button>
            </div>

            <div className="measurement-history-list">
              {[...selectedMemberData].reverse().map((m) => (
                <div className="measurement-card" key={m.id}>
                  <div className="measurement-card-data">
                    <p>
                      <span>Weight:</span> {m.weight} kg
                    </p>
                    <p>
                      <span>Muscle Mass:</span> {m.muscleMass} kg
                    </p>
                    <p>
                      <span>Body Fat:</span> {m.bodyFat} %
                    </p>
                    <p>
                      <span>Height:</span> {m.height} cm
                    </p>
                    <p className="measurement-card-date">
                      {formatDate(m.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStatsPage;
