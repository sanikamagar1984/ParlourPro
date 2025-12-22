import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">💅 Parlour</h2>
      
      <div className="sidebar-menu">
        <Link to="/dashboard" className="menu-item active">🏠 Dashboard</Link>
        <Link to="/appointments" className="menu-item">📅 Appointments</Link>
        <Link to="/services" className="menu-item">💅 Services</Link>
        <Link to="/customers" className="menu-item">👥 Customers</Link>
        <Link to="/billing" className="menu-item">💰 Billing</Link>
        <Link to="/reports" className="menu-item">📊 Reports</Link>
      </div>
      
      <button className="logout-btn">🚪 Logout</button>
    </div>
  );
}

export default Sidebar;