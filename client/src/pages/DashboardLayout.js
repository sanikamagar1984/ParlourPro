// DashboardLayout.js
import React from 'react';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';

const DashboardLayout = ({
  children,
  sidebarOpen,
  mobileSidebarOpen,
  user,
  activeTab,
  setActiveTab,
  setMobileSidebarOpen,
  handleLogout,
  setSidebarOpen
}) => {
  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <MobileHeader 
        setMobileSidebarOpen={setMobileSidebarOpen}
        user={user}
      />
      
      <div 
        className={`sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      
      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setMobileSidebarOpen={setMobileSidebarOpen}
        handleLogout={handleLogout}
      />
      
      <main className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <button 
          className="menu-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;