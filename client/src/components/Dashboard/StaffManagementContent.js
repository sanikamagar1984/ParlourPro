import React, { useState } from 'react';
import { FaSearch, FaEdit, FaTrash, FaKey, FaTimes } from 'react-icons/fa';

const StaffManagementContent = ({
  staff = [],
  updateEmployee,
  updateEmployeePassword,
  deleteEmployee
}) => {
  const [search, setSearch] = useState('');
  const [editStaff, setEditStaff] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});

  /* ================= FILTER ================= */
  const filteredStaff = staff.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase()) ||
    emp.phone?.includes(search)
  );

  /* ================= VALIDATION ================= */
  const validateEmployee = () => {
    const newErrors = {};

    // Name validation
    if (!editStaff.name || editStaff.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editStaff.email || !emailRegex.test(editStaff.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!editStaff.phone || !phoneRegex.test(editStaff.phone)) {
      newErrors.phone = 'Phone must be 10 digits starting with 6-9';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SAVE UPDATE ================= */
  const handleUpdate = () => {
    if (!validateEmployee()) {
      return;
    }

    updateEmployee(editStaff);
    setEditStaff(null);
    setErrors({});
  };

  const handlePasswordUpdate = () => {
    if (!newPassword || newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    updateEmployeePassword(passwordModal.id, newPassword);
    setPasswordModal(null);
    setNewPassword('');
    setErrors({});
  };

  return (
    <div className="staff-management">

      {/* HEADER */}
      <div className="section-header">
        <h1>Employee Management</h1>
        <p>All registered employees from signup</p>
      </div>

      {/* SEARCH */}
      <div className="filter-section">
        <div className="search-bar">
          <FaSearch />
          <input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStaff.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.phone || '-'}</td>
                <td>
                  <span className="role-badge">{emp.role}</span>
                </td>
                <td>{new Date(emp.created_at).toLocaleDateString()}</td>

                <td className="action-buttons">
                  <button 
                    className="btn-edit" 
                    onClick={() => {
                      setEditStaff(emp);
                      setErrors({});
                    }}
                    title="Edit Employee"
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="btn-key"
                    onClick={() => {
                      setPasswordModal(emp);
                      setNewPassword('');
                      setErrors({});
                    }}
                    title="Change Password"
                  >
                    <FaKey />
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => deleteEmployee(emp.id)}
                    title="Delete Employee"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">
                  {search ? 'No employees found matching your search' : 'No employees registered yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editStaff && (
        <div className="modal">
          <div className="modal-box">
            <h2>Edit Employee Details</h2>

            <div className="form-group">
              <input
                placeholder="Full Name"
                value={editStaff.name}
                onChange={(e) =>
                  setEditStaff({ ...editStaff, name: e.target.value })
                }
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <input
                placeholder="Email"
                type="email"
                value={editStaff.email}
                onChange={(e) =>
                  setEditStaff({ ...editStaff, email: e.target.value })
                }
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                placeholder="Phone (10 digits)"
                value={editStaff.phone || ''}
                onChange={(e) =>
                  setEditStaff({ ...editStaff, phone: e.target.value })
                }
                maxLength="10"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setEditStaff(null);
                  setErrors({});
                }}
              >
                <FaTimes /> Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PASSWORD MODAL ================= */}
      {passwordModal && (
        <div className="modal">
          <div className="modal-box">
            <h2>Update Password</h2>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Changing password for: <strong>{passwordModal.name}</strong>
            </p>

            <div className="form-group">
              <input
                type="password"
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setPasswordModal(null);
                  setNewPassword('');
                  setErrors({});
                }}
              >
                <FaTimes /> Cancel
              </button>

              <button className="btn-primary" onClick={handlePasswordUpdate}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffManagementContent;