import React, { useState } from 'react';
import './App.css';
import StatsPage from './components/StatsPage';
import ProgressPage from './components/ProgressPage';
import WorkoutPage from './components/WorkoutPage';
import logo from './images/PowerWorldGymsIcon.png';
import statIcon from './images/stat.png';
import progressIcon from './images/progress.png';
import workoutIcon from './images/workout.png';

function App() {
  const [activePage, setActivePage] = useState('stats');
  const [measurements, setMeasurements] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const renderPage = () => {
    switch (activePage) {
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
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <img src={logo} alt="Power World Gyms" className="header-logo" />
      </div>

      {/* Page Content */}
      <div className="page-content">
        {renderPage()}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <button
            className={`nav-item ${activePage === 'stats' ? 'active' : ''}`}
            onClick={() => setActivePage('stats')}
          >
            <img src={statIcon} alt="Stats" />
            Stats
          </button>
          <button
            className={`nav-item ${activePage === 'progress' ? 'active' : ''}`}
            onClick={() => setActivePage('progress')}
          >
            <img src={progressIcon} alt="Progress" />
            Progress
          </button>
          <button
            className={`nav-item ${activePage === 'workout' ? 'active' : ''}`}
            onClick={() => setActivePage('workout')}
          >
            <img src={workoutIcon} alt="Workout" />
            Workout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
