import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaHome, FaArrowLeft } from 'react-icons/fa';
import './../css/forgot.css'; // We'll create this CSS

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Call backend API for password reset
      const response = await axios.post('http://localhost:5000/forgot-password', {
        email,
      });
      
      setMessage(response.data.message || 'Password reset link sent to your email');
      setEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error sending reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p>Enter your email to reset your password</p>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"/>
            </svg>
            <span>{message}</span>
          </div>
        )}

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <FaEnvelope />
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="help-text">
                We'll send a password reset link to this email
              </p>
            </div>

            <button 
              type="submit" 
              className={`auth-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="email-sent">
            <div className="success-icon">✓</div>
            <h3>Check Your Email</h3>
            <p>We've sent password reset instructions to:</p>
            <p className="sent-email">{email}</p>
            <div className="instructions">
              <p>• Check your inbox and spam folder</p>
              <p>• Click the reset link in the email</p>
              <p>• Follow instructions to create a new password</p>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="back-login">
            <FaArrowLeft />
            Back to Login
          </Link>
          
          <Link to="/" className="back-home">
            <FaHome />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;