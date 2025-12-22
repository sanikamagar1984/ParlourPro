import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './../css/sign.css';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';

function Sign() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    return errors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  // Validate all fields
  if (!formData.name.trim()) {
    setError('Name is required');
    return;
  }
  
  if (!formData.email.trim()) {
    setError('Email is required');
    return;
  }
  
  if (!formData.phone.trim()) {
    setError('Phone number is required');
    return;
  }
  
  // Validate password
  const passwordErrors = validatePassword(formData.password);
  if (passwordErrors.length > 0) {
    setError(passwordErrors.join('. '));
    return;
  }
  
  // Check if passwords match
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/signup', {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    });
    
    if (response.data.success) {
      alert('Account created successfully! You can now login.');
      navigate('/login');
    }
  } catch (err) {
    if (err.response) {
      setError(err.response.data?.error || 'Signup failed. Please try again.');
    } else if (err.request) {
      setError('Cannot connect to server. Make sure backend is running on port 5000.');
      console.error('Backend connection error:', err.message);
    } else {
      setError('Something went wrong. Please try again.');
      console.error('Signup error:', err.message);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us and start your journey</p>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <FaUser />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaEnvelope />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaPhone />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%',
                  paddingRight: '45px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#3498db',
                  padding: '8px',
                  fontSize: '18px',
                  zIndex: '10'
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 
                  <FaEyeSlash style={{ color: '#e74c3c' }} /> : 
                  <FaEye style={{ color: '#3498db' }} />
                }
              </button>
            </div>
            <div className="password-hint">
              <small>Password must be at least 8 characters with uppercase, lowercase, number, and special character</small>
            </div>
          </div>

          <div className="form-group">
            <label>
              <FaLock />
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%',
                  paddingRight: '45px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#3498db',
                  padding: '8px',
                  fontSize: '18px',
                  zIndex: '10'
                }}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? 
                  <FaEyeSlash style={{ color: '#e74c3c' }} /> : 
                  <FaEye style={{ color: '#3498db' }} />
                }
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
          
          <Link to="/" className="back-home">
            <FaHome />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sign;