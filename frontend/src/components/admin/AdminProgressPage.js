import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './AdminProgressPage.css';

function AdminProgressPage({ measurements }) {
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [users, setUsers] = useState([]);
  const [userMeasurements, setUserMeasurements] = useState({});
  const [loading, setLoading] = useState(true);

  // Load users and their measurements from backend
  useEffect(() => {
    const loadUsersMeasurements = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all users
        const usersResponse = await fetch('http://localhost:5001/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const usersList = Array.isArray(usersData) ? usersData : usersData.users || [];
          setUsers(usersList);

          // Fetch measurements for each user
          const measMap = {};
          for (const user of usersList) {
            try {
              const measResponse = await fetch(`http://localhost:5001/api/progress/measurements/${user._id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (measResponse.ok) {
                const userMeasData = await measResponse.json();
                measMap[user._id] = userMeasData.measurements || [];
              }
            } catch (error) {
              console.error(`Error fetching measurements for user ${user._id}:`, error);
              measMap[user._id] = [];
            }
          }
          setUserMeasurements(measMap);
        }
      } catch (error) {
        console.error('Error loading users measurements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsersMeasurements();
  }, []);

  // Create members array from users and their measurements
  const members = useMemo(() => {
    const memberMap = {};
    if (Array.isArray(users)) {
      users.forEach((user) => {
        memberMap[user._id] = {
          id: user._id,
          name: user.name,
          email: user.email,
          measurements: userMeasurements[user._id] || []
        };
      });
    }
    return memberMap;
  }, [users, userMeasurements]);

  // Get selected member measurements
  const selectedMemberMeasurements =
    selectedMemberId === 'all'
      ? Object.values(members).flatMap(m => m.measurements)
      : members[selectedMemberId]?.measurements || [];

  // List of members for dropdown
  const membersList = Object.values(members);

  // Calculate metric changes for alerts
  const calculateAlerts = () => {
    const alerts = [];
    membersList.forEach((member) => {
      if (member.measurements.length < 2) return;

      const sorted = [...member.measurements].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];

      const weightChange = parseFloat(latest.weight) - parseFloat(previous.weight);
      const bodyFatChange = parseFloat(latest.bodyFatPercentage) - parseFloat(previous.bodyFatPercentage);

      // Alert for rapid weight loss/gain (more than 2kg change)
      if (Math.abs(weightChange) > 2) {
        alerts.push({
          id: `${member.id}-weight`,
          member: member.name,
          type: weightChange > 0 ? 'Weight Gain' : 'Weight Loss',
          value: `${Math.abs(weightChange).toFixed(1)}kg`,
          severity: Math.abs(weightChange) > 4 ? 'high' : 'medium',
        });
      }

      // Alert for concerning body fat changes
      if (Math.abs(bodyFatChange) > 1.5) {
        alerts.push({
          id: `${member.id}-bf`,
          member: member.name,
          type: bodyFatChange > 0 ? 'Body Fat Increase' : 'Body Fat Decrease',
          value: `${Math.abs(bodyFatChange).toFixed(1)}%`,
          severity: 'medium',
        });
      }
    });
    return alerts;
  };

  // Calculate insights for fastest improvers
  const calculateInsights = () => {
    const insights = [];
    membersList.forEach((member) => {
      if (member.measurements.length < 2) return;

      const sorted = [...member.measurements].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      const first = sorted[0];
      const latest = sorted[sorted.length - 1];

      const weightChange = parseFloat(first.weight) - parseFloat(latest.weight);
      const muscleMassChange =
        parseFloat(latest.muscleMass) - parseFloat(first.muscleMass);
      const bodyFatChange = parseFloat(first.bodyFatPercentage) - parseFloat(latest.bodyFatPercentage);

      insights.push({
        id: member.id,
        name: member.name,
        weightChange: weightChange.toFixed(1),
        muscleMassChange: muscleMassChange.toFixed(1),
        bodyFatChange: bodyFatChange.toFixed(1),
        entries: member.measurements.length,
      });
    });

    return insights.sort(
      (a, b) => parseFloat(b.weightChange) - parseFloat(a.weightChange)
    );
  };

  const alerts = calculateAlerts();
  const insights = calculateInsights();

  const hasEnoughData = selectedMemberMeasurements.length >= 2;

  const sortedMeasurements = [...selectedMemberMeasurements].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const chartData = sortedMeasurements.map((m) => ({
    date: m.date,
    weight: parseFloat(m.weight),
    bodyFat: parseFloat(m.bodyFatPercentage),
    muscleMass: parseFloat(m.muscleMass),
    height: parseFloat(m.height),
  }));

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
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const metricConfig = {
    weight: { label: 'Weight (kg)', color: '#DA2129', gradientId: 'fillWeight' },
    bodyFat: { label: 'Body Fat (%)', color: '#231F20', gradientId: 'fillBodyFat' },
    muscleMass: {
      label: 'Muscle Mass (kg)',
      color: '#DA2129',
      gradientId: 'fillMuscleMass',
    },
    height: { label: 'Height (cm)', color: '#231F20', gradientId: 'fillHeight' },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-date">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="chart-tooltip-value"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="admin-progress-page"><p>Loading member analytics...</p></div>;
  }

  return (
    <div className="admin-progress-page">
      <div className="admin-header">
        <h1 className="admin-title">Member Progress Analytics</h1>
      </div>

      {/* User Selector */}
      <div className="selector-section">
        <label className="selector-label">Select Member:</label>
        <select
          className="member-selector"
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
        >
          <option value="all">All Members</option>
          {membersList.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-content">
        {/* Left Column - Charts */}
        <div className="admin-chart-section">
          {!hasEnoughData ? (
            <div className="no-data-message">
              <p>Not enough data to display progress graph</p>
            </div>
          ) : (
            <>
              {/* Metric Selector */}
              <div className="metric-selector">
                <button
                  className={`metric-btn ${selectedMetric === 'weight' ? 'active' : ''}`}
                  onClick={() => setSelectedMetric('weight')}
                >
                  Weight
                </button>
                <button
                  className={`metric-btn ${selectedMetric === 'bodyFat' ? 'active' : ''}`}
                  onClick={() => setSelectedMetric('bodyFat')}
                >
                  Body Fat
                </button>
                <button
                  className={`metric-btn ${selectedMetric === 'muscleMass' ? 'active' : ''}`}
                  onClick={() => setSelectedMetric('muscleMass')}
                >
                  Muscle Mass
                </button>
                <button
                  className={`metric-btn ${selectedMetric === 'height' ? 'active' : ''}`}
                  onClick={() => setSelectedMetric('height')}
                >
                  Height
                </button>
              </div>

              {/* Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h2 className="chart-title">Progress Graph</h2>
                  <p className="chart-subtitle">
                    Showing {metricConfig[selectedMetric].label} over time
                  </p>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id={metricConfig[selectedMetric].gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={metricConfig[selectedMetric].color}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={metricConfig[selectedMetric].color}
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={formatDate}
                        tick={{
                          fontSize: 12,
                          fontFamily: 'DM Sans',
                          fill: '#818284',
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{
                          fontSize: 12,
                          fontFamily: 'DM Sans',
                          fill: '#818284',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{
                          fontFamily: 'DM Sans',
                          fontSize: '13px',
                          color: '#231F20',
                        }}
                      />
                      <Area
                        name={metricConfig[selectedMetric].label}
                        dataKey={selectedMetric}
                        type="monotone"
                        fill={`url(#${metricConfig[selectedMetric].gradientId})`}
                        stroke={metricConfig[selectedMetric].color}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Alerts & Insights */}
        <div className="admin-sidebar">
          {/* Alert System */}
          <div className="alerts-section">
            <h3 className="alerts-title">Alerts</h3>
            {alerts.length === 0 ? (
              <p className="no-alerts">No alerts at this time</p>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-card alert-${alert.severity}`}
                  >
                    <div className="alert-header">
                      <p className="alert-member">{alert.member}</p>
                      <span className="alert-badge">{alert.severity}</span>
                    </div>
                    <p className="alert-type">{alert.type}</p>
                    <p className="alert-value">{alert.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metric Insights */}
          <div className="insights-section">
            <h3 className="insights-title">Top Performers</h3>
            {insights.length === 0 ? (
              <p className="no-insights">No data available</p>
            ) : (
              <div className="insights-list">
                {insights.slice(0, 5).map((insight, idx) => (
                  <div key={insight.id} className="insight-card">
                    <div className="insight-rank">#{idx + 1}</div>
                    <div className="insight-content">
                      <p className="insight-name">{insight.name}</p>
                      <div className="insight-metrics">
                        <span className="insight-metric">
                          Weight: {insight.weightChange}kg
                        </span>
                        <span className="insight-metric">
                          Muscle: {insight.muscleMassChange}kg
                        </span>
                      </div>
                      <p className="insight-entries">
                        {insight.entries} entries
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProgressPage;
