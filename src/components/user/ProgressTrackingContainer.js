import React, { useState, useEffect } from 'react';
import StatsPage from './StatsPage';
import ProgressPage from './ProgressPage';
import WorkoutPage from './WorkoutPage';
import './ProgressTrackingContainer.css';
import statIcon from '../../images/stat.png';
import progressIcon from '../../images/progress.png';
import workoutIcon from '../../images/workout.png';

function ProgressTrackingContainer() {
  const [activeTab, setActiveTab] = useState('stats');
  const [measurements, setMeasurements] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          <StatsPage
            measurements={measurements}
            setMeasurements={setMeasurements}
          />
        );
      case 'progress':
        return <ProgressPage measurements={measurements} />;
      case 'workout':
        return <WorkoutPage workouts={workouts} setWorkouts={setWorkouts} />;
      default:
        return (
          <StatsPage
            measurements={measurements}
            setMeasurements={setMeasurements}
          />
        );
    }
  };

  return (
    <div className="progress-tracking-container">
      {/* Tab Content */}
      <div className="tracking-content">
        {renderContent()}
      </div>

      {/* Tab Navigation at Bottom */}
      <div className="tracking-tabs-bottom">
        <div className="tracking-tabs">
          <button
            className={`tracking-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <img src={statIcon} alt="Stats" />
            Stats
          </button>
          <button
            className={`tracking-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <img src={progressIcon} alt="Progress" />
            Progress
          </button>
          <button
            className={`tracking-tab ${activeTab === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveTab('workout')}
          >
            <img src={workoutIcon} alt="Workout" />
            Workout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressTrackingContainer;
