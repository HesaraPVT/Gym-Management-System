import React, { useState, useEffect } from 'react';
import AdminStatsPage from './AdminStatsPage';
import AdminProgressPage from './AdminProgressPage';
import AdminWorkoutPage from './AdminWorkoutPage';
import './AdminProgressTrackingContainer.css';
import statIcon from '../../images/stat.png';
import progressIcon from '../../images/progress.png';
import workoutIcon from '../../images/workout.png';

function AdminProgressTrackingContainer() {
  const [activeTab, setActiveTab] = useState('stats');
  const [measurements, setMeasurements] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStatsPage measurements={measurements} />;
      case 'progress':
        return <AdminProgressPage measurements={measurements} />;
      case 'workout':
        return <AdminWorkoutPage workouts={workouts} />;
      default:
        return <AdminStatsPage measurements={measurements} />;
    }
  };

  return (
    <div className="admin-progress-tracking-container">
      {/* Tab Content */}
      <div className="admin-tracking-content">
        {renderContent()}
      </div>

      {/* Tab Navigation at Bottom */}
      <div className="admin-tracking-tabs-bottom">
        <div className="admin-tracking-tabs">
          <button
            className={`admin-tracking-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <img src={statIcon} alt="Members" />
            Members
          </button>
          <button
            className={`admin-tracking-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <img src={progressIcon} alt="Progress" />
            Progress
          </button>
          <button
            className={`admin-tracking-tab ${activeTab === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveTab('workout')}
          >
            <img src={workoutIcon} alt="Workouts" />
            Workouts
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminProgressTrackingContainer;
