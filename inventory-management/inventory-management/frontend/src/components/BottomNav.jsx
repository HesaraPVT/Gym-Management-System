import { NavLink } from 'react-router-dom';
import { Package, Users, Receipt, LayoutDashboard } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        <NavLink 
          to="/inventory" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Package className="nav-icon" />
          <span>Inventory</span>
        </NavLink>
        <NavLink 
          to="/suppliers" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Users className="nav-icon" />
          <span>Suppliers</span>
        </NavLink>
        <NavLink 
          to="/invoices" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <Receipt className="nav-icon" />
          <span>Invoices</span>
        </NavLink>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
