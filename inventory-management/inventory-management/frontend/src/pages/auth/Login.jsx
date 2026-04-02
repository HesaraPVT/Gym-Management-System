import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import powerLogo from '../../assets/PowerWorldGymsIcon.png';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success('Login successful!');
      window.location.href = '/'; // Hard reload to trigger router state reset
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <img src={powerLogo} alt="PowerWorld Logo" style={{ height: '50px', objectFit: 'contain', marginBottom: '2rem' }} />
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Sign In to Workspace</h2>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group mb-4">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              autoFocus
              placeholder="Enter username"
            />
          </div>
          <div className="form-group mb-6">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter password"
            />
            
            <br />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-muted mt-6" style={{ fontSize: '0.8rem' }}>
          By logging in, you agree to the security protocol of PowerWorld GYM system.
        </p>
      </div>
    </div>
  );
};

export default Login;
