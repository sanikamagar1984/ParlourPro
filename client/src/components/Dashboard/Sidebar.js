import React from 'react';
import { FaTimes, FaChartLine, FaClipboardList, FaUsers, FaHistory, FaSignOutAlt, FaUserCircle, FaUserFriends } from 'react-icons/fa';

const Sidebar = ({ 
  sidebarOpen, 
  mobileSidebarOpen, 
  user, 
  activeTab, 
  setActiveTab, 
  setMobileSidebarOpen, 
  handleLogout,
  isUserDashboard = false
}) => {
  // Determine if this is an employee dashboard
  const isEmployee = isUserDashboard || user?.role === 'employee';
  
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <h2>ParlourPro</h2>
          {/* Show different panel name based on user role */}
          <p>{isEmployee ? 'Employee Panel' : 'Admin Panel'}</p>
        </div>
        <button className="mobile-close" onClick={() => setMobileSidebarOpen(false)}>
          <FaTimes />
        </button>
      </div>
      
      <div className="user-info">
        <div className="user-avatar">
          <FaUserCircle />
        </div>
        <div className="user-details">
          <h4>{user?.name || (isEmployee ? 'Employee' : 'Admin User')}</h4>
          {/* Show the actual role from user object */}
          <p>{user?.role || (isEmployee ? 'employee' : 'admin')}</p>
          <p className="user-email">{user?.email || (isEmployee ? 'employee@parlour.com' : 'admin@parlour.com')}</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => {setActiveTab('dashboard'); setMobileSidebarOpen(false);}}>
            <FaChartLine /> <span>Dashboard</span>
          </li>
          <li className={activeTab === 'manage-services' ? 'active' : ''} onClick={() => {setActiveTab('manage-services'); setMobileSidebarOpen(false);}}>
            <FaClipboardList /> <span>Manage Services</span>
          </li>
          {/* Hide Staff Management for employees */}
          {!isEmployee && (
            <li className={activeTab === 'staff-management' ? 'active' : ''} onClick={() => {setActiveTab('staff-management'); setMobileSidebarOpen(false);}}>
              <FaUserFriends /> <span>Staff Management</span>
            </li>
          )}
          <li className={activeTab === 'customer-management' ? 'active' : ''} onClick={() => {setActiveTab('customer-management'); setMobileSidebarOpen(false);}}>
            <FaUsers /> <span>Customer Management</span>
          </li>
          <li className={activeTab === 'record-management' ? 'active' : ''} onClick={() => {setActiveTab('record-management'); setMobileSidebarOpen(false);}}>
            <FaHistory /> <span>Record Management</span>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;