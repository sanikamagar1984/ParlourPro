import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaMoneyBillWave, 
  FaClipboardList,
  FaClock,
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaHome
} from 'react-icons/fa';
import '../css/UserDashboard.css';

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayIncome, setTodayIncome] = useState(0);

  useEffect(() => {
    // Check authentication
    axios.get('http://localhost:5000/api/auth/me', {
      withCredentials: true
    })
    .then(res => {
      if (!res.data.authenticated) {
        navigate('/login');
      } else {
        setUser(res.data.user);
        fetchEmployeeData();
      }
    })
    .catch(() => {
      navigate('/login');
    });
  }, [navigate]);

  const fetchEmployeeData = async () => {
    try {
      // Mock data for employee dashboard
      setTodayAppointments([
        { id: 1, customer: 'Priya Sharma', service: 'Haircut', time: '10:30 AM', status: 'Upcoming' },
        { id: 2, customer: 'Rahul Verma', service: 'Facial', time: '11:45 AM', status: 'Upcoming' },
        { id: 3, customer: 'Neha Singh', service: 'Waxing', time: '2:15 PM', status: 'Upcoming' },
        { id: 4, customer: 'Anjali Patil', service: 'Manicure', time: '3:30 PM', status: 'Completed' },
      ]);
      
      setTodayIncome(4500);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const markAsComplete = (appointmentId) => {
    alert(`Marked appointment ${appointmentId} as complete`);
    // Update local state
    setTodayAppointments(prev => 
      prev.map(app => 
        app.id === appointmentId ? { ...app, status: 'Completed' } : app
      )
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Top Navigation Bar */}
      <nav className="user-navbar">
        <div className="user-navbar-left">
          <h1 className="user-logo">ParlorPro</h1>
          <div className="user-greeting">
            <FaUserCircle />
            <span>Welcome, {user?.name || 'Employee'}!</span>
          </div>
        </div>
        <div className="user-navbar-right">
          <button className="user-notification-btn">
            <FaBell />
            <span className="notification-badge">2</span>
          </button>
          <button className="user-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="user-dashboard-content">
        {/* Sidebar */}
        <aside className="user-sidebar">
          <ul className="user-sidebar-menu">
            <li className="active">
              <FaHome /> Dashboard
            </li>
            <li>
              <FaCalendarAlt /> Appointments
            </li>
            <li>
              <FaUsers /> Customers
            </li>
            <li>
              <FaMoneyBillWave /> Payments
            </li>
            <li>
              <FaClipboardList /> Services
            </li>
            <li>
              <FaClock /> Shift Timings
            </li>
          </ul>
        </aside>

        {/* Main Dashboard */}
        <main className="user-main-content">
          {/* Welcome Section */}
          <div className="user-welcome-section">
            <h2>Employee Dashboard</h2>
            <p>Manage your appointments and services</p>
          </div>

          {/* Quick Stats */}
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <div className="user-stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="user-stat-info">
                <h3>{todayAppointments.length}</h3>
                <p>Today's Appointments</p>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon">
                <FaMoneyBillWave />
              </div>
              <div className="user-stat-info">
                <h3>₹{todayIncome}</h3>
                <p>Today's Earnings</p>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon">
                <FaUsers />
              </div>
              <div className="user-stat-info">
                <h3>4</h3>
                <p>Customers Today</p>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="user-stat-icon">
                <FaClipboardList />
              </div>
              <div className="user-stat-info">
                <h3>8</h3>
                <p>Services Available</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="user-quick-actions">
            <h3>Quick Actions</h3>
            <div className="user-action-buttons">
              <button className="user-action-btn" onClick={() => navigate('/book-appointment')}>
                <FaCalendarAlt />
                <span>Book Appointment</span>
              </button>
              <button className="user-action-btn" onClick={() => navigate('/add-customer')}>
                <FaUsers />
                <span>Add Customer</span>
              </button>
              <button className="user-action-btn" onClick={() => navigate('/record-payment')}>
                <FaMoneyBillWave />
                <span>Record Payment</span>
              </button>
              <button className="user-action-btn" onClick={() => navigate('/services')}>
                <FaClipboardList />
                <span>View Services</span>
              </button>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="user-appointments-section">
            <div className="section-header">
              <h3>Today's Appointments</h3>
              <span className="date-badge">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="appointments-table">
              <div className="table-header">
                <div>Time</div>
                <div>Customer</div>
                <div>Service</div>
                <div>Status</div>
                <div>Action</div>
              </div>
              
              {todayAppointments.map(appointment => (
                <div key={appointment.id} className="table-row">
                  <div className="time-cell">
                    <FaClock /> {appointment.time}
                  </div>
                  <div className="customer-cell">{appointment.customer}</div>
                  <div className="service-cell">{appointment.service}</div>
                  <div className={`status-cell ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </div>
                  <div className="action-cell">
                    {appointment.status === 'Upcoming' && (
                      <button 
                        className="complete-btn"
                        onClick={() => markAsComplete(appointment.id)}
                      >
                        Mark Complete
                      </button>
                    )}
                    {appointment.status === 'Completed' && (
                      <span className="completed-text">✓ Done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="user-recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p><strong>Priya Sharma</strong> - Haircut completed</p>
                  <span className="activity-time">10:45 AM</span>
                </div>
                <div className="activity-amount">₹500</div>
              </div>
              <div className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p><strong>Rahul Verma</strong> - Facial completed</p>
                  <span className="activity-time">12:30 PM</span>
                </div>
                <div className="activity-amount">₹1200</div>
              </div>
              <div className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p><strong>Neha Singh</strong> - Waxing booked</p>
                  <span className="activity-time">1:15 PM</span>
                </div>
                <div className="activity-amount">₹800</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;