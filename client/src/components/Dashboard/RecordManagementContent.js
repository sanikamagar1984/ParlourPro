import React, { useEffect } from 'react';
import { FaTrash, FaSearch, FaFilter, FaFileDownload, FaCalendarAlt } from 'react-icons/fa';

function RecordManagementContent({
  customers,
  hairServices,
  skinServices,
  tattooServices,
  piercingServices,
  dailyRecords,
  recordForm,
  setRecordForm,
  handleRecordSubmit,
  deleteRecord,
  deleteAllRecords,
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
  exportToCSV,
  exportToExcel,
  exportToPDF,
  showNotification,
  formatDateToDDMMYYYY
}) {
  
  // ✅ Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ✅ Initialize date range on component mount AND set form date to today
  useEffect(() => {
    const today = getTodayDate();
    setDateRange({
      start: today,
      end: today
    });
    setDateFilter('all');
    
    // ✅ IMPORTANT: Always set the form date to today when component mounts
    setRecordForm(prev => ({
      ...prev,
      date: today
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Handle date filter changes
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    const today = getTodayDate();
    const now = new Date();
    
    console.log('Filter changed to:', filter);
    console.log('Today date:', today);
    
    if (filter === 'today') {
      setDateRange({ start: today, end: today });
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const year = startOfMonth.getFullYear();
      const month = String(startOfMonth.getMonth() + 1).padStart(2, '0');
      const day = String(startOfMonth.getDate()).padStart(2, '0');
      const monthStart = `${year}-${month}-${day}`;
      
      setDateRange({
        start: monthStart,
        end: today
      });
    } else if (filter === 'specific-date') {
      // Keep current date range or set to today
      if (!dateRange.start) {
        setDateRange({ start: today, end: today });
      }
    } else if (filter === 'date-range') {
      // Set default range to last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const year = lastWeek.getFullYear();
      const month = String(lastWeek.getMonth() + 1).padStart(2, '0');
      const day = String(lastWeek.getDate()).padStart(2, '0');
      const weekStart = `${year}-${month}-${day}`;
      
      setDateRange({
        start: weekStart,
        end: today
      });
    }
    // 'all' filter doesn't need date range adjustment
  };

  // ✅ Handle specific date input change
  const handleDateInputChange = (value) => {
    setDateRange({ 
      start: value, 
      end: value 
    });
  };

  // ✅ Handle service selection
  const onServiceSelect = (serviceId) => {
    handleServiceSelect(serviceId);
  };

  // ✅ Handle customer selection
  const onCustomerSelect = (customerId) => {
    handleCustomerSelect(customerId);
  };

  // ✅ Clear form function - UPDATED to reset date to today
  const clearForm = () => {
    setRecordForm({
      customerId: '',
      customerName: '',
      phone: '',
      serviceId: '',
      category: '',
      price: '',
      paymentMethod: 'cash',
      date: getTodayDate(), // ✅ Always reset to today's date
      notes: ''
    });
  };

  // ✅ Get all services in a single array
  const getAllServicesArray = () => {
    return [
      ...hairServices.map(s => ({...s, category: 'hair'})),
      ...skinServices.map(s => ({...s, category: 'skin'})),
      ...tattooServices.map(s => ({...s, category: 'tattoo'})),
      ...piercingServices.map(s => ({...s, category: 'piercing'}))
    ];
  };

  // ✅ Calculate total income
  const totalIncome = calculateIncome ? calculateIncome() : 0;
  
  // ✅ Get filtered records
  const filteredRecords = getFilteredRecords ? getFilteredRecords() : [];

  // ✅ Export function
  const handleExport = (format) => {
    const records = filteredRecords.map(record => ({
      Date: formatDateToDDMMYYYY(record.date),
      Customer: record.customer_name || 'Walk-in Customer',
      Phone: record.phone || '-',
      Service: record.service_name || '-',
      Category: record.category || '-',
      Price: `₹${record.price || 0}`,
      'Payment Method': record.payment_method || '-',
      Notes: record.notes || '-'
    }));

    if (records.length === 0) {
      showNotification('Info', 'No records to export', 'info');
      return;
    }

    let filename = 'records-report-all';
    let dateRangeText = 'All Records';

    if (dateFilter === 'today') {
      filename = `records-report-today-${getTodayDate()}`;
      dateRangeText = `Today's Records - ${formatDateToDDMMYYYY(getTodayDate())}`;
    } else if (dateFilter === 'month') {
      const now = new Date();
      dateRangeText = `This Month's Records - ${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`;
      filename = `records-report-month-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (dateFilter === 'specific-date') {
      filename = `records-report-${dateRange.start}`;
      dateRangeText = `Records for ${formatDateToDDMMYYYY(dateRange.start)}`;
    } else if (dateFilter === 'date-range') {
      filename = `records-report-${dateRange.start}-to-${dateRange.end}`;
      dateRangeText = `Records from ${formatDateToDDMMYYYY(dateRange.start)} to ${formatDateToDDMMYYYY(dateRange.end)}`;
    }

    const options = {
      recordCount: records.length,
      totalIncome: totalIncome,
      dateRangeText: dateRangeText,
      showTotal: true
    };

    if (format === 'csv') {
      exportToCSV(records, filename);
    } else if (format === 'excel') {
      exportToExcel(records, filename);
    } else if (format === 'pdf') {
      exportToPDF(records, filename, options);
    }

    showNotification('Success', `Exported ${records.length} records as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div className="record-management-content">
      <div className="content-header">
        <div>
          <h2>Record Management</h2>
          <p className="subtitle">Add and manage daily service records</p>
        </div>
      </div>

      {/* Add New Record Form */}
      <div className="record-form-card">
        <h3>Add New Record</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleRecordSubmit(e);
        }} className="record-form">
          <div className="form-row">
            {/* Customer Selection */}
            <div className="form-group">
              <label>Customer (Optional)</label>
              <select
                value={recordForm.customerId || ''}
                onChange={(e) => onCustomerSelect(e.target.value)}
                className="form-control"
              >
                <option value="">-- Select Existing Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
                <option value="new">+ Add New Customer</option>
              </select>
              <small className="form-text">Select "Add New Customer" to enter manually</small>
            </div>

            {/* Customer Name */}
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter customer name (optional)"
                value={recordForm.customerName || ''}
                onChange={(e) => setRecordForm({ ...recordForm, customerName: e.target.value })}
              />
              <small className="form-text">Leave blank for "Walk-in Customer"</small>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Enter phone number (optional)"
                value={recordForm.phone || ''}
                onChange={(e) => setRecordForm({ ...recordForm, phone: e.target.value })}
                pattern="[0-9]{10}"
                maxLength="10"
              />
              <small className="form-text">Enter 10-digit phone number</small>
            </div>
          </div>

          <div className="form-row">
            {/* Service Selection */}
            <div className="form-group">
              <label>Select Service *</label>
              <select
                value={recordForm.serviceId || ''}
                onChange={(e) => onServiceSelect(e.target.value)}
                className="form-control"
                required
              >
                <option value="">-- Select Service --</option>
                {hairServices.length > 0 && (
                  <optgroup label="Hair Services">
                    {hairServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </optgroup>
                )}
                {skinServices.length > 0 && (
                  <optgroup label="Skin Services">
                    {skinServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </optgroup>
                )}
                {tattooServices.length > 0 && (
                  <optgroup label="Tattoo Services">
                    {tattooServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </optgroup>
                )}
                {piercingServices.length > 0 && (
                  <optgroup label="Piercing Services">
                    {piercingServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                className="form-control"
                value={recordForm.category || ''}
                readOnly
                placeholder="Category will auto-fill"
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                value={recordForm.price || ''}
                onChange={(e) => setRecordForm({ ...recordForm, price: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            {/* Payment Method */}
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={recordForm.paymentMethod || 'cash'}
                onChange={(e) => setRecordForm({ ...recordForm, paymentMethod: e.target.value })}
                className="form-control"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            {/* Date - FIXED to always show today by default */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={recordForm.date || getTodayDate()}
                onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                max={getTodayDate()}
              />
            </div>

            {/* Notes */}
            <div className="form-group notes-group">
              <label>Notes (Optional)</label>
              <textarea
                className="form-control"
                placeholder="Any additional notes..."
                value={recordForm.notes || ''}
                onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <FaCalendarAlt /> Save Record
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearForm}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Records List Section */}
      <div className="records-list-section">
        <div className="records-header">
          <h3>
            Records ({filteredRecords.length}) - Total Income: ₹{totalIncome.toLocaleString('en-IN')}
          </h3>
          
          {/* Search and Filters */}
          <div className="records-controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by customer, service, phone..."
                value={recordSearch || ''}
                onChange={(e) => setRecordSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label><FaFilter /> Filter:</label>
              <select
                value={dateFilter || 'all'}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Records</option>
                <option value="today">Today</option>
                <option value="specific-date">Specific Date</option>
                <option value="date-range">Date Range</option>
                <option value="month">This Month</option>
              </select>

              {dateFilter === 'specific-date' && (
                <input
                  type="date"
                  className="date-input"
                  value={dateRange.start || getTodayDate()}
                  onChange={(e) => handleDateInputChange(e.target.value)}
                  max={getTodayDate()}
                />
              )}

              {dateFilter === 'date-range' && (
                <div className="date-range-inputs">
                  <input
                    type="date"
                    className="date-input"
                    value={dateRange.start || getTodayDate()}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    max={getTodayDate()}
                  />
                  <span className="date-range-separator">to</span>
                  <input
                    type="date"
                    className="date-input"
                    value={dateRange.end || getTodayDate()}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    max={getTodayDate()}
                  />
                </div>
              )}
            </div>

            <div className="export-buttons">
              <button onClick={() => handleExport('csv')} className="btn-export btn-csv">
                <FaFileDownload /> CSV
              </button>
              <button onClick={() => handleExport('excel')} className="btn-export btn-xls">
                <FaFileDownload /> XLS
              </button>
              <button onClick={() => handleExport('pdf')} className="btn-export btn-pdf">
                <FaFileDownload /> PDF
              </button>
              {filteredRecords.length > 0 && (
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL records? This action cannot be undone.')) {
                      deleteAllRecords();
                    }
                  }} 
                  className="btn-export btn-delete-all"
                  title="Delete all records permanently"
                >
                  <FaTrash /> Delete All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>CUSTOMER</th>
                <th>PHONE</th>
                <th>SERVICE</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>PAYMENT</th>
                <th>NOTES</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-records">
                    {recordSearch || dateFilter !== 'all' 
                      ? 'No records found matching your filters.' 
                      : 'No records yet. Add a new record above.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id || record._id}>
                    <td className="date-cell">
                      {formatDateToDDMMYYYY ? formatDateToDDMMYYYY(record.date) : record.date}
                    </td>
                    <td>{record.customer_name || 'Walk-in Customer'}</td>
                    <td>{record.phone || '-'}</td>
                    <td>{record.service_name || '-'}</td>
                    <td>
                      <span className={`category-badge ${record.category || 'hair'}`}>
                        {(record.category || 'hair').toUpperCase()}
                      </span>
                    </td>
                    <td className="price-cell">₹{record.price || 0}</td>
                    <td>
                      <span className={`payment-badge ${record.payment_method || 'cash'}`}>
                        {(record.payment_method || 'cash').toUpperCase()}
                      </span>
                    </td>
                    <td className="notes-cell">{record.notes || '-'}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this record?')) {
                            deleteRecord(record.id || record._id);
                          }
                        }}
                        className="btn-delete"
                        title="Delete Record"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        {filteredRecords.length > 0 && (
          <div className="records-summary">
            <div className="summary-content">
              <span className="summary-label">Total Records:</span>
              <span className="summary-value">{filteredRecords.length}</span>
              <span className="summary-label">Total Income:</span>
              <span className="summary-value total-amount">₹{totalIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecordManagementContent;