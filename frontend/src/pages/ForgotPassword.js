import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/Toast';
import logo from '../images/PowerWorldGymsIcon.png';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Get role from URL params if provided
  const urlRole = new URLSearchParams(location.search).get('role');
  if (urlRole && role !== urlRole) {
    setRole(urlRole);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      const msg = 'Email is required';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const endpoint = `http://localhost:5001/api/auth/${role}/forgot-password`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setSuccess(true);
      toast.success('Check your email for password reset link');
      
      // Auto redirect after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMsg = err.message || 'Failed to send reset link';
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
        <h2>Forgot Password?</h2>

        {success ? (
          <div className="success-message">
            <p>✓ Password reset link has been sent to your email!</p>
            <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#666' }}>
              Check your email for instructions. Redirecting to home...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>

            {error && <div style={{ color: '#d32f2f', marginBottom: '10px', fontSize: '0.9em' }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Remember your password?{' '}
          <a href="/" style={{ color: '#1976d2', textDecoration: 'none', cursor: 'pointer' }}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
