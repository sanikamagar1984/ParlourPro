import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './../css/login.css';
import { FaEnvelope, FaLock, FaHome, FaQuestionCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      
      if (response.data.success) {
        alert('✅ Login successful!');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <FaEnvelope />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {/* Centered Forgot Password */}
          <div style={{ 
            textAlign: 'center', 
            margin: '15px 0 25px 0' 
          }}>
            <Link 
              to="/forgot-password" 
              style={{ 
                color: '#3498db',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaQuestionCircle /> Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Verifying from Database...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? {'  '}
            <Link to="/sign"> <br/> Sign Up  </Link>
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

export default Login;