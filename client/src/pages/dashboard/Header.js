import React from 'react';

function Header() {
  return (
    <div className="dashboard-header">
      <div className="welcome-text">
        <h3>Welcome, Admin!</h3>
        <p>Friday, 15 Dec 2023</p>
      </div>
      
      <div className="header-actions">
        <input type="text" placeholder="🔍 Search..." />
        <button className="notification-btn">🔔</button>
        <button className="profile-btn">👤</button>
      </div>
    </div>
  );
}

export default Header;