import React from 'react';
import { FaSearch, FaFileCsv, FaFileExcel, FaFilePdf, FaSave, FaTimes, FaTrash } from 'react-icons/fa';

const RecordManagementContent = ({
  customers,
  hairServices,
  skinServices,
  tattooServices,
  dailyRecords,
  recordForm,
  setRecordForm,
  handleRecordSubmit,
  deleteRecord,
  getAllServices,
  handleServiceSelect,
  handleCustomerSelect,
  dateFilter,
  setDateFilter,
  dateRange,
  setDateRange,
  recordSearch,
  setRecordSearch,
  getFilteredRecords,
  calculateIncome,
  generateReport,
  exportToCSV,
  exportToExcel,
  exportToPDF,
  showNotification
}) => {
  const filteredRecords = getFilteredRecords();
  const totalIncome = calculateIncome();
  
  // Function to handle manual customer name input
  const handleManualCustomerChange = (e) => {
    setRecordForm({
      ...recordForm,
      customerId: 'new', // Set to 'new' to indicate manual input
      customerName: e.target.value
    });
  };
  
  // Function to handle manual phone input
  const handleManualPhoneChange = (e) => {
    setRecordForm({
      ...recordForm,
      phone: e.target.value
    });
  };
  
  // Function to generate report with total income
  const generateRecordsReport = (format) => {
    const data = filteredRecords;
    let filename = '';
    let dateRangeText = '';
    
    switch(dateFilter) {
      case 'today':
        filename = `records-report-today-${new Date().toISOString().split('T')[0]}`;
        dateRangeText = `Today: ${new Date().toISOString().split('T')[0]}`;
        break;
      case 'specific-date':
        filename = `records-report-specific-${dateRange.start}`;
        dateRangeText = `Date: ${dateRange.start}`;
        break;
      case 'date-range':
        filename = `records-report-range-${dateRange.start}-to-${dateRange.end}`;
        dateRangeText = `Date Range: ${dateRange.start} to ${dateRange.end}`;
        break;
      default:
        filename = `records-report-all-${new Date().toISOString().split('T')[0]}`;
        dateRangeText = 'All Records';
    }
    
    if (data.length === 0) {
      showNotification('Error', 'No data found to export', 'error');
      return;
    }
    
    // Prepare data for export
    const exportData = data.map(record => ({
      Date: record.date,
      Customer: record.customerName,
      Phone: record.phone || '-',
      Service: record.serviceName,
      Category: record.category,
      Price: `₹${record.price}`,
      'Payment Method': record.paymentMethod,
      Notes: record.notes || '-'
    }));
    
    switch(format) {
      case 'csv':
        // Add total row to CSV
        const csvData = [...exportData, {
          Date: '',
          Customer: '',
          Phone: '',
          Service: '',
          Category: 'TOTAL INCOME',
          Price: `₹${totalIncome}`,
          'Payment Method': `${filteredRecords.length} records`,
          Notes: dateRangeText
        }];
        exportToCSV(csvData, filename);
        break;
        
      case 'excel':
        // Add total row to Excel
        const excelData = [...exportData, {
          Date: '',
          Customer: '',
          Phone: '',
          Service: '',
          Category: 'TOTAL INCOME',
          Price: `₹${totalIncome}`,
          'Payment Method': `${filteredRecords.length} records`,
          Notes: dateRangeText
        }];
        exportToExcel(excelData, filename);
        break;
        
      case 'pdf':
        // For PDF, use the custom options
        const pdfData = exportData;
        exportToPDF(pdfData, filename, {
          showTotal: true,
          totalIncome: totalIncome,
          recordCount: filteredRecords.length,
          dateRangeText: dateRangeText,
          title: 'Service Records Report'
        });
        break;
    }
  };
  
  return (
    <div className="record-management">
      <div className="section-header">
        <h1>Record Management</h1>
        <p>Add and manage daily service records</p>
      </div>
      
      <div className="record-form-section">
        <h2>Add New Record</h2>
        <form onSubmit={handleRecordSubmit} className="record-form">
          <div className="form-grid">
            {/* Customer Selection - Dropdown and Manual Input */}
            <div className="form-group">
              <label>Customer (Optional)</label>
              <select 
                value={recordForm.customerId} 
                onChange={(e) => handleCustomerSelect(e.target.value)}
              >
                <option value="">-- Select Existing Customer --</option>
                <option value="new">-- Add New Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Manual Customer Name Input (shown when "New Customer" selected or empty) */}
            {(recordForm.customerId === 'new' || !recordForm.customerId) && (
              <div className="form-group">
                <label>Customer Name (Optional)</label>
                <input 
                  type="text" 
                  value={recordForm.customerName} 
                  onChange={handleManualCustomerChange} 
                  placeholder="Enter customer name (optional)" 
                />
                <small className="form-hint">Leave blank for "Walk-in Customer"</small>
              </div>
            )}
            
            {/* Phone Number Input */}
            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input 
                type="tel" 
                value={recordForm.phone} 
                onChange={handleManualPhoneChange} 
                placeholder="Enter phone number (optional)" 
                className={recordForm.customerId && recordForm.customerId !== 'new' ? 'read-only' : ''}
                readOnly={recordForm.customerId && recordForm.customerId !== 'new'}
              />
              <small className="form-hint">
                {recordForm.customerId && recordForm.customerId !== 'new' 
                  ? 'Auto-filled from customer selection' 
                  : 'Enter phone for new customer'}
              </small>
            </div>
            
            {/* Service Selection */}
            <div className="form-group">
              <label>Select Service *</label>
              <select 
                value={recordForm.serviceId} 
                onChange={(e) => handleServiceSelect(e.target.value)} 
                required
              >
                <option value="">-- Select Service --</option>
                <optgroup label="Hair Services">
                  {hairServices.map(service => (
                    <option key={service.id} value={service.id}>{service.name} - ₹{service.price}</option>
                  ))}
                </optgroup>
                <optgroup label="Skin Services">
                  {skinServices.map(service => (
                    <option key={service.id} value={service.id}>{service.name} - ₹{service.price}</option>
                  ))}
                </optgroup>
                <optgroup label="Tattoo Services">
                  {tattooServices.map(service => (
                    <option key={service.id} value={service.id}>{service.name} - ₹{service.price}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <input type="text" value={recordForm.category} readOnly className="read-only" />
            </div>
            
            <div className="form-group">
              <label>Price (₹) *</label>
              <input 
                type="number" 
                value={recordForm.price} 
                onChange={(e) => setRecordForm({...recordForm, price: e.target.value})} 
                placeholder="Enter amount" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Payment Method</label>
              <select 
                value={recordForm.paymentMethod} 
                onChange={(e) => setRecordForm({...recordForm, paymentMethod: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="online">Online</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={recordForm.date} 
                onChange={(e) => setRecordForm({...recordForm, date: e.target.value})} 
              />
            </div>
            
            <div className="form-group full-width">
              <label>Notes (Optional)</label>
              <textarea 
                value={recordForm.notes} 
                onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})} 
                placeholder="Any additional notes..." 
                rows="2" 
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary"><FaSave /> Save Record</button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setRecordForm({
                customerId: '', 
                customerName: '', 
                phone: '', 
                serviceId: '', 
                serviceName: '', 
                category: 'hair', 
                price: '', 
                paymentMethod: 'cash', 
                date: new Date().toISOString().split('T')[0], 
                notes: ''
              })}
            >
              <FaTimes /> Clear Form
            </button>
          </div>
        </form>
      </div>
      
      <div className="records-list-section">
        <div className="section-header">
          <h2>
            Records ({filteredRecords.length}) - 
            <span style={{ color: '#8b4513', marginLeft: '10px' }}>
              Total Income: ₹{totalIncome.toLocaleString()}
            </span>
          </h2>
          <div className="filter-controls">
            <div className="search-bar">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search records..." 
                value={recordSearch} 
                onChange={(e) => setRecordSearch(e.target.value)} 
                className="search-input" 
              />
            </div>
            
            <div className="filter-group">
              <label>Filter:</label>
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Records</option>
                <option value="today">Today</option>
                <option value="specific-date">Specific Date</option>
                <option value="date-range">Date Range</option>
              </select>
            </div>
            
            {dateFilter === 'specific-date' && (
              <div className="filter-group">
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                />
              </div>
            )}
            
            {dateFilter === 'date-range' && (
              <>
                <div className="filter-group">
                  <label>From:</label>
                  <input 
                    type="date" 
                    value={dateRange.start} 
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                  />
                </div>
                <div className="filter-group">
                  <label>To:</label>
                  <input 
                    type="date" 
                    value={dateRange.end} 
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                  />
                </div>
              </>
            )}
            
            <div className="export-options">
              <button onClick={() => generateRecordsReport('csv')} className="export-btn"><FaFileCsv /> CSV</button>
              <button onClick={() => generateRecordsReport('excel')} className="export-btn"><FaFileExcel /> XLS</button>
              <button onClick={() => generateRecordsReport('pdf')} className="export-btn"><FaFilePdf /> PDF</button>
            </div>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Category</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.customerName}</td>
                  <td>{record.phone || '-'}</td>
                  <td>{record.serviceName}</td>
                  <td><span className={`category-badge ${record.category}`}>{record.category}</span></td>
                  <td className="price-cell">₹{record.price}</td>
                  <td><span className={`payment-badge ${record.paymentMethod}`}>{record.paymentMethod}</span></td>
                  <td className="action-buttons">
                    <button onClick={() => {
                      if (window.confirm('Delete this record?')) {
                        deleteRecord(record.id);
                      }
                    }} className="btn-delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr><td colSpan="8" className="no-data">No records found.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="5" className="total-label">
                  <strong>Total Income ({filteredRecords.length} records):</strong>
                </td>
                <td className="total-amount"><strong>₹{totalIncome.toLocaleString()}</strong></td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecordManagementContent;