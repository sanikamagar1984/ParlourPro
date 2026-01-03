import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaBars, FaTimes, FaChartLine, FaCut, FaTint, FaPalette,
  FaUsers, FaUserPlus, FaUserCircle, FaSignOutAlt, FaPlus,
  FaEdit, FaTrash, FaCalendarAlt, FaMoneyBillWave,
  FaClipboardList, FaSearch,
  FaHome, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaDownload, FaUserFriends, FaHistory, FaCalendarDay, FaFileExcel,
  FaPrint, FaSave, FaCheck, FaChevronDown, FaChevronRight,
  FaCreditCard, FaClock, FaFilter, 
  FaFilePdf, FaFileCsv, FaCalendar, FaEllipsisV, FaTimesCircle, FaChevronLeft
} from 'react-icons/fa';
import './../css/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeServiceTab, setActiveServiceTab] = useState('hair');
  
  const [stats, setStats] = useState({
    dailyIncome: 0,
    weeklyIncome: 0,
    monthlyIncome: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalServices: 0,
    todayAppointments: 0
  });
  
  const [hairServices, setHairServices] = useState([]);
  const [skinServices, setSkinServices] = useState([]);
  const [tattooServices, setTattooServices] = useState([]);
  
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  
  const [serviceForm, setServiceForm] = useState({
    id: null,
    category: 'hair',
    name: '',
    price: ''
  });
  
  const [staffForm, setStaffForm] = useState({
    id: null,
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [customerForm, setCustomerForm] = useState({
    id: null,
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [recordForm, setRecordForm] = useState({
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
  });
  
  const [dateFilter, setDateFilter] = useState('today');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [serviceSearch, setServiceSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [recordSearch, setRecordSearch] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          withCredentials: true
        });
        if (!res.data.authenticated) {
          navigate('/login');
        } else {
          setUser(res.data.user);
          calculateStats();
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = dailyRecords.filter(r => r.date === today);
    const todayIncome = todayRecords.reduce((sum, r) => sum + parseInt(r.price || 0), 0);
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekDate = lastWeek.toISOString().split('T')[0];
    const weeklyRecords = dailyRecords.filter(r => r.date >= lastWeekDate);
    const weeklyIncome = weeklyRecords.reduce((sum, r) => sum + parseInt(r.price || 0), 0);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDate = lastMonth.toISOString().split('T')[0];
    const monthlyRecords = dailyRecords.filter(r => r.date >= lastMonthDate);
    const monthlyIncome = monthlyRecords.reduce((sum, r) => sum + parseInt(r.price || 0), 0);
    
    const totalServices = hairServices.length + skinServices.length + tattooServices.length;
    
    setStats({
      dailyIncome: todayIncome,
      weeklyIncome: weeklyIncome,
      monthlyIncome: monthlyIncome,
      totalCustomers: customers.length,
      totalStaff: staff.length,
      totalServices: totalServices,
      todayAppointments: todayRecords.length
    });
  };

  useEffect(() => {
    calculateStats();
  }, [hairServices, skinServices, tattooServices, staff, customers, dailyRecords]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) {
      alert('Please fill name and price');
      return;
    }
    
    const service = {
      ...serviceForm,
      id: serviceForm.id || Date.now(),
      price: parseInt(serviceForm.price)
    };
    
    switch(service.category) {
      case 'hair':
        if (serviceForm.id) {
          setHairServices(hairServices.map(s => s.id === service.id ? service : s));
        } else {
          setHairServices([...hairServices, service]);
        }
        break;
      case 'skin':
        if (serviceForm.id) {
          setSkinServices(skinServices.map(s => s.id === service.id ? service : s));
        } else {
          setSkinServices([...skinServices, service]);
        }
        break;
      case 'tattoo':
        if (serviceForm.id) {
          setTattooServices(tattooServices.map(s => s.id === service.id ? service : s));
        } else {
          setTattooServices([...tattooServices, service]);
        }
        break;
      default:
        console.log('Unknown service category');
    }
    
    setServiceForm({
      id: null,
      category: activeServiceTab,
      name: '',
      price: ''
    });
    
    alert(serviceForm.id ? 'Service updated!' : 'Service added!');
  };

  const editService = (service) => {
    setServiceForm({
      id: service.id,
      category: service.category || 'hair',
      name: service.name,
      price: service.price.toString()
    });
    setActiveServiceTab(service.category || 'hair');
    setActiveTab('manage-services');
  };

  const deleteService = (id, category) => {
    if (window.confirm('Delete this service?')) {
      switch(category) {
        case 'hair':
          setHairServices(hairServices.filter(s => s.id !== id));
          break;
        case 'skin':
          setSkinServices(skinServices.filter(s => s.id !== id));
          break;
        case 'tattoo':
          setTattooServices(tattooServices.filter(s => s.id !== id));
          break;
        default:
          console.log('Unknown category');
      }
      alert('Service deleted!');
    }
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone) {
      alert('Please fill name and phone');
      return;
    }
    
    const staffMember = {
      ...staffForm,
      id: staffForm.id || Date.now()
    };
    
    if (staffForm.id) {
      setStaff(staff.map(s => s.id === staffMember.id ? staffMember : s));
    } else {
      setStaff([...staff, staffMember]);
    }
    
    setStaffForm({
      id: null,
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    
    alert(staffForm.id ? 'Staff updated!' : 'Staff added!');
  };

  const editStaff = (staffMember) => {
    setStaffForm({
      id: staffMember.id,
      name: staffMember.name,
      phone: staffMember.phone,
      email: staffMember.email || '',
      address: staffMember.address || ''
    });
    setActiveTab('staff-management');
  };

  const deleteStaff = (id) => {
    if (window.confirm('Delete this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
      alert('Staff deleted!');
    }
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) {
      alert('Please fill name and phone');
      return;
    }
    
    const customer = {
      ...customerForm,
      id: customerForm.id || Date.now(),
      totalVisits: 0,
      totalSpent: 0
    };
    
    if (customerForm.id) {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers([...customers, customer]);
    }
    
    setCustomerForm({
      id: null,
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    
    alert(customerForm.id ? 'Customer updated!' : 'Customer added!');
  };

  const editCustomer = (customer) => {
    setCustomerForm({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    });
    setActiveTab('customer-management');
  };

  const deleteCustomer = (id) => {
    if (window.confirm('Delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
      alert('Customer deleted!');
    }
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!recordForm.customerId || !recordForm.serviceId || !recordForm.price) {
      alert('Please select customer, service, and enter price');
      return;
    }
    
    const selectedCustomer = customers.find(c => c.id === parseInt(recordForm.customerId));
    const selectedService = getAllServices().find(s => s.id === parseInt(recordForm.serviceId));
    
    if (!selectedCustomer || !selectedService) {
      alert('Invalid customer or service selection');
      return;
    }
    
    const record = {
      ...recordForm,
      id: Date.now(),
      date: recordForm.date || new Date().toISOString().split('T')[0],
      customerName: selectedCustomer.name,
      phone: selectedCustomer.phone,
      serviceName: selectedService.name,
      category: selectedService.category
    };
    
    setDailyRecords([...dailyRecords, record]);
    
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id ? {
        ...c,
        totalVisits: c.totalVisits + 1,
        totalSpent: c.totalSpent + parseInt(record.price)
      } : c
    ));
    
    alert('Record saved successfully!');
  };

  const deleteRecord = (id) => {
    if (window.confirm('Delete this record?')) {
      setDailyRecords(dailyRecords.filter(r => r.id !== id));
      alert('Record deleted!');
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const exportToExcel = (data, filename) => {
    const headers = Object.keys(data[0]);
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #8b4513; color: white; font-weight: bold; padding: 10px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f5f5f5; }
          .amount { color: #2e7d32; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>
          <tbody>
            ${data.map(row => `<tr>${headers.map(header => {
              const value = row[header];
              const isAmount = header.toLowerCase().includes('price') || header.toLowerCase().includes('income') || header.toLowerCase().includes('amount');
              return `<td${isAmount ? ' class="amount"' : ''}>${value}</td>`;
            }).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xls`;
    a.click();
  };

  const exportToPDF = (data, filename) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Inter', 'Segoe UI', sans-serif; margin: 40px; color: #333; background: #f8f9fa; }
            .report-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #8b4513; }
            .report-header h1 { color: #8b4513; margin: 0; font-size: 28px; font-weight: 600; }
            .report-header p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            th { background: linear-gradient(135deg, #8b4513, #d2691e); color: white; padding: 12px 15px; text-align: left; font-weight: 600; }
            td { padding: 12px 15px; border-bottom: 1px solid #e1e5eb; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            tr:hover { background-color: #f1f3f5; }
            .amount { color: #2e7d32; font-weight: 600; }
            @media print { body { margin: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>${filename}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          <table>
            <thead><tr>${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}</tr></thead>
            <tbody>
              ${data.map(row => `<tr>${Object.entries(row).map(([key, value]) => {
                const isAmount = key.toLowerCase().includes('price') || key.toLowerCase().includes('income') || key.toLowerCase().includes('amount');
                return `<td${isAmount ? ' class="amount"' : ''}>${value}</td>`;
              }).join('')}</tr>`).join('')}
            </tbody>
          </table>
          <button class="no-print" onclick="window.print()" style="margin-top: 30px; padding: 12px 24px; background: linear-gradient(135deg, #8b4513, #d2691e); color: white; border: none; border-radius: 6px; cursor: pointer;">
            Print/Save as PDF
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateReport = (type, format) => {
    let data = [];
    let filename = '';
    
    switch(type) {
      case 'services':
        data = [...hairServices, ...skinServices, ...tattooServices];
        filename = `services-report-${new Date().toISOString().split('T')[0]}`;
        break;
      case 'staff':
        data = staff;
        filename = `staff-report-${new Date().toISOString().split('T')[0]}`;
        break;
      case 'customers':
        data = customers;
        filename = `customers-report-${new Date().toISOString().split('T')[0]}`;
        break;
      case 'records':
        data = getFilteredRecords();
        filename = `records-report-${dateFilter}-${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        data = [];
    }
    
    if (data.length === 0) {
      alert('No data found to export');
      return;
    }
    
    switch(format) {
      case 'csv':
        exportToCSV(data, filename);
        break;
      case 'excel':
        exportToExcel(data, filename);
        break;
      case 'pdf':
        exportToPDF(data, filename);
        break;
      default:
        exportToCSV(data, filename);
    }
  };

  const getFilteredServices = () => {
    const allServices = [...hairServices, ...skinServices, ...tattooServices];
    return allServices.filter(service => 
      service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      service.category.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  };

  const getFilteredStaff = () => {
    return staff.filter(member => 
      member.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.phone.includes(staffSearch)
    );
  };

  const getFilteredCustomers = () => {
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone.includes(customerSearch)
    );
  };

  const getFilteredRecords = () => {
    let filtered = dailyRecords;
    
    switch(dateFilter) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(r => r.date === today);
        break;
      case 'date-range':
        filtered = filtered.filter(r => 
          r.date >= dateRange.start && r.date <= dateRange.end
        );
        break;
      case 'specific-date':
        filtered = filtered.filter(r => r.date === dateRange.start);
        break;
      default:
        filtered = filtered;
    }
    
    if (recordSearch) {
      filtered = filtered.filter(r => 
        r.customerName.toLowerCase().includes(recordSearch.toLowerCase()) ||
        r.serviceName.toLowerCase().includes(recordSearch.toLowerCase()) ||
        r.phone.includes(recordSearch)
      );
    }
    
    return filtered;
  };

  const calculateIncome = () => {
    const records = getFilteredRecords();
    return records.reduce((sum, r) => sum + parseInt(r.price || 0), 0);
  };

  const getAllServices = () => {
    return [...hairServices, ...skinServices, ...tattooServices];
  };

  const handleServiceSelect = (serviceId) => {
    const service = getAllServices().find(s => s.id === parseInt(serviceId));
    if (service) {
      setRecordForm({
        ...recordForm,
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        price: service.price.toString()
      });
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
      setRecordForm({
        ...recordForm,
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.phone
      });
    }
  };

  useEffect(() => {
    setServiceForm(prev => ({ ...prev, category: activeServiceTab }));
  }, [activeServiceTab]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const Sidebar = () => (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <h2>ParlourPro</h2>
          <p>Admin Panel</p>
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
          <h4>{user?.name || 'Admin User'}</h4>
          <p>{user?.role || 'Owner'}</p>
          <p className="user-email">{user?.email || 'admin@parlour.com'}</p>
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
          <li className={activeTab === 'staff-management' ? 'active' : ''} onClick={() => {setActiveTab('staff-management'); setMobileSidebarOpen(false);}}>
            <FaUserFriends /> <span>Staff Management</span>
          </li>
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

  const DashboardContent = () => (
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
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
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
            <FaCalendarDay /> Add Today's Record
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

  const ManageServicesContent = () => (
    <div className="manage-services">
      <div className="section-header">
        <h1>Manage Services</h1>
        <p>Add, edit or delete services for hair, skin and tattoo categories</p>
      </div>
      
      <div className="service-tabs">
        <button 
          className={activeServiceTab === 'hair' ? 'active' : ''}
          onClick={() => setActiveServiceTab('hair')}
        >
          <FaCut /> Hair Services ({hairServices.length})
        </button>
        <button 
          className={activeServiceTab === 'skin' ? 'active' : ''}
          onClick={() => setActiveServiceTab('skin')}
        >
          <FaTint /> Skin Services ({skinServices.length})
        </button>
        <button 
          className={activeServiceTab === 'tattoo' ? 'active' : ''}
          onClick={() => setActiveServiceTab('tattoo')}
        >
          <FaPalette /> Tattoo Services ({tattooServices.length})
        </button>
      </div>
      
      <div className="filter-section">
        <div className="filter-controls">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search services..." value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)} className="search-input" />
          </div>
          <div className="export-options">
            <button onClick={() => generateReport('services', 'csv')} className="export-btn"><FaFileCsv /> CSV</button>
            <button onClick={() => generateReport('services', 'excel')} className="export-btn"><FaFileExcel /> XLS</button>
            <button onClick={() => generateReport('services', 'pdf')} className="export-btn"><FaFilePdf /> PDF</button>
          </div>
        </div>
      </div>
      
      <div className="service-form-section">
        <h2>{serviceForm.id ? 'Edit Service' : 'Add New Service'}</h2>
        <form onSubmit={handleServiceSubmit} className="service-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={serviceForm.category} onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})} required>
                <option value="hair">Hair</option>
                <option value="skin">Skin</option>
                <option value="tattoo">Tattoo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Service Name *</label>
              <input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})} placeholder="e.g., Hair Cut, Facial" required />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} placeholder="Enter price" required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {serviceForm.id ? <FaEdit /> : <FaPlus />}
              {serviceForm.id ? 'Update Service' : 'Add Service'}
            </button>
            {serviceForm.id && (
              <button type="button" className="btn-secondary" onClick={() => setServiceForm({ id: null, category: activeServiceTab, name: '', price: '' })}>
                <FaTimes /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="services-list">
        <h2>All Services ({getFilteredServices().length})</h2>
        <div className="services-grid">
          {getFilteredServices().map(service => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <span className="service-price">₹{service.price}</span>
              </div>
              <div className="service-meta">
                <span className={`service-category ${service.category}`}>{service.category}</span>
              </div>
              <div className="service-actions">
                <button onClick={() => editService(service)} className="btn-edit"><FaEdit /> Edit</button>
                <button onClick={() => deleteService(service.id, service.category)} className="btn-delete"><FaTrash /> Delete</button>
              </div>
            </div>
          ))}
          {getFilteredServices().length === 0 && (
            <div className="no-data"><p>No services found. Add your first service above!</p></div>
          )}
        </div>
      </div>
    </div>
  );

  const StaffManagementContent = () => (
    <div className="staff-management">
      <div className="section-header">
        <h1>Staff Management</h1>
        <p>Manage staff members details</p>
      </div>
      
      <div className="filter-section">
        <div className="filter-controls">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search staff..." value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} className="search-input" />
          </div>
          <div className="export-options">
            <button onClick={() => generateReport('staff', 'csv')} className="export-btn"><FaFileCsv /> CSV</button>
            <button onClick={() => generateReport('staff', 'excel')} className="export-btn"><FaFileExcel /> XLS</button>
            <button onClick={() => generateReport('staff', 'pdf')} className="export-btn"><FaFilePdf /> PDF</button>
          </div>
        </div>
      </div>
      
      <div className="staff-form-section">
        <h2>{staffForm.id ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
        <form onSubmit={handleStaffSubmit} className="staff-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} placeholder="Enter full name" required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})} placeholder="10-digit mobile" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" value={staffForm.address} onChange={(e) => setStaffForm({...staffForm, address: e.target.value})} placeholder="City, Area" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {staffForm.id ? <FaEdit /> : <FaUserPlus />}
              {staffForm.id ? 'Update Staff' : 'Add Staff Member'}
            </button>
            {staffForm.id && (
              <button type="button" className="btn-secondary" onClick={() => setStaffForm({ id: null, name: '', phone: '', email: '', address: '' })}>
                <FaTimes /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="staff-list">
        <h2>Staff Members ({getFilteredStaff().length})</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredStaff().map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.phone}</td>
                  <td>{member.email || '-'}</td>
                  <td>{member.address || '-'}</td>
                  <td className="action-buttons">
                    <button onClick={() => editStaff(member)} className="btn-edit"><FaEdit /></button>
                    <button onClick={() => deleteStaff(member.id)} className="btn-delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {getFilteredStaff().length === 0 && (
                <tr><td colSpan="5" className="no-data">No staff members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const CustomerManagementContent = () => (
    <div className="customer-management">
      <div className="section-header">
        <h1>Customer Management</h1>
        <p>Manage customer details and view their history</p>
      </div>
      
      <div className="filter-section">
        <div className="filter-controls">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search customers..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="search-input" />
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
              <input type="text" value={customerForm.name} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} placeholder="Enter full name" required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" value={customerForm.phone} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="10-digit mobile" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" value={customerForm.address} onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})} placeholder="City, Area" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {customerForm.id ? <FaEdit /> : <FaUserPlus />}
              {customerForm.id ? 'Update Customer' : 'Add Customer'}
            </button>
            {customerForm.id && (
              <button type="button" className="btn-secondary" onClick={() => setCustomerForm({ id: null, name: '', phone: '', email: '', address: '' })}>
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
                <div className="detail-item">
                  <span className="detail-label">Total Visits:</span>
                  <span className="detail-value">{customer.totalVisits || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Spent:</span>
                  <span className="detail-value">₹{customer.totalSpent || 0}</span>
                </div>
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

  const RecordManagementContent = () => {
    const filteredRecords = getFilteredRecords();
    const totalIncome = calculateIncome();
    
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
              <div className="form-group">
                <label>Customer *</label>
                <select value={recordForm.customerId} onChange={(e) => handleCustomerSelect(e.target.value)} required>
                  <option value="">-- Select Customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={recordForm.phone} readOnly className="read-only" />
              </div>
              
              <div className="form-group">
                <label>Select Service *</label>
                <select value={recordForm.serviceId} onChange={(e) => handleServiceSelect(e.target.value)} required>
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
                <input type="number" value={recordForm.price} onChange={(e) => setRecordForm({...recordForm, price: e.target.value})} placeholder="Enter amount" required />
              </div>
              
              <div className="form-group">
                <label>Payment Method</label>
                <select value={recordForm.paymentMethod} onChange={(e) => setRecordForm({...recordForm, paymentMethod: e.target.value})}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="online">Online</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={recordForm.date} onChange={(e) => setRecordForm({...recordForm, date: e.target.value})} />
              </div>
              
              <div className="form-group full-width">
                <label>Notes (Optional)</label>
                <textarea value={recordForm.notes} onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})} placeholder="Any additional notes..." rows="2" />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary"><FaSave /> Save Record</button>
              <button type="button" className="btn-secondary" onClick={() => setRecordForm({
                customerId: '', customerName: '', phone: '', serviceId: '', serviceName: '', category: 'hair', price: '', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: ''
              })}><FaTimes /> Clear Form</button>
            </div>
          </form>
        </div>
        
        <div className="records-list-section">
          <div className="section-header">
            <h2>Records ({filteredRecords.length})</h2>
            <div className="filter-controls">
              <div className="search-bar">
                <FaSearch />
                <input type="text" placeholder="Search records..." value={recordSearch} onChange={(e) => setRecordSearch(e.target.value)} className="search-input" />
              </div>
              
              <div className="filter-group">
                <label>Filter:</label>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                  <option value="all">All Records</option>
                  <option value="today">Today</option>
                  <option value="specific-date">Specific Date</option>
                  <option value="date-range">Date Range</option>
                </select>
              </div>
              
              {dateFilter === 'specific-date' && (
                <div className="filter-group">
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                </div>
              )}
              
              {dateFilter === 'date-range' && (
                <>
                  <div className="filter-group">
                    <label>From:</label>
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                  </div>
                  <div className="filter-group">
                    <label>To:</label>
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                  </div>
                </>
              )}
              
              <div className="export-options">
                <button onClick={() => generateReport('records', 'csv')} className="export-btn"><FaFileCsv /> CSV</button>
                <button onClick={() => generateReport('records', 'excel')} className="export-btn"><FaFileExcel /> XLS</button>
                <button onClick={() => generateReport('records', 'pdf')} className="export-btn"><FaFilePdf /> PDF</button>
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
                    <td>{record.phone}</td>
                    <td>{record.serviceName}</td>
                    <td><span className={`category-badge ${record.category}`}>{record.category}</span></td>
                    <td className="price-cell">₹{record.price}</td>
                    <td><span className={`payment-badge ${record.paymentMethod}`}>{record.paymentMethod}</span></td>
                    <td className="action-buttons">
                      <button onClick={() => deleteRecord(record.id)} className="btn-delete"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr><td colSpan="8" className="no-data">No records found.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="5" className="total-label"><strong>Total Income ({filteredRecords.length} records):</strong></td>
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

  return (
    <div className="dashboard-container">
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileSidebarOpen(true)}>
          <FaBars />
        </button>
        <div className="logo-mobile">
          <h2>ParlourPro</h2>
        </div>
        <div className="user-mobile">
          <FaUserCircle />
        </div>
      </header>
      
      <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
      </button>
      
      <Sidebar />
      
      <main className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <div className="content-wrapper">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'manage-services' && <ManageServicesContent />}
          {activeTab === 'staff-management' && <StaffManagementContent />}
          {activeTab === 'customer-management' && <CustomerManagementContent />}
          {activeTab === 'record-management' && <RecordManagementContent />}
        </div>
      </main>
      
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>
      )}
    </div>
  );
}

export default Dashboard;