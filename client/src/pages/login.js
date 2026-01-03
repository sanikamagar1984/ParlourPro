import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
  // Option 1: Keep individual states (RECOMMENDED for simplicity)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OR Option 2: Use formData object (if you prefer)
  // const [formData, setFormData] = useState({
  //   email: '',
  //   password: ''
  // });

  const navigate = useNavigate();

  /* ================= HANDLE LOGIN ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: email, // Using the email state
          password: password // Using the password state
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Check user role and redirect accordingly
        const userRole = response.data.user?.role;
        console.log('Login successful. User role:', userRole);
        
        if (userRole === 'admin') {
          navigate('/dashboard');  // Admin goes to Dashboard
        } else {
          navigate('/user-dashboard');  // Employees go to UserDashboard
        }
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Login failed');
      } else {
        setError('Cannot connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* HEADER */}
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your account to continue</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* EMAIL */}
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
            />
          </div>

          {/* PASSWORD */}
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
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD */}
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <Link to="/forgot-password">
              <FaQuestionCircle /> Forgot Password?
            </Link>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* FOOTER */}
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