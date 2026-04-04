import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import logo from '../images/PowerWorldGymsIcon.png';
import './Auth.css';

function AdminSignin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validations
    if (!email.trim()) {
      const msg = 'Email is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!password.trim()) {
      const msg = 'Password is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/admins/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Store token/admin info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      localStorage.setItem('role', 'admin');
      
      toast.success('Login successful!');
      navigate('/main/admin');
    } catch (err) {
      console.error('Admin signin error:', err);
      const errorMsg = err.message || 'Failed to sign in';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="Power World Gyms" className="auth-logo" />
        <h2>Welcome!</h2>
        <form onSubmit={handleSignin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              maxLength="256"
              placeholder="At least 6 characters"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/signup/admin')}
            >
              Create now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminSignin;
