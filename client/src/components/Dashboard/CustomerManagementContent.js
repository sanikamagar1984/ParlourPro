import React from 'react';
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf, FaEdit, FaUserPlus, FaTimes, FaTrash, FaUserCircle } from 'react-icons/fa';

const CustomerManagementContent = ({
  customers,
  customerForm,
  setCustomerForm,
  handleCustomerSubmit,
  editCustomer,
  deleteCustomer,
  customerSearch,
  setCustomerSearch,
  getFilteredCustomers,
  generateReport
}) => (
  <div className="customer-management">
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
              <button onClick={() => deleteCustomer(customer.id)} className="btn-delete"><FaTrash /> Delete</button>
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

export default CustomerManagementContent;