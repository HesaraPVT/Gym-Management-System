import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import logo from '../images/PowerWorldGymsIcon.png';
import './Auth.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const token = searchParams.get('token');
  const role = searchParams.get('role') || 'user';

  console.log('🔧 ResetPassword Component Loaded');
  console.log('Token present:', !!token);
  console.log('Role:', role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!token) {
      const msg = 'Invalid reset link';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    console.log('📤 Sending reset password request');
    console.log('Role:', role);
    console.log('Token first 20 chars:', token.substring(0, 20) + '...');

    try {
      const endpoint = `http://localhost:5001/api/auth/${role}/reset-password`;
      console.log('Reset endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          newPassword: password
        }),
      });

      console.log('📥 Response received');
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      toast.success('Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin-signin');
        } else if (role === 'trainer') {
          navigate('/trainer-signin');
        } else {
          navigate('/');
        }
      }, 3000);
    } catch (err) {
      console.error('❌ Reset password error:', err);
      console.log('Error message:', err.message);
      const errorMsg = err.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <img src={logo} alt="Power World Gyms" className="auth-logo" />
          <h2>Invalid Link</h2>
          <p>The password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="Power World Gyms" className="auth-logo" />
        <h2>Reset Password</h2>

        {success ? (
          <div className="success-message">
            <p>✓ Password reset successfully!</p>
            <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#666' }}>
              You can now login with your new password. Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
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

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="6"
                maxLength="256"
                placeholder="Re-enter your password"
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#1976d2', textDecoration: 'none', cursor: 'pointer' }}>
            Back to Home
          </a>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
