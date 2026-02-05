import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './../css/sign.css';

import {
  FaEnvelope,
  FaLock,
  FaHome,
  FaQuestionCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ================= HANDLE LOGIN ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.success) {
        console.log('✅ Login successful, role:', response.data.user?.role);
        
        // Force a hard redirect using window.location
        const userRole = response.data.user?.role;
        
        if (userRole === 'admin') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/user-dashboard';
        }
        
        // Keep loading true during redirect
        return;
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your account to continue</p>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Password
            </label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <Link to="/forgot-password">
              <FaQuestionCircle /> Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Redirecting...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/sign">Sign Up</Link>
          </p>

          <Link to="/" className="back-home">
            <FaHome /> Back to Home
          </Link>
        </div>
      </div>
      
    </div>
  );
}

export default Login;