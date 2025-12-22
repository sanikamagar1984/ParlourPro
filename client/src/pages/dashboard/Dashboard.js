import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsCard from './StatsCard';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="dashboard-content">
          <h1>Welcome to Parlour Management</h1>
          
          <div className="stats-grid">
            <StatsCard 
              title="Today's Appointments" 
              value="12" 
              icon="📅"
              color="#3498db"
            />
            <StatsCard 
              title="Monthly Revenue" 
              value="₹45,200" 
              icon="💰"
              color="#2ecc71"
            />
            <StatsCard 
              title="New Customers" 
              value="8" 
              icon="👥"
              color="#9b59b6"
            />
            <StatsCard 
              title="Services Booked" 
              value="24" 
              icon="💅"
              color="#e74c3c"
            />
          </div>
          
          <div className="quick-actions">
            <button className="action-btn">📅 Book Appointment</button>
            <button className="action-btn">👥 Add Customer</button>
            <button className="action-btn">💅 Add Service</button>
            <button className="action-btn">💰 Generate Bill</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;