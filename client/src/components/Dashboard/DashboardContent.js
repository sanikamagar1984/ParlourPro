import React from 'react';
import { 
  FaMoneyBillWave, 
  FaUsers, 
  FaClipboardList, 
  FaUserFriends, 
  FaCalendarDay, 
  FaCalendar, 
  FaPlus, 
  FaUserPlus, 
  FaCalendarAlt, 
  FaCut, 
  FaTint, 
  FaPalette 
} from 'react-icons/fa';

const DashboardContent = ({ user, stats, dailyRecords, setActiveTab }) => (
  <div className="dashboard-content">
    <div className="welcome-section">
      <h1>Welcome back, {user?.name || 'Admin'}!</h1>
      <p>Here's what's happening with your business today.</p>
    </div>
    
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <FaMoneyBillWave />
        </div>
        <div className="stat-info">
          <h3>₹{stats.dailyIncome.toLocaleString()}</h3>
          <p>Today's Income</p>
        </div>
      </div>
      
   
      
      <div className="stat-card">
        <div className="stat-icon">
          <FaClipboardList />
        </div>
        <div className="stat-info">
          <h3>{stats.totalServices}</h3>
          <p>Total Services</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <FaUserFriends />
        </div>
        <div className="stat-info">
          <h3>{stats.totalStaff}</h3>
          <p>Staff Members</p>
        </div>
      </div>
    </div>
    
    <div className="income-stats">
      <div className="income-card">
        <div className="income-icon">
          <FaCalendarDay />
        </div>
        <div className="income-details">
          <h3>₹{stats.weeklyIncome.toLocaleString()}</h3>
          <p>Weekly Income</p>
        </div>
      </div>
      
      <div className="income-card">
        <div className="income-icon">
          <FaCalendar />
        </div>
        <div className="income-details">
          <h3>₹{stats.monthlyIncome.toLocaleString()}</h3>
          <p>Monthly Income</p>
        </div>
      </div>
    </div>
    
    <div className="quick-actions">
      <h2>Quick Actions</h2>
      <div className="action-buttons">
        <button className="action-btn" onClick={() => setActiveTab('record-management')}>
          <FaCalendarAlt /> Add Today's Record
        </button>
        <button className="action-btn" onClick={() => setActiveTab('manage-services')}>
          <FaPlus /> Add New Service
        </button>
        <button className="action-btn" onClick={() => setActiveTab('staff-management')}>
          <FaUserPlus /> Add Staff
        </button>
        <button className="action-btn" onClick={() => setActiveTab('customer-management')}>
          <FaUsers /> Add Customer
        </button>
      </div>
    </div>
    
    <div className="recent-activity">
      <h2>Recent Records</h2>
      <div className="activity-list">
        {dailyRecords.slice(0, 5).map(record => (
          <div key={record.id} className="activity-item">
            <div className="activity-icon">
              {record.category === 'hair' ? <FaCut /> : 
               record.category === 'skin' ? <FaTint /> : 
               <FaPalette />}
            </div>
            <div className="activity-details">
              <p><strong>{record.customerName}</strong> - {record.serviceName}</p>
              <span className="activity-time">Date: {record.date}</span>
            </div>
            <div className="activity-amount">₹{record.price}</div>
          </div>
        ))}
        {dailyRecords.length === 0 && (
          <div className="no-data">
            <p>No records yet. Add your first record!</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default DashboardContent;