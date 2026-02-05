import React from 'react';
import {
  FaMoneyBillWave,
  FaUsers,
  FaUserTie,
  FaCut
} from 'react-icons/fa';

function DashboardContent({ user, stats = {}, setActiveTab }) {
  return (
    <div className="dashboard-content">
      {/* Welcome */}
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
            <p className="stat-value">
              ₹{(stats.dailyIncome || 0).toLocaleString('en-IN')}
            </p>
            <span className="stat-label">
              {stats.todayAppointments || 0} services completed
            </span>
          </div>
        </div>

        <div className="stat-card monthly-income">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-details">
            <h3>Monthly Income</h3>
            <p className="stat-value">
              ₹{(stats.monthlyIncome || 0).toLocaleString('en-IN')}
            </p>
            <span className="stat-label">This month's total</span>
          </div>
        </div>

        <div className="stat-card customers">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>Total Customers</h3>
            <p className="stat-value">{stats.totalCustomers || 0}</p>
            <span className="stat-label">Registered customers</span>
          </div>
        </div>

        <div className="stat-card staff">
          <div className="stat-icon">
            <FaUserTie />
          </div>
          <div className="stat-details">
            <h3>Staff Members</h3>
            <p className="stat-value">{stats.totalStaff || 0}</p>
            <span className="stat-label">Active employees</span>
          </div>
        </div>

        <div className="stat-card services">
          <div className="stat-icon">
            <FaCut />
          </div>
          <div className="stat-details">
            <h3>Total Services</h3>
            <p className="stat-value">{stats.totalServices || 0}</p>
            <span className="stat-label">Available services</span>
          </div>
        </div>
      </div>

      {/* Developer Credit (Common Line) */}
      <div className="dashboard-footer-credit">
        <p>
          © 2026 Tressence by Simi. Created & Maintained by{' '}
          <strong>Shravani Mandve</strong>
        </p>
      </div>
    </div>
  );
}

export default DashboardContent;
