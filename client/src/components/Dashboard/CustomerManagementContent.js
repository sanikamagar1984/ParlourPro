import React, { useState } from 'react';
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf, FaEdit, FaUserPlus, FaTimes, FaTrash, FaUserCircle, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const CustomerManagementContent = ({
  customers,
  customerForm,
  setCustomerForm,
  handleCustomerSubmit,
  editCustomer,
  deleteCustomer, // This is passed from parent Dashboard.js
  customerSearch,
  setCustomerSearch,
  getFilteredCustomers,
  generateReport
}) => {
  // Add state for notifications
  const [notifications, setNotifications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [recordCount, setRecordCount] = useState(0);

  // Add function to show notifications
  const showNotification = (type, title, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 5000);
  };

  // Enhanced delete function with modal confirmation
// Enhanced delete function with modal confirmation
  const handleDeleteClick = async (customerId, customerName) => {
    try {
      // First check if customer has records
      const checkResponse = await fetch(`http://localhost:5000/api/customers/${customerId}/check-records`);
      const checkData = await checkResponse.json();
      
      if (checkData.recordCount > 0) {
        // Show confirmation modal
        setCustomerToDelete({ id: customerId, name: customerName });
        setRecordCount(checkData.recordCount);
        setShowDeleteModal(true);
      } else {
        // No records, call the parent's deleteCustomer function
        if (deleteCustomer) {
          await deleteCustomer(customerId);
        }
      }
    } catch (error) {
      showNotification('error', 'Error', 'Error checking customer records');
      console.error('Error:', error);
    }
  };

  // Perform the actual delete
  const performDelete = async (customerId, force = false) => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification('success', 'Success', result.message);
        // Call the original deleteCustomer function to refresh the list
        if (deleteCustomer) {
          await deleteCustomer(customerId);
        }
      } else {
        showNotification('error', 'Error', result.message || 'Failed to delete customer');
      }
    } catch (error) {
      showNotification('error', 'Network Error', 'Please try again.');
      console.error('Error:', error);
    }
  };

  // Force delete confirmation
  const handleForceDelete = () => {
    if (customerToDelete) {
      performDelete(customerToDelete.id, true);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="customer-management">
      {/* Add notifications container - matches your CSS structure */}
      <div className="notifications-container">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            <div className="notification-content">
              <div className="notification-icon">
                {notif.type === 'success' && <FaCheckCircle />}
                {notif.type === 'error' && <FaExclamationTriangle />}
                {notif.type === 'info' && <FaInfoCircle />}
              </div>
              <div className="notification-details">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
              </div>
              <button 
                className="notification-close"
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal - matches your CSS structure */}
      {showDeleteModal && customerToDelete && (
        <div className="modal">
          <div className="modal-box">
            <h3>
              <FaExclamationTriangle style={{ color: '#f59e0b', marginRight: '10px' }} />
              ⚠️ Warning!
            </h3>
            
            <div className="modal-body">
              <p style={{ marginBottom: '15px', fontSize: '16px', lineHeight: '1.5' }}>
                Customer <strong style={{ color: '#2c2c2c' }}>"{customerToDelete.name}"</strong> has{' '}
                <strong style={{ color: '#e74c3c' }}>{recordCount}</strong> service record(s).
              </p>
              
              <p style={{ marginBottom: '15px', fontSize: '15px', lineHeight: '1.5', color: '#666' }}>
                If you delete this customer, these records will show as <strong>"Unknown Customer"</strong>.
              </p>
              
              <p style={{ 
                marginBottom: '20px', 
                padding: '12px', 
                backgroundColor: '#fef2f2', 
                borderRadius: '8px',
                borderLeft: '4px solid #dc2626',
                fontSize: '15px',
                color: '#7f1d1d'
              }}>
                ⚠️ This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleForceDelete} 
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                <FaTrash /> Delete Anyway
              </button>
              
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setCustomerToDelete(null);
                }}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your existing component */}
      <div className="section-header">
        <h1>Customer Management</h1>
        <p>Manage customer details and view their history</p>
      </div>
      
      <div className="filter-section">
        <div className="filter-controls">
          <div className="search-bar">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={customerSearch} 
              onChange={(e) => setCustomerSearch(e.target.value)} 
              className="search-input" 
            />
          </div>
          <div className="export-options">
            <button onClick={() => generateReport('customers', 'csv')} className="export-btn"><FaFileCsv /> CSV</button>
            <button onClick={() => generateReport('customers', 'excel')} className="export-btn"><FaFileExcel /> XLS</button>
            <button onClick={() => generateReport('customers', 'pdf')} className="export-btn"><FaFilePdf /> PDF</button>
          </div>
        </div>
      </div>
      
      <div className="customer-form-section">
        <h2>{customerForm.id ? 'Edit Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleCustomerSubmit} className="customer-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                value={customerForm.name} 
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} 
                placeholder="Enter full name" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                value={customerForm.phone} 
                onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} 
                placeholder="10-digit mobile" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={customerForm.email} 
                onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} 
                placeholder="email@example.com" 
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                value={customerForm.address} 
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})} 
                placeholder="City, Area" 
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {customerForm.id ? <FaEdit /> : <FaUserPlus />}
              {customerForm.id ? 'Update Customer' : 'Add Customer'}
            </button>
            {customerForm.id && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setCustomerForm({ id: null, name: '', phone: '', email: '', address: '' })}
              >
                <FaTimes /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="customers-list">
        <h2>Customers ({getFilteredCustomers().length})</h2>
        <div className="customers-grid">
          {getFilteredCustomers().map(customer => (
            <div key={customer.id} className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar"><FaUserCircle /></div>
                <div className="customer-info">
                  <h3>{customer.name}</h3>
                  <p className="customer-phone">{customer.phone}</p>
                  {customer.email && <p className="customer-email">{customer.email}</p>}
                </div>
              </div>
              <div className="customer-details">
                {customer.address && (
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{customer.address}</span>
                  </div>
                )}
              </div>
              <div className="customer-actions">
                <button onClick={() => editCustomer(customer)} className="btn-edit"><FaEdit /> Edit</button>
                <button 
                  onClick={() => handleDeleteClick(customer.id, customer.name)} 
                  className="btn-delete"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
          {getFilteredCustomers().length === 0 && (
            <div className="no-data"><p>No customers found.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagementContent;