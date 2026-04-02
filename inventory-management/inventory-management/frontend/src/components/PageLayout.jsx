import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const PageLayout = () => {
  const location = useLocation();

  // Redirect root to /inventory
  if (location.pathname === '/') {
    return <Navigate to="/inventory" replace />;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default PageLayout;
