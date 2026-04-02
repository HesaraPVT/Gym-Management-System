import { Link } from 'react-router-dom';
import logo from '../assets/PowerWorldGymsIcon.png'; // Import the logo image



const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img
            src={logo}
            alt="PowerWorld Gym Logo"
            style={{ height: '70px', objectFit: 'contain' }}
          />
        </Link>
        <div className="flex-gap-2 align-center">
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderColor: '#e2e8f0' }}
            onClick={() => {
              localStorage.removeItem('userInfo');
              window.location.href = '/login';
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
