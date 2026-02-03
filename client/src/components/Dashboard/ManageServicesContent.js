// client/src/components/Dashboard/ManageServicesContent.js
import React, { useState, useEffect } from 'react';

import {
  FaCut,
  FaTint,
  FaPalette,
  FaPlus,
  FaEdit,
  FaCircle,
  FaTrash,
  FaTimes,
  FaSearch
} from 'react-icons/fa';

const ManageServicesContent = ({
  hairServices = [],
  skinServices = [],
  tattooServices = [],
  piercingServices = [],
  serviceForm,
  setServiceForm,
  activeServiceTab,
  setActiveServiceTab,
  handleServiceSubmit,
  editService = () => {},
  deleteService,
  downloadServicesExcel,
  downloadServicesPDF,
  downloadServicesCSV
}) => {
  const [search, setSearch] = useState('');

  /* ================= TAB → CATEGORY SYNC ================= */
  useEffect(() => {
    setServiceForm(prev => ({
      ...prev,
      category: activeServiceTab
    }));
  }, [activeServiceTab, setServiceForm]);

  /* ================= SERVICES BY CATEGORY ================= */
  const servicesByCategory = {
    hair: hairServices,
    skin: skinServices,
    tattoo: tattooServices,
    piercing: piercingServices
  };

  const servicesToShow = servicesByCategory[activeServiceTab] || [];

  /* ================= SEARCH ================= */
  const filteredServices = servicesToShow.filter(service =>
    service.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="manage-services">

      {/* HEADER */}
      <div className="section-header">
        <h1>Manage Services</h1>
        <p>Add, update or delete services</p>
      </div>

      {/* ================= CATEGORY TABS ================= */}
      <div className="service-tabs">
        <button
          className={activeServiceTab === 'hair' ? 'active' : ''}
          onClick={() => setActiveServiceTab('hair')}
        >
          <FaCut /> Hair ({hairServices.length})
        </button>

        <button
          className={activeServiceTab === 'skin' ? 'active' : ''}
          onClick={() => setActiveServiceTab('skin')}
        >
          <FaTint /> Skin ({skinServices.length})
        </button>

        <button
          className={activeServiceTab === 'tattoo' ? 'active' : ''}
          onClick={() => setActiveServiceTab('tattoo')}
        >
          <FaPalette /> Tattoo ({tattooServices.length})
        </button>

        <button
          className={activeServiceTab === 'piercing' ? 'active' : ''}
          onClick={() => setActiveServiceTab('piercing')}
        >
          <FaCircle /> Piercing ({piercingServices.length})
        </button>
      </div>

      {/* ================= SEARCH & EXPORT ================= */}
      <div className="filter-section">
        <div className="search-bar">
          <FaSearch />
          <input
            className="search-input"
            placeholder="Search service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="export-options">
          <button onClick={() => downloadServicesExcel(activeServiceTab)}>Excel</button>
          <button onClick={() => downloadServicesPDF(activeServiceTab)}>PDF</button>
          <button onClick={() => downloadServicesCSV(activeServiceTab)}>CSV</button>
          <button onClick={() => downloadServicesExcel('all')}>All Services (Excel)</button>
          <button onClick={() => downloadServicesPDF('all')}>All Services (PDF)</button>
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div className="service-form-section">
        <h2>{serviceForm.id ? 'Edit Service' : 'Add New Service'}</h2>

        <form onSubmit={handleServiceSubmit} className="service-form">
          <div className="form-row">

            <div className="form-group">
              <label>Category</label>
              <select
                value={serviceForm.category}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, category: e.target.value })
                }
              >
                <option value="hair">Hair</option>
                <option value="skin">Skin</option>
                <option value="tattoo">Tattoo</option>
                <option value="piercing">Piercing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Service Name *</label>
              <input
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={serviceForm.price}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, price: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Extra Note (optional)</label>
            <textarea
              rows="3"
              placeholder="Any additional note"
              value={serviceForm.note || ''}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, note: e.target.value })
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {serviceForm.id ? <FaEdit /> : <FaPlus />}
              {serviceForm.id ? ' Update Service' : ' Add Service'}
            </button>

            {serviceForm.id && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setServiceForm({
                    id: null,
                    category: activeServiceTab,
                    name: '',
                    price: '',
                    note: ''
                  })
                }
              >
                <FaTimes /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ================= LIST ================= */}
      <div className="services-list">
        <h2>All Services ({filteredServices.length})</h2>

        <div className="services-grid">
          {filteredServices.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <span className="service-price">₹{service.price}</span>
              </div>

              <span className={`service-category ${service.category}`}>
                {service.category}
              </span>

              {service.description && (
                <p className="form-hint">{service.description}</p>
              )}

              <div className="service-actions">
                <button className="btn-edit" onClick={() => editService(service)}>
                  <FaEdit /> Edit
                </button>

                <button className="btn-delete" onClick={() => deleteService(service.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div className="no-data">
              <p>No services found</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ManageServicesContent;