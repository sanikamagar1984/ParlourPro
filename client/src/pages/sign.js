import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './../css/sign.css';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaHome,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

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

  // ================= VALIDATION FUNCTIONS =================

  const isValidName = (name) => /^[A-Za-z ]+$/.test(name);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Indian mobile number: starts with 6–9 and exactly 10 digits
  const isValidPhone = (phone) =>
    /^[6-9]\d{9}$/.test(phone);

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter required');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter required');
    if (!/\d/.test(password)) errors.push('One number required');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push('One special character required');

    return errors;
  };

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone number: allow only digits & max 10
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({ ...formData, phone: numericValue });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // ================= HANDLE SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!isValidName(formData.name)) {
      setError('Name should contain only letters');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.phone) {
      setError('Mobile number is required');
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        }
      );

      if (response.data.success) {
        alert('Account created successfully! You can now login.');
        navigate('/login');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Signup failed');
      } else {
        setError('Cannot connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us and start your journey</p>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label><FaUser /> Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label><FaEnvelope /> Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label><FaPhone /> Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
              inputMode="numeric"
              pattern="[6-9]{1}[0-9]{9}"
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (!/^[6-9]\d{9}$/.test(pasted)) {
                  e.preventDefault();
                }
              }}
            />
          </div>

          <div className="form-group">
            <label><FaLock /> Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
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

          <div className="form-group">
            <label><FaLock /> Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
          <Link to="/" className="back-home">
            <FaHome /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sign;