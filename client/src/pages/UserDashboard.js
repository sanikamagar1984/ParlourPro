// client/src/pages/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaTimes } from 'react-icons/fa';

import {
  servicesAPI,
  customersAPI,
  recordsAPI
} from '../services/api';

// Components
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardContent from '../components/Dashboard/DashboardContent';
import ManageServicesContent from '../components/Dashboard/ManageServicesContent';
import CustomerManagementContent from '../components/Dashboard/CustomerManagementContent';
import RecordManagementContent from '../components/Dashboard/RecordManagementContent';

import './../css/Dashboard.css';

function UserDashboard() {
  const navigate = useNavigate();

  // Helper function to format date as YYYY-MM-DD
  const getLocalDateString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date to DD-MM-YYYY for display
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

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
  const [piercingServices, setPiercingServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);

  /* ================= STATS ================= */
  const [stats, setStats] = useState({
    dailyIncome: 0,
    weeklyIncome: 0,
    monthlyIncome: 0,
    totalCustomers: 0,
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
    category: '',
    price: '',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  /* ================= SEARCH & FILTERS ================= */
  const [customerSearch, setCustomerSearch] = useState('');
  const [recordSearch, setRecordSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
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
  useEffect(() => {
    let isMounted = true;
    let authCheckInProgress = false;

    const checkAuth = async () => {
      if (authCheckInProgress) return;
      
      authCheckInProgress = true;
      
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });

        if (!isMounted) return;

        if (!res.data.authenticated || !res.data.user) {
          window.location.href = '/login';
          return;
        }

        // Redirect admin users to admin dashboard
        if (res.data.user.role === 'admin') {
          window.location.href = '/dashboard';
          return;
        }

        setUser(res.data.user);
        await loadAllData();
        setLoading(false);
        
      } catch (error) {
        if (isMounted) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            window.location.href = '/login';
          } else {
            setLoading(false);
          }
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ================= LOAD ALL DATA ================= */
  const loadAllData = async () => {
    try {
      await fetchServices();
      await fetchCustomers();
      await fetchRecords();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  /* ================= SERVICES ================= */
  const fetchServices = async () => {
    try {
      const res = await servicesAPI.getAll();
      const services = res.data.services || [];

      setHairServices(services.filter(s => s.category === 'hair'));
      setSkinServices(services.filter(s => s.category === 'skin'));
      setTattooServices(services.filter(s => s.category === 'tattoo'));
      setPiercingServices(services.filter(s => s.category === 'piercing'));
    } catch (error) {
      console.error('Error fetching services:', error);
      showNotification('Error', 'Failed to load services', 'error');
    }
  };




  // ✅ FIXED: EMPLOYEES CAN ADD SERVICES TO DATABASE
// ✅ FIXED: EMPLOYEES CAN ADD SERVICES TO DATABASE
const handleServiceSubmit = async (e) => {
  e.preventDefault();
  
  console.log('Employee adding service to database:', serviceForm);
  
  // Basic validation
  if (!serviceForm.name?.trim()) {
    showNotification('Error', 'Service name is required', 'error');
    return;
  }
  
  if (!serviceForm.price || isNaN(serviceForm.price) || parseFloat(serviceForm.price) <= 0) {
    showNotification('Error', 'Valid price is required', 'error');
    return;
  }
  
  // Check if editing existing service (not allowed for employees)
  if (serviceForm.id) {
    showNotification(
      'Edit Not Allowed', 
      'Employees cannot edit existing services. You can add a new service instead.',
      'info'
    );
    return;
  }
  
  try {
    // Prepare service data for database
    const serviceData = {
      name: serviceForm.name.trim(),
      category: serviceForm.category || activeServiceTab,
      price: parseFloat(serviceForm.price),
      description: serviceForm.note?.trim() || ''
    };
    
    console.log('Sending service to database:', serviceData);
    
    try {
      // Try the regular API endpoint (might fail if employee not authorized)
      const response = await axios.post(
        'http://localhost:5000/api/services',
        serviceData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Service saved to database successfully:', response.data);
      showNotification('Success!', 'New service added to database!', 'success');
      
    } catch (apiError) {
      console.log('Direct API failed, trying employee endpoint:', apiError);
      
      // Try the employee-specific endpoint if it exists
      try {
        const employeeResponse = await axios.post(
          'http://localhost:5000/api/services/employee/add',
          serviceData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Service saved via employee endpoint:', employeeResponse.data);
        showNotification('Success!', 'New service added to database!', 'success');
        
      } catch (employeeError) {
        console.log('Employee endpoint failed:', employeeError);
        
        // Last resort: Try with simplified approach
        const simplifiedData = {
          name: serviceForm.name.trim(),
          category: serviceForm.category || activeServiceTab,
          price: parseFloat(serviceForm.price)
        };
        
        const finalResponse = await axios.post(
          'http://localhost:5000/api/services/create',
          simplifiedData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Service saved via create endpoint:', finalResponse.data);
        showNotification('Success!', 'New service added to database!', 'success');
      }
    }
    
    // Reset form
    setServiceForm({
      id: null,
      category: activeServiceTab,
      name: '',
      price: '',
      note: ''
    });
    
    // Refresh services from database
    await fetchServices();
    
  } catch (error) {
    console.error('Final error saving service:', error);
    
    // If all methods fail, show helpful message
    if (error.response?.status === 403) {
      showNotification(
        'Permission Denied', 
        'Employees cannot add services. Please contact administrator.',
        'error'
      );
    } else {
      showNotification(
        'Error', 
        error.response?.data?.error || 'Failed to add service. Please try again.',
        'error'
      );
    }
  }
};



  // ✅ EDIT SERVICE - View only for employees
  const editService = (service) => {
    console.log('Viewing service details:', service);
    
    setActiveServiceTab(service.category);
    
    setServiceForm({
      id: service.id,
      category: service.category,
      name: service.name || '',
      price: service.price || '',
      note: service.description || ''
    });
    
    // Show info that employees cannot edit
    showNotification(
      'View Only', 
      'Service details loaded. Note: Employees can view but cannot edit existing services.',
      'info'
    );
  };

  // ✅ DELETE SERVICE - Not allowed for employees
  const deleteService = (id) => {
    showNotification(
      'Not Allowed', 
      'Employees cannot delete services. Please contact administrator.',
      'error'
    );
  };

  const getServicesByFilter = (type) => {
    if (type === 'hair') return hairServices;
    if (type === 'skin') return skinServices;
    if (type === 'tattoo') return tattooServices;
    if (type === 'piercing') return piercingServices;

    return [
      ...hairServices,
      ...skinServices,
      ...tattooServices,
      ...piercingServices
    ];
  };

  const getAllServices = () => {
    return [...hairServices, ...skinServices, ...tattooServices, ...piercingServices];
  };

  // Services export functions
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

    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 30 }
    ];

    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '8B4513' } },
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

  const downloadServicesPDF = (type) => {
    const services = getServicesByFilter(type);
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(139, 69, 19);
    doc.text('Tressence by Simi', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
    doc.text('Luxury Salon Services Report', 14, 26);

    doc.setFontSize(10);
    doc.text(`Category: ${type.toUpperCase()}`, 14, 33);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

    const tableData = services.map((s, index) => [
      index + 1,
      s.name,
      s.category.toUpperCase(),
      `Rs ${Number(s.price).toFixed(2)}`,
      s.description || '-'
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['#', 'Service Name', 'Category', 'Price', 'Note']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 69, 19],
        textColor: [255, 255, 255],
        fontSize: 11,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [248, 243, 239]
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

  /* ================= CUSTOMERS ================= */
  const fetchCustomers = async () => {
    try {
      const res = await customersAPI.getAll();
      setCustomers(res.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showNotification('Error', 'Failed to load customers', 'error');
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    try {
      if (customerForm.id) {
        await customersAPI.update(customerForm.id, customerForm);
      } else {
        await customersAPI.create(customerForm);
      }

      setCustomerForm({ id: null, name: '', phone: '', email: '', address: '' });
      await fetchCustomers();
      showNotification('Success', 'Customer saved');
    } catch (error) {
      console.error('Error saving customer:', error);
      showNotification('Error', 'Failed to save customer', 'error');
    }
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

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
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
    const data = customersData.map((customer, i) => ({
      'Sr No': i + 1,
      'Name': customer.name || '',
      'Phone': formatPhoneNumber(customer.phone) || '',
      'Email': customer.email || '',
      'Address': customer.address || '',
      'Member Since': new Date(customer.created_at || customer.updated_at || new Date()).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 15 },
      { wch: 35 },
      { wch: 30 },
      { wch: 12 }
    ];

    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '8B4513' } },
      alignment: { horizontal: 'center' }
    };

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = headerStyle;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    
    XLSX.writeFile(
      workbook,
      `Tressence_Customers_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const downloadCustomersPDF = (customersData) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(139, 69, 19);
    doc.text('Tressence by Simi', 14, 18);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
    doc.text('Customer Management Report', 14, 26);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 33);
    doc.text(`Total Customers: ${customersData.length}`, 14, 38);
    
    const tableData = customersData.map((customer, index) => [
      index + 1,
      customer.name || 'N/A',
      formatPhoneNumber(customer.phone) || 'N/A',
      customer.email || 'N/A',
      customer.address || 'N/A',
      new Date(customer.created_at || customer.updated_at || new Date()).toLocaleDateString()
    ]);
    
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
        2: { cellWidth: 25, halign: 'left' },
        3: { cellWidth: 40, halign: 'left' },
        4: { cellWidth: 40, halign: 'left' },
        5: { cellWidth: 25, halign: 'center' }
      }
    });
    
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
    
    document.querySelector('.customer-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ================= RECORDS ================= */
  const fetchRecords = async () => {
    try {
      const res = await recordsAPI.getAll();
      setDailyRecords(res.data.records || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      showNotification('Error', 'Failed to load records', 'error');
    }
  };

  const handleServiceSelect = (serviceId) => {
    const allServices = getAllServices();
    const selectedService = allServices.find(s => s.id == serviceId);
    
    if (selectedService) {
      setRecordForm({
        ...recordForm,
        serviceId: selectedService.id,
        category: selectedService.category,
        price: selectedService.price
      });
    } else {
      setRecordForm({
        ...recordForm,
        serviceId: serviceId,
        category: '',
        price: ''
      });
    }
  };

  const handleCustomerSelect = (customerId) => {
    if (customerId === 'new') {
      setRecordForm({
        ...recordForm,
        customerId: 'new',
        customerName: '',
        phone: ''
      });
    } else {
      const selectedCustomer = customers.find(c => c.id == customerId);
      if (selectedCustomer) {
        setRecordForm({
          ...recordForm,
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          phone: selectedCustomer.phone || ''
        });
      } else {
        setRecordForm({
          ...recordForm,
          customerId: customerId,
          customerName: '',
          phone: ''
        });
      }
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!recordForm.serviceId || !recordForm.price) {
        showNotification('Error', 'Service and Price are required', 'error');
        return;
      }
      
      const selectedService = getAllServices().find(s => s.id == recordForm.serviceId);
      const dateValue = recordForm.date || new Date().toISOString().split('T')[0];
      
      const recordData = {
        customer_id: recordForm.customerId && recordForm.customerId !== 'new' ? recordForm.customerId : null,
        customer_name: recordForm.customerName || 
          (recordForm.customerId && recordForm.customerId !== 'new' ? 
            customers.find(c => c.id == recordForm.customerId)?.name : 'Walk-in Customer'),
        phone: recordForm.phone || 
          (recordForm.customerId && recordForm.customerId !== 'new' ? 
            customers.find(c => c.id == recordForm.customerId)?.phone : null),
        service_id: recordForm.serviceId,
        service_name: selectedService?.name || '',
        category: recordForm.category,
        price: parseFloat(recordForm.price),
        payment_method: recordForm.paymentMethod,
        date: dateValue,
        notes: recordForm.notes || '',
        employee_id: user?.id || 'employee',
        employee_name: user?.name || 'Employee'
      };
      
      await recordsAPI.create(recordData);
      
      setRecordForm({
        customerId: '',
        customerName: '',
        phone: '',
        serviceId: '',
        category: '',
        price: '',
        paymentMethod: 'cash',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      await fetchRecords();
      
      showNotification('Success', 'Record added successfully');
      
    } catch (error) {
      console.error('Error saving record:', error.response?.data || error.message);
      showNotification(
        'Error', 
        error.response?.data?.error || error.response?.data?.message || 'Failed to save record', 
        'error'
      );
    }
  };

  const getFilteredRecords = () => {
    let filtered = [...dailyRecords];
    
    if (recordSearch.trim()) {
      const searchTerm = recordSearch.toLowerCase();
      filtered = filtered.filter(record =>
        (record.customer_name && record.customer_name.toLowerCase().includes(searchTerm)) ||
        (record.phone && record.phone.toLowerCase().includes(searchTerm)) ||
        (record.service_name && record.service_name.toLowerCase().includes(searchTerm)) ||
        (record.category && record.category.toLowerCase().includes(searchTerm))
      );
    }
    
    if (dateFilter === 'today') {
      const today = getLocalDateString(new Date());
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = getLocalDateString(new Date(record.date));
        return recordDate === today;
      });
    } else if (dateFilter === 'specific-date') {
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = getLocalDateString(new Date(record.date));
        return recordDate === dateRange.start;
      });
    } else if (dateFilter === 'date-range') {
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = getLocalDateString(new Date(record.date));
        return recordDate >= dateRange.start && recordDate <= dateRange.end;
      });
    } else if (dateFilter === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStart = getLocalDateString(startOfMonth);
      const today = getLocalDateString(now);
      
      filtered = filtered.filter(record => {
        if (!record.date) return false;
        const recordDate = getLocalDateString(new Date(record.date));
        return recordDate >= monthStart && recordDate <= today;
      });
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at);
      const dateB = new Date(b.date || b.created_at);
      return dateB - dateA;
    });
  };

  const calculateIncome = () => {
    const filteredRecords = getFilteredRecords();
    return filteredRecords.reduce((total, record) => total + parseFloat(record.price || 0), 0);
  };

  const exportToCSV = (data, filename) => {
    const filteredRecords = getFilteredRecords();
    const totalIncome = calculateIncome();
    
    let csv = 'TRESSENCE BY SIMI - SERVICE RECORDS REPORT\n';
    csv += 'Luxury Beauty & Care Solutions\n\n';
    
    csv += `Report Generated: ${new Date().toLocaleString('en-IN', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })}\n`;
    csv += `Total Records: ${filteredRecords.length}\n`;
    csv += `Total Income: Rs ${totalIncome.toLocaleString('en-IN')}\n\n`;
    
    csv += '========================================\n\n';
    
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';
    
    data.forEach((row) => {
      const rowData = headers.map(header => {
        let value = row[header];
        if (value === null || value === undefined) return '';
        
        if (header === 'Phone' || header === 'phone') {
          value = "'" + String(value).replace(/\D/g, '');
          return value;
        }
        
        value = String(value).replace(/"/g, '""');
        
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value}"`;
        }
        return value;
      });
      csv += rowData.join(',') + '\n';
    });

    csv += '\n========================================\n';
    csv += `\nTotal Income: Rs ${totalIncome.toLocaleString('en-IN')}\n`;
    csv += 'Tressence by Simi | Premium Beauty Salon\n';
    csv += 'Mobile: +91 9833072760 | Email: tressencebysimi@gmail.com\n';

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tressence_${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data, filename) => {
    const filteredRecords = getFilteredRecords();
    const totalIncome = calculateIncome();
    
    const wb = XLSX.utils.book_new();
    
    const headerRows = [
      ['TRESSENCE BY SIMI'],
      ['Service Records Report'],
      [`Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}`],
      [`Total Records: ${filteredRecords.length}`],
      [`Total Income: Rs ${totalIncome.toLocaleString('en-IN')}`],
      []
    ];
    
    const headers = Object.keys(data[0]);
    const dataRows = data.map(row => headers.map(h => row[h] || '-'));
    const allRows = [...headerRows, headers, ...dataRows];
    
    allRows.push([]);
    allRows.push(['', '', '', '', 'TOTAL INCOME:', `Rs ${totalIncome.toLocaleString('en-IN')}`]);
    
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    
    ws['!cols'] = [
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 35 }
    ];
    
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Service Records');
    XLSX.writeFile(wb, `Tressence_${filename}.xlsx`);
  };

  const exportToPDF = (data, filename, options = {}) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    const filteredRecords = getFilteredRecords();
    const totalIncome = calculateIncome();
    
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, 297, 45, 'F');
    
    doc.setFillColor(248, 240, 227);
    doc.roundedRect(14, 8, 270, 30, 3, 3, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(139, 69, 19);
    doc.text('TRESSENCE BY SIMI', 149, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Luxury Beauty & Care Solutions', 149, 28, { align: 'center' });
    
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(0.5);
    doc.line(40, 32, 257, 32);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const infoY = 50;
    doc.text(`Generated: ${new Date().toLocaleString('en-IN', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })}`, 14, infoY);
    
    doc.text(options.dateRangeText || 'All Records', 14, infoY + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text(`Total Records: ${filteredRecords.length}`, 220, infoY);
    doc.text(`Total Income: Rs ${totalIncome.toLocaleString('en-IN')}`, 220, infoY + 5);
    
    const tableData = data.map(record => {
      let formattedDate = record.Date || '-';
      if (formattedDate !== '-') {
        if (formattedDate.includes('T') || formattedDate.length > 10) {
          const dateParts = formattedDate.split('T')[0].split('-');
          if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          }
        }
      }
      
      let formattedPrice = record.Price || '-';
      if (formattedPrice !== '-') {
        const cleanPrice = formattedPrice.toString().replace(/[^\d.]/g, '');
        if (cleanPrice && !isNaN(cleanPrice)) {
          formattedPrice = `Rs ${parseFloat(cleanPrice).toLocaleString('en-IN')}`;
        }
      }
      
      let formattedCategory = (record.Category || '-').toString().toUpperCase().replace(/\s+/g, '');
      
      return [
        formattedDate,
        record.Customer || '-',
        record.Phone || '-',
        record.Service || '-',
        formattedCategory,
        formattedPrice,
        record['Payment Method'] || '-',
        (record.Notes || '-').substring(0, 50)
      ];
    });
    
    autoTable(doc, {
      startY: infoY + 12,
      head: [['Date', 'Customer', 'Phone', 'Service', 'Category', 'Price', 'Payment', 'Notes']],
      body: tableData,
      
      theme: 'grid',
      
      headStyles: {
        fillColor: [139, 69, 19],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.5,
        lineColor: [100, 50, 10]
      },
      
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
        cellPadding: 4,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
        valign: 'middle'
      },
      
      alternateRowStyles: {
        fillColor: [252, 248, 245]
      },
      
      columnStyles: {
        0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 35, halign: 'left' },
        2: { cellWidth: 28, halign: 'left' },
        3: { cellWidth: 45, halign: 'left' },
        4: { cellWidth: 22, halign: 'center', fontStyle: 'bold', valign: 'middle' },
        5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 25, halign: 'center' },
        7: { cellWidth: 50, halign: 'left', fontSize: 8 }
      },
      
      didParseCell: function(data) {
        if (data.column.index === 4 && data.section === 'body') {
          const category = data.cell.text[0]?.toLowerCase();
          if (category === 'hair') data.cell.styles.fillColor = [227, 242, 253];
          else if (category === 'skin') data.cell.styles.fillColor = [243, 229, 245];
          else if (category === 'tattoo') data.cell.styles.fillColor = [255, 243, 224];
          else if (category === 'piercing') data.cell.styles.fillColor = [252, 228, 236];
        }
        
        if (data.column.index === 6 && data.section === 'body') {
          const payment = data.cell.text[0]?.toLowerCase();
          if (payment === 'cash') data.cell.styles.fillColor = [232, 245, 233];
          else if (payment === 'card') data.cell.styles.fillColor = [255, 243, 224];
          else if (payment === 'upi') data.cell.styles.fillColor = [227, 242, 253];
        }
        
        if (data.column.index === 5 && data.section === 'body') {
          data.cell.styles.textColor = [139, 69, 19];
        }
      }
    });
    
    const finalY = doc.lastAutoTable.finalY || 60;
    
    doc.setFillColor(248, 240, 227);
    doc.roundedRect(14, finalY + 8, 270, 20, 2, 2, 'F');
    
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, finalY + 8, 270, 20, 2, 2, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(139, 69, 19);
    
    doc.text(`TOTAL INCOME: Rs ${totalIncome.toLocaleString('en-IN')}`, 149, finalY + 17, { 
      align: 'center' 
    });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Based on ${filteredRecords.length} service records`, 149, finalY + 23, { 
      align: 'center' 
    });
    
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFillColor(139, 69, 19);
    doc.rect(0, pageHeight - 20, 297, 20, 'F');
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Tressence by Simi | Premium Beauty & Care', 149, pageHeight - 12, { 
      align: 'center' 
    });
    
    doc.setFontSize(8);
    doc.text('Mobile: +91 9833072760 | Email: tressencebysimi@gmail.com', 
      149, pageHeight - 7, { align: 'center' });
    
    doc.save(`Tressence_${filename}.pdf`);
  };

  /* ================= STATS ================= */
  useEffect(() => {
    const now = new Date();
    const today = getLocalDateString(now);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStart = getLocalDateString(startOfWeek);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = getLocalDateString(startOfMonth);
    
    const todayRecords = dailyRecords.filter(r => {
      if (!r.date) return false;
      const recordDate = getLocalDateString(new Date(r.date));
      return recordDate === today;
    });
    
    const weekRecords = dailyRecords.filter(r => {
      if (!r.date) return false;
      const recordDate = getLocalDateString(new Date(r.date));
      return recordDate >= weekStart && recordDate <= today;
    });
    
    const monthRecords = dailyRecords.filter(r => {
      if (!r.date) return false;
      const recordDate = getLocalDateString(new Date(r.date));
      return recordDate >= monthStart && recordDate <= today;
    });

    const dailyIncome = todayRecords.reduce(
      (sum, r) => sum + Number(r.price || 0),
      0
    );
    
    const weeklyIncome = weekRecords.reduce(
      (sum, r) => sum + Number(r.price || 0),
      0
    );
    
    const monthlyIncome = monthRecords.reduce(
      (sum, r) => sum + Number(r.price || 0),
      0
    );

    setStats({
      dailyIncome,
      weeklyIncome,
      monthlyIncome,
      totalCustomers: customers.length,
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
    hairServices,
    skinServices,
    tattooServices,
    piercingServices
  ]);

  /* ================= HIDE STAFF MANAGEMENT IN SIDEBAR ================= */
  useEffect(() => {
    // Function to hide Staff Management from sidebar
    const hideStaffManagement = () => {
      // Find all sidebar list items
      const sidebarItems = document.querySelectorAll('.sidebar-nav li');
      
      // Find the Staff Management item (it's the 3rd li - after Dashboard and Manage Services)
      if (sidebarItems.length >= 3) {
        const staffManagementItem = sidebarItems[2]; // 3rd item (index 2)
        
        // Check if it contains "Staff Management" text
        const spanElement = staffManagementItem.querySelector('span');
        if (spanElement && spanElement.textContent.includes('Staff Management')) {
          // Hide it
          staffManagementItem.style.display = 'none';
        }
      }
    };
    
    // Run on mount and when sidebar opens/closes
    const timer = setTimeout(hideStaffManagement, 100);
    
    // Re-run when sidebar state changes
    const interval = setInterval(hideStaffManagement, 500);
    
    // Cleanup
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      
      // Show Staff Management again when leaving UserDashboard
      const sidebarItems = document.querySelectorAll('.sidebar-nav li');
      if (sidebarItems.length >= 3) {
        sidebarItems[2].style.display = '';
      }
    };
  }, [sidebarOpen, mobileSidebarOpen]); // Re-run when sidebar state changes

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading User Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-container user-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'info' && 'ℹ'}
            </div>
            <div className="notification-details">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
            </div>
            <button className="notification-close" onClick={closeNotification}>
              <FaTimes />
            </button>
          </div>
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
        isUserDashboard={true}
      />

      <main className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <div className="content-wrapper">
          {activeTab === 'dashboard' && (
            <DashboardContent
              user={user}
              stats={stats}
              dailyRecords={dailyRecords}
              setActiveTab={setActiveTab}
              isUserDashboard={true}
            />
          )}

          {activeTab === 'manage-services' && (
            <ManageServicesContent
              hairServices={hairServices}
              skinServices={skinServices}
              tattooServices={tattooServices}
              piercingServices={piercingServices}
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
              user={user}
            />
          )}

          {activeTab === 'customer-management' && (
            <CustomerManagementContent
              customers={customers}
              customerForm={customerForm}
              setCustomerForm={setCustomerForm}
              handleCustomerSubmit={handleCustomerSubmit}
              editCustomer={editCustomer}
              deleteCustomer={deleteService}
              customerSearch={customerSearch}
              setCustomerSearch={setCustomerSearch}
              getFilteredCustomers={getFilteredCustomers}
              generateReport={generateReport}
              formatPhoneNumber={formatPhoneNumber}
            />
          )}

          {activeTab === 'record-management' && (
            <RecordManagementContent
              customers={customers}
              hairServices={hairServices}
              skinServices={skinServices}
              tattooServices={tattooServices}
              piercingServices={piercingServices}
              dailyRecords={dailyRecords}
              recordForm={recordForm}
              setRecordForm={setRecordForm}
              handleRecordSubmit={handleRecordSubmit}
              getAllServices={getAllServices}
              handleServiceSelect={handleServiceSelect}
              handleCustomerSelect={handleCustomerSelect}
              deleteRecord={deleteService}
              deleteAllRecords={deleteService}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              recordSearch={recordSearch}
              setRecordSearch={setRecordSearch}
              getFilteredRecords={getFilteredRecords}
              calculateIncome={calculateIncome}
              exportToCSV={exportToCSV}
              exportToExcel={exportToExcel}
              exportToPDF={exportToPDF}
              showNotification={showNotification}
              formatDateToDDMMYYYY={formatDateToDDMMYYYY}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;