import React from 'react';
import { FaMoneyBillWave, FaUsers, FaUserTie, FaCut, FaClipboardList, FaUserFriends, FaHistory } from 'react-icons/fa';

function DashboardContent({ user, stats, setActiveTab }) {
  
  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Welcome back, {user?.name || 'Admin'}!</h1>
        <p>Here's what's happening with your business today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card daily-income">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-details">
            <h3>Today's Income</h3>
            <p className="stat-value">₹{stats.dailyIncome.toLocaleString('en-IN')}</p>
            <span className="stat-label">{stats.todayAppointments} services completed</span>
          </div>
        </div>

        <div className="stat-card monthly-income">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-details">
            <h3>Monthly Income</h3>
            <p className="stat-value">₹{stats.monthlyIncome.toLocaleString('en-IN')}</p>
            <span className="stat-label">This month's total</span>
          </div>
        </div>

        <div className="stat-card customers">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>Total Customers</h3>
            <p className="stat-value">{stats.totalCustomers}</p>
            <span className="stat-label">Registered customers</span>
          </div>
        </div>

        <div className="stat-card staff">
          <div className="stat-icon">
            <FaUserTie />
          </div>
          <div className="stat-details">
            <h3>Staff Members</h3>
            <p className="stat-value">{stats.totalStaff}</p>
            <span className="stat-label">Active employees</span>
          </div>
        </div>

        <div className="stat-card services">
          <div className="stat-icon">
            <FaCut />
          </div>
          <div className="stat-details">
            <h3>Total Services</h3>
            <p className="stat-value">{stats.totalServices}</p>
            <span className="stat-label">Available services</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="action-btn"
            onClick={() => setActiveTab('manage-services')}
          >
            <FaClipboardList /> Manage Services
          </button>
          <button 
            className="action-btn"
            onClick={() => setActiveTab('staff-management')}
          >
            <FaUserFriends /> Staff Management
          </button>
          <button 
            className="action-btn"
            onClick={() => setActiveTab('customer-management')}
          >
            <FaUsers /> Customer Management
          </button>
          <button 
            className="action-btn"
            onClick={() => setActiveTab('record-management')}
          >
            <FaHistory /> View All Records
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;