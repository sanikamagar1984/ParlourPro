// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';

import {
  servicesAPI,
  staffAPI,
  customersAPI,
  recordsAPI
} from '../services/api';



// Components
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardContent from '../components/Dashboard/DashboardContent';
import ManageServicesContent from '../components/Dashboard/ManageServicesContent';
import StaffManagementContent from '../components/Dashboard/StaffManagementContent';
import CustomerManagementContent from '../components/Dashboard/CustomerManagementContent';
import RecordManagementContent from '../components/Dashboard/RecordManagementContent';

import './../css/Dashboard.css';




function Dashboard() {
  const navigate = useNavigate();

const getFilteredStaff = () => {
  return staff;
};
const [customerSearch, setCustomerSearch] = useState('');
  /* ================= UI STATE ================= */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeServiceTab, setActiveServiceTab] = useState('hair');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  /* ================= DATA STATE ================= */
  const [hairServices, setHairServices] = useState([]);
  const [skinServices, setSkinServices] = useState([]);
  const [tattooServices, setTattooServices] = useState([]);
  const [piercingServices, setPiercingServices] = useState([]); // ✅ FIX
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);

  /* ================= STATS ================= */
  const [stats, setStats] = useState({
    dailyIncome: 0,
    weeklyIncome: 0,
    monthlyIncome: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalServices: 0,
    todayAppointments: 0
  });

  /* ================= FORMS ================= */
  const [serviceForm, setServiceForm] = useState({
    id: null,
    category: 'hair',
    name: '',
    price: '',
    note: ''
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
    serviceId: '',
    price: '',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  /* ================= NOTIFICATION ================= */
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showNotification = (title, message, type = 'success') => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification(p => ({ ...p, show: false }));
    }, 3000);
  };

  const closeNotification = () =>
    setNotification(p => ({ ...p, show: false }));

  /* ================= AUTH ================= */
// Replace your entire useEffect AUTH section with this COMPLETE version:

/* ================= AUTH - COMPLETE FIX ================= */
useEffect(() => {
  let isMounted = true;
  let authCheckInProgress = false;

  const checkAuth = async () => {
    // Prevent duplicate auth checks
    if (authCheckInProgress) {
      console.log('⚠️ Auth check already in progress, skipping...');
      return;
    }
    
    authCheckInProgress = true;
    console.log('🔍 Dashboard: Starting auth check...');
    
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Auth response:', res.data);

      // Check if component is still mounted
      if (!isMounted) {
        console.log('⚠️ Component unmounted, stopping...');
        return;
      }

      // Validate authentication
      if (!res.data.authenticated || !res.data.user) {
        console.log('❌ Not authenticated, redirecting to login');
        window.location.href = '/login';
        return;
      }

      // Validate admin role
      if (res.data.user.role !== 'admin') {
        console.log('⚠️ Not admin, redirecting to user dashboard');
        window.location.href = '/user-dashboard';
        return;
      }

      console.log('✅ Admin authenticated:', res.data.user.name);
      
      // Set user data
      setUser(res.data.user);
      
      // Load all dashboard data
      console.log('📊 Loading dashboard data...');
      await loadAllData();
      
      console.log('✅ Dashboard loaded successfully');
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Auth error:', error.response?.data || error.message);
      
      if (isMounted) {
        // Only redirect if we got a 401/403 error
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔒 Unauthorized, redirecting to login');
          window.location.href = '/login';
        } else {
          // For other errors, still try to show an error state
          console.error('Network or server error');
          setLoading(false);
        }
      }
    }
  };

  checkAuth();

  // Cleanup function
  return () => {
    console.log('🧹 Dashboard cleanup');
    isMounted = false;
  };

}, []); 

// Replace your loading screen check at the bottom of Dashboard.js with this:



// Then your normal return statement continues...
// Replace your loadAllData function in Dashboard.js with this debug version:

/* ================= LOAD ALL DATA ================= */
const loadAllData = async () => {
  console.log('📊 Starting to load all data...');
  
  try {
    console.log('1️⃣ Fetching services...');
    await fetchServices();
    console.log('✅ Services loaded');
    
    console.log('2️⃣ Fetching staff...');
    await fetchStaff();
    console.log('✅ Staff loaded');
    
    console.log('3️⃣ Fetching customers...');
    await fetchCustomers();
    console.log('✅ Customers loaded');
    
    console.log('4️⃣ Fetching records...');
    await fetchRecords();
    console.log('✅ Records loaded');
    
    console.log('✅ All data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading data:', error);
    // Don't throw - let dashboard load anyway
  }
};
  /* ================= SERVICES ================= */
  const fetchServices = async () => {
    const res = await servicesAPI.getAll();
    const services = res.data.services || [];

    setHairServices(services.filter(s => s.category === 'hair'));
    setSkinServices(services.filter(s => s.category === 'skin'));
    setTattooServices(services.filter(s => s.category === 'tattoo'));
    setPiercingServices(services.filter(s => s.category === 'piercing')); // ✅ FIX
  };

const handleServiceSubmit = async (e) => {
  e.preventDefault();

  // 🔥 MAP note → description (DB column)
  const payload = {
    ...serviceForm,
    description: serviceForm.note
  };

  delete payload.note; // clean payload

  if (serviceForm.id) {
    await servicesAPI.update(serviceForm.id, payload);
  } else {
    await servicesAPI.create(payload);
  }

  showNotification('Success', 'Service saved');

  setServiceForm({
    id: null,
    category: activeServiceTab,
    name: '',
    price: '',
    note: ''
  });

  fetchServices();
};

  const deleteService = async (id) => {
    if (!window.confirm('Delete service?')) return;

    await servicesAPI.delete(id);
    fetchServices();
    showNotification('Success', 'Service deleted');
  };

  const editService = (service) => {
  setActiveServiceTab(service.category);

  setServiceForm({
    id: service.id,
    category: service.category,
    name: service.name,
    price: service.price,
    note: service.description || ''
  });
};

const getServicesByFilter = (type) => {
  if (type === 'hair') return hairServices;
  if (type === 'skin') return skinServices;
  if (type === 'tattoo') return tattooServices;
  if (type === 'piercing') return piercingServices;

  // all services
  return [
    ...hairServices,
    ...skinServices,
    ...tattooServices,
    ...piercingServices
  ];
};

//csv
const downloadServicesCSV = (type) => {
  const services = getServicesByFilter(type);

  let csv = 'Tressence by Simi - Services Report\n\n';
  csv += 'Sr No,Service Name,Category,Price (Rs),Note\n';

  services.forEach((s, i) => {
    csv += `${i + 1},${s.name},${s.category},${s.price},"${s.description || '-'}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `Tressence_by_Simi_Services_${type}.csv`;
  a.click();
};



//excel
const downloadServicesExcel = (type) => {
  const services = getServicesByFilter(type);

  const data = services.map((s, i) => ({
    'Sr No': i + 1,
    'Service Name': s.name,
    'Category': s.category.toUpperCase(),
    'Price (Rs)': s.price,
    'Note': s.description || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // ✅ Column width
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 30 }
  ];

  // ✅ Header style
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '8B4513' } }, // brown-gold
    alignment: { horizontal: 'center' }
  };

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell) cell.s = headerStyle;
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');

  XLSX.writeFile(
    workbook,
    `Tressence_by_Simi_Services_${type}.xlsx`
  );
};
<button className="btn-pdf-all" onClick={() => downloadServicesPDF('all')}>
  <FaFilePdf /> All Services (PDF)
</button>


//pdf 
const downloadServicesPDF = (type) => {
  const services = getServicesByFilter(type);
  const doc = new jsPDF('p', 'mm', 'a4');

  /* ================= HEADER ================= */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(139, 69, 19); // luxury brown
  doc.text('Tressence by Simi', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90);
  doc.text('Luxury Salon Services Report', 14, 26);

  doc.setFontSize(10);
  doc.text(`Category: ${type.toUpperCase()}`, 14, 33);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

  /* ================= TABLE DATA ================= */
  const tableData = services.map((s, index) => [
    index + 1,
    s.name,
    s.category.toUpperCase(),
    `Rs ${Number(s.price).toFixed(2)}`,
    s.description || '-'
  ]);

  /* ================= TABLE ================= */
  autoTable(doc, {
    startY: 45,
    head: [['#', 'Service Name', 'Category', 'Price', 'Note']],
    body: tableData,

    theme: 'grid',

    headStyles: {
      fillColor: [139, 69, 19], // brand brown
      textColor: [255, 255, 255],
      fontSize: 11,
      halign: 'center'
    },

    bodyStyles: {
      fontSize: 10,
      textColor: [60, 60, 60]
    },

    alternateRowStyles: {
      fillColor: [248, 243, 239] // soft beige
    },

    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 55 },
      2: { cellWidth: 35 },
      3: { halign: 'right', cellWidth: 25 },
      4: { cellWidth: 55 }
    },

    styles: {
      cellPadding: 4,
      lineColor: [200, 200, 200]
    }
  });

  /* ================= FOOTER ================= */
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    '© Tressence by Simi | Premium Beauty & Care',
    14,
    pageHeight - 12
  );

  doc.save(`Tressence_by_Simi_${type}_Services.pdf`);
};

  /* ================= STAFF ================= */
/* ================= STAFF (EMPLOYEES FROM USERS TABLE) ================= */

// ✅ 1️⃣ Fetch all employees
const fetchStaff = async () => {
  try {
    const res = await staffAPI.getAllEmployees();
    console.log('📋 Fetched staff:', res.data);
    setStaff(res.data.staff || []);
  } catch (error) {
    console.error('❌ Error fetching staff:', error);
    showNotification('Error', 'Failed to load staff', 'error');
  }
};

// ✅ 2️⃣ Update employee details (name + phone + email)
const updateEmployee = async (employee) => {
  try {
    await staffAPI.updateEmployee(employee.id, {
      name: employee.name,
      phone: employee.phone,
      email: employee.email
    });

    showNotification('Success', 'Employee updated successfully');
    fetchStaff(); // Reload the list
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    const errorMsg = error.response?.data?.error || 'Failed to update employee';
    showNotification('Error', errorMsg, 'error');
  }
};

// ✅ 3️⃣ Update employee password (separate action)
const updateEmployeePassword = async (id, password) => {
  try {
    if (!password || password.length < 6) {
      showNotification('Error', 'Password must be at least 6 characters', 'error');
      return;
    }

    await staffAPI.updateEmployeePassword(id, { password });
    showNotification('Success', 'Password updated successfully');
  } catch (error) {
    console.error('❌ Error updating password:', error);
    const errorMsg = error.response?.data?.error || 'Failed to update password';
    showNotification('Error', errorMsg, 'error');
  }
};

// ✅ 4️⃣ Delete employee
const deleteEmployee = async (id) => {
  try {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    await staffAPI.deleteEmployee(id);
    showNotification('Success', 'Employee deleted successfully');
    fetchStaff(); // Reload the list
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    showNotification('Error', 'Failed to delete employee', 'error');
  }
};


  /* ================= CUSTOMERS ================= */
/* ================= CUSTOMERS ================= */
const fetchCustomers = async () => {
  const res = await customersAPI.getAll();
  setCustomers(res.data.customers || []);
};

const handleCustomerSubmit = async (e) => {
  e.preventDefault();

  if (customerForm.id) {
    await customersAPI.update(customerForm.id, customerForm);
  } else {
    await customersAPI.create(customerForm);
  }

  setCustomerForm({ id: null, name: '', phone: '', email: '', address: '' });
  fetchCustomers();
  showNotification('Success', 'Customer saved');
};

const deleteCustomer = async (id) => {
  if (!window.confirm('Delete customer?')) return;

  await customersAPI.delete(id);
  fetchCustomers();
  showNotification('Success', 'Customer deleted');
};

const getFilteredCustomers = () => {
  if (!customerSearch.trim()) return customers;
  
  const searchTerm = customerSearch.toLowerCase();
  return customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm) ||
    customer.phone.toLowerCase().includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
    (customer.address && customer.address.toLowerCase().includes(searchTerm))
  );
};

// Helper function to format phone numbers
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  

  
  // Return original if can't format
  return phone.toString().replace(/\D/g, '');
};

const generateReport = async (type, format) => {
  if (type === 'customers') {
    const customersData = getFilteredCustomers();
    
    if (customersData.length === 0) {
      showNotification('Info', 'No customers to export', 'info');
      return;
    }
    
    if (format === 'csv') {
      downloadCustomersCSV(customersData);
    } else if (format === 'excel') {
      downloadCustomersExcel(customersData);
    } else if (format === 'pdf') {
      downloadCustomersPDF(customersData);
    }
    
    showNotification('Success', `Report exported as ${format.toUpperCase()}`, 'success');
  }
};

const downloadCustomersCSV = (customersData) => {
  let csv = 'Tressence by Simi - Customers Report\n';
  csv += 'Date: ' + new Date().toLocaleDateString() + '\n';
  csv += 'Total Customers: ' + customersData.length + '\n\n';
  
  csv += 'Sr No,Name,Phone,Email,Address,Member Since\n';

  customersData.forEach((customer, i) => {
    const phone = formatPhoneNumber(customer.phone) || '';
    const memberSince = new Date(customer.created_at || customer.updated_at || new Date()).toLocaleDateString();
    
    // CSV escaping
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '';
      str = str.toString();
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    
    csv += `${i + 1},${escapeCSV(customer.name || '')},${escapeCSV(phone)},${escapeCSV(customer.email || '')},${escapeCSV(customer.address || '')},${escapeCSV(memberSince)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `Tressence_Customers_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

const downloadCustomersExcel = (customersData) => {
  // Prepare data with formatted phone numbers
  const data = customersData.map((customer, i) => ({
    'Sr No': i + 1,
    'Name': customer.name || '',
    'Phone': formatPhoneNumber(customer.phone) || '',
    'Email': customer.email || '',
    'Address': customer.address || '',
    'Member Since': new Date(customer.created_at || customer.updated_at || new Date()).toLocaleDateString()
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Sr No
    { wch: 25 }, // Name
    { wch: 15 }, // Phone (formatted)
    { wch: 35 }, // Email
    { wch: 30 }, // Address
    { wch: 12 }  // Member Since
  ];

  // Style header row
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '8B4513' } }, // Brown
    alignment: { horizontal: 'center' }
  };

  // Apply header style to all header cells
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell) cell.s = headerStyle;
  }

  // Create workbook and add sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
  
  // Save file
  XLSX.writeFile(
    workbook,
    `Tressence_Customers_${new Date().toISOString().split('T')[0]}.xlsx`
  );
};

const downloadCustomersPDF = (customersData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(139, 69, 19); // Brown
  doc.text('Tressence by Simi', 14, 18);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90); // Dark gray
  doc.text('Customer Management Report', 14, 26);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 33);
  doc.text(`Total Customers: ${customersData.length}`, 14, 38);
  
  // Prepare table data with formatted phone numbers
  const tableData = customersData.map((customer, index) => [
    index + 1,
    customer.name || 'N/A',
    formatPhoneNumber(customer.phone) || 'N/A',
    customer.email || 'N/A',
    customer.address || 'N/A',
    new Date(customer.created_at || customer.updated_at || new Date()).toLocaleDateString()
  ]);
  
  // Create table
  autoTable(doc, {
    startY: 45,
    head: [['#', 'Name', 'Phone', 'Email', 'Address', 'Member Since']],
    body: tableData,
    theme: 'grid',
    
    headStyles: {
      fillColor: [139, 69, 19],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
      cellPadding: 4
    },
    
    alternateRowStyles: {
      fillColor: [248, 248, 248]
    },
    
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30, halign: 'left' },
      2: { cellWidth: 25, halign: 'left' }, // Phone column
      3: { cellWidth: 40, halign: 'left' },
      4: { cellWidth: 40, halign: 'left' },
      5: { cellWidth: 25, halign: 'center' }
    },
    
    // Optional: Set phone column to monospaced font for better alignment
    didParseCell: function(data) {
      if (data.column.index === 2) { // Phone column
        data.cell.styles.fontStyle = 'normal';
        data.cell.styles.font = 'helvetica';
      }
    }
  });
  
  // Footer
  const finalY = doc.lastAutoTable.finalY || 45;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'italic');
  doc.text(
    '© Tressence by Simi | Luxury Beauty Salon',
    14,
    finalY + 10
  );
  
  const fileName = `Tressence_Customers_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

const editCustomer = (customer) => {
  setCustomerForm({
    id: customer.id,
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || ''
  });
  
  // Scroll to form section
  document.querySelector('.customer-form-section')?.scrollIntoView({ behavior: 'smooth' });
};


  /* ================= RECORDS ================= */
  const fetchRecords = async () => {
    const res = await recordsAPI.getAll();
    setDailyRecords(res.data.records || []);
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();

    await recordsAPI.create(recordForm);

    setRecordForm({
      customerId: '',
      serviceId: '',
      price: '',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });

    fetchRecords();
    showNotification('Success', 'Record added');
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete record?')) return;

    await recordsAPI.delete(id);
    fetchRecords();
    showNotification('Success', 'Record deleted');
  };

  /* ================= STATS ================= */
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = dailyRecords.filter(r => r.date === today);

    const dailyIncome = todayRecords.reduce(
      (sum, r) => sum + Number(r.price || 0),
      0
    );

    setStats({
      dailyIncome,
      weeklyIncome: dailyIncome,
      monthlyIncome: dailyIncome,
      totalCustomers: customers.length,
      totalStaff: staff.length,
      totalServices:
        hairServices.length +
        skinServices.length +
        tattooServices.length +
        piercingServices.length,
      todayAppointments: todayRecords.length
    });
  }, [
    dailyRecords,
    customers,
    staff,
    hairServices,
    skinServices,
    tattooServices,
    piercingServices
  ]);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await axios.post(
      'http://localhost:5000/api/auth/logout',
      {},
      { withCredentials: true }
    );
    navigate('/login');
  };

if (loading) {
  return (
    <div className="loading-screen" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px'
    }}>
      Loading Dashboard...
    </div>
  );
}


  return (
    <div className="dashboard-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <FaTimes onClick={closeNotification} />
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setMobileSidebarOpen={setMobileSidebarOpen}
        handleLogout={handleLogout}
      />

      <main className={`main-content ${sidebarOpen ? 'with-sidebar' : ''}`}>
        {activeTab === 'dashboard' && (
          <DashboardContent
            user={user}
            stats={stats}
            dailyRecords={dailyRecords}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'manage-services' && (
          <ManageServicesContent
            hairServices={hairServices}
            skinServices={skinServices}
            tattooServices={tattooServices}
            piercingServices={piercingServices} // ✅ FIX
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            activeServiceTab={activeServiceTab}
            setActiveServiceTab={setActiveServiceTab}
            handleServiceSubmit={handleServiceSubmit}
              editService={editService} 
            deleteService={deleteService}
            downloadServicesExcel={downloadServicesExcel}
  downloadServicesPDF={downloadServicesPDF}
  downloadServicesCSV={downloadServicesCSV}
          />
        )}


{activeTab === 'staff-management' && (
  <StaffManagementContent
    staff={staff}
    updateEmployee={updateEmployee}
    updateEmployeePassword={updateEmployeePassword}
    deleteEmployee={deleteEmployee}
  />
)}


       {activeTab === 'customer-management' && (
  <CustomerManagementContent
    customers={customers}
    customerForm={customerForm}
    setCustomerForm={setCustomerForm}
    handleCustomerSubmit={handleCustomerSubmit}
    editCustomer={editCustomer} // Add this function if you haven't
    deleteCustomer={deleteCustomer}
    customerSearch={customerSearch} // Add this
    setCustomerSearch={setCustomerSearch} // Add this
    getFilteredCustomers={getFilteredCustomers} // Add this
    generateReport={generateReport} // Add this
  />
)}

        {activeTab === 'record-management' && (
          <RecordManagementContent
            customers={customers}
            hairServices={hairServices}
            skinServices={skinServices}
            tattooServices={tattooServices}
            dailyRecords={dailyRecords}
            recordForm={recordForm}
            setRecordForm={setRecordForm}
            handleRecordSubmit={handleRecordSubmit}
            deleteRecord={deleteRecord}
          />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
