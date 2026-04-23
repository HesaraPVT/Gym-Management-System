import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import ProgressTrackingContainer from './components/user/ProgressTrackingContainer';
import UserHomePage from './components/user/HomePage';
import SchedulePage from './components/user/SchedulePage';
import UserShopPage from './components/user/UserShopPage';
import UserShoppingCart from './components/user/UserShoppingCart';
import UserMemberships from './components/user/UserMemberships';
import UserComplaints from './components/user/UserComplaints';
import WorkoutBotPage from './components/user/WorkoutBotPage';
import TrackOrder from './pages/TrackOrder';
import Checkout from './pages/Checkout';
import AdminProgressTrackingContainer from './components/admin/AdminProgressTrackingContainer';
import AdminHomePage from './components/admin/AdminHomePage';
import AdminMemberships from './components/admin/AdminMemberships';
import AdminComplaints from './components/admin/AdminComplaints';
import AdminOrderTracking from './components/admin/AdminOrderTracking';
import AdminInventory from './components/admin/AdminInventory';
import TrainerHome from './components/trainer/TrainerHome';
import TrainerScheduleManagement from './components/trainer/TrainerScheduleManagement';
import UserSignin from './pages/UserSignin';
import UserSignup from './pages/UserSignup';
import AdminSignin from './pages/AdminSignin';
import AdminSignup from './pages/AdminSignup';
import TrainerSignin from './pages/TrainerSignin';
import TrainerSignup from './pages/TrainerSignup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ToastContainer } from './components/Toast';
import logo from './images/PowerWorldGymsIcon.png';
// Icons for navigation
import progressIcon from './images/stat.png';
import scheduleIcon from './images/schedule.png';
import membershipsIcon from './images/memberships.png';
import inventoryIcon from './images/inventory.png';
import shopIcon from './images/shop.png';
import supportIcon from './images/support.png';
import aiIcon from './images/AI.png';

function UserApp() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'progress':
        return <ProgressTrackingContainer />;
      case 'schedule':
        return <SchedulePage />;
      case 'memberships':
        return <UserMemberships />;
      case 'shop':
        return <UserShopPage />;
      case 'support':
        return <UserComplaints />;
      case 'workoutbot':
        return <WorkoutBotPage />;
      case 'home':
      default:
        return <UserHomePage />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <img 
          src={logo} 
          alt="Power World Gyms" 
          className="header-logo"
          onClick={() => setActivePage('home')}
          style={{ cursor: 'pointer' }}
        />
        
        {/* Navigation Bar in Header */}
        <div className="header-nav">
          <button
            className={`header-nav-item ${activePage === 'progress' ? 'active' : ''}`}
            onClick={() => setActivePage('progress')}
          >
            <img src={progressIcon} alt="Progress" />
            Progress
          </button>
          <button
            className={`header-nav-item ${activePage === 'schedule' ? 'active' : ''}`}
            onClick={() => setActivePage('schedule')}
          >
            <img src={scheduleIcon} alt="Schedule" />
            Schedule
          </button>
          <button
            className={`header-nav-item ${activePage === 'memberships' ? 'active' : ''}`}
            onClick={() => setActivePage('memberships')}
          >
            <img src={membershipsIcon} alt="Memberships" />
            Memberships
          </button>
          <button
            className={`header-nav-item ${activePage === 'shop' ? 'active' : ''}`}
            onClick={() => setActivePage('shop')}
          >
            <img src={shopIcon} alt="Shop" />
            Shop
          </button>
          <button
            className={`header-nav-item ${activePage === 'support' ? 'active' : ''}`}
            onClick={() => setActivePage('support')}
          >
            <img src={supportIcon} alt="Support" />
            Support
          </button>
          <button
            className={`header-nav-item ${activePage === 'workoutbot' ? 'active' : ''}`}
            onClick={() => setActivePage('workoutbot')}
          >
            <img src={aiIcon} alt="AI Assistant" />
            AI Assistant
          </button>
        </div>
        
        <div className="header-controls">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/signin/user';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {renderPage()}
      </div>
    </div>
  );
}

function AdminApp() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'progress':
        return <AdminProgressTrackingContainer />;
      case 'schedule':
        return <AdminHomePage />; // Placeholder
      case 'memberships':
        return <AdminMemberships />;
      case 'inventory':
        return <AdminInventory />;
      case 'tracking':
        return <AdminOrderTracking />;
      case 'support':
        return <AdminComplaints />;
      case 'home':
      default:
        return <AdminHomePage />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <img 
          src={logo} 
          alt="Power World Gyms" 
          className="header-logo"
          onClick={() => setActivePage('home')}
          style={{ cursor: 'pointer' }}
        />
        
        {/* Navigation Bar in Header */}
        <div className="header-nav">
          <button
            className={`header-nav-item ${activePage === 'progress' ? 'active' : ''}`}
            onClick={() => setActivePage('progress')}
          >
            <img src={progressIcon} alt="Progress" />
            Progress
          </button>
          <button
            className={`header-nav-item ${activePage === 'schedule' ? 'active' : ''}`}
            onClick={() => setActivePage('schedule')}
          >
            <img src={scheduleIcon} alt="Schedule" />
            Schedule
          </button>
          <button
            className={`header-nav-item ${activePage === 'memberships' ? 'active' : ''}`}
            onClick={() => setActivePage('memberships')}
          >
            <img src={membershipsIcon} alt="Memberships" />
            Memberships
          </button>
          <button
            className={`header-nav-item ${activePage === 'inventory' ? 'active' : ''}`}
            onClick={() => setActivePage('inventory')}
          >
            <img src={inventoryIcon} alt="Inventory" />
            Inventory
          </button>
          <button
            className={`header-nav-item ${activePage === 'tracking' ? 'active' : ''}`}
            onClick={() => setActivePage('tracking')}
          >
            <img src={scheduleIcon} alt="Tracking" />
            Tracking
          </button>
          <button
            className={`header-nav-item ${activePage === 'support' ? 'active' : ''}`}
            onClick={() => setActivePage('support')}
          >
            <img src={supportIcon} alt="Support" />
            Support
          </button>
        </div>
        
        <div className="header-controls">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/signin/admin';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {renderPage()}
      </div>
    </div>
  );
}

function TrainerApp() {
  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <img 
          src={logo} 
          alt="Power World Gyms" 
          className="header-logo"
          style={{ cursor: 'pointer' }}
        />
        
        <div className="header-controls">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/signin/trainer';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <TrainerScheduleManagement />
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token || !role) {
    return <Navigate to={`/signin/${requiredRole || 'user'}`} />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/signin/${role}`} />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Auth Routes */}
        <Route path="/signin/user" element={<UserSignin />} />
        <Route path="/signup/user" element={<UserSignup />} />
        <Route path="/signin/admin" element={<AdminSignin />} />
        <Route path="/signup/admin" element={<AdminSignup />} />
        <Route path="/signin/trainer" element={<TrainerSignin />} />
        <Route path="/signup/trainer" element={<TrainerSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User Routes */}
        <Route
          path="/main/user"
          element={
            <ProtectedRoute requiredRole="user">
              <UserApp />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/main/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminApp />
            </ProtectedRoute>
          }
        />

        {/* Trainer Routes */}
        <Route
          path="/main/trainer"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerApp />
            </ProtectedRoute>
          }
        />

        {/* Shop Routes */}
        <Route path="/products" element={<UserShopPage />} />
        <Route path="/cart" element={<UserShoppingCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track-order" element={<TrackOrder />} />

        {/* Redirect /main to appropriate role */}
        <Route
          path="/main"
          element={
            <Navigate to={localStorage.getItem('role') === 'admin' ? '/main/admin' : localStorage.getItem('role') === 'trainer' ? '/main/trainer' : '/main/user'} />
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/signin/user" />} />
      </Routes>
    </Router>
  );
}

export default App;
