import React, { useState, useEffect } from 'react';
import './AdminMemberships.css';

function AdminMemberships() {
  const [activeTab, setActiveTab] = useState('packages');
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPaymentSlipModal, setShowPaymentSlipModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '1 Month',
    maxMembers: '',
    activeMembers: 0,
    features: [''],
    status: 'Active',
    popular: false
  });

  useEffect(() => {
    const savedPackages = JSON.parse(localStorage.getItem('membershipPackages')) || [
      {
        id: 1,
        name: 'STARTER',
        price: 8700,
        duration: '3 Months',
        maxMembers: 50,
        activeMembers: 12,
        features: ['Full Gym Access', 'Locker Room', '2 Guest Passes/Months'],
        status: 'Active',
        popular: false,
        color: '#0ea5e9'
      },
      {
        id: 2,
        name: 'PRO',
        price: 17000,
        duration: '3 Months',
        maxMembers: 100,
        activeMembers: 6,
        features: ['Full Gym Access', 'Locker Room', 'Unlimited Guest Passes', 'Group Classes', 'Personal trainer (2months)'],
        status: 'Active',
        popular: true,
        color: '#f43f5e'
      },
      {
        id: 3,
        name: 'ELITE ANNUAL',
        price: 149700,
        duration: '12 Months',
        maxMembers: 30,
        activeMembers: 2,
        features: ['Full Gym Access', 'Premium Locker', 'Unlimited Everything', 'Personal Trainer (8/months)', 'Nutrition Consultation', 'Priority Booking'],
        status: 'Active',
        popular: false,
        color: '#f59e0b'
      }
    ];
    setPackages(savedPackages);

    // Load subscriptions
    const savedSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions')) || [];
    setSubscriptions(savedSubscriptions);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    const filteredFeatures = formData.features.filter(f => f.trim());
    
    if (!formData.name || !formData.price || !formData.maxMembers) {
      alert('Please fill all required fields');
      return;
    }

    let updatedPackages;
    if (editingId) {
      updatedPackages = packages.map(pkg =>
        pkg.id === editingId
          ? { ...pkg, ...formData, features: filteredFeatures }
          : pkg
      );
    } else {
      updatedPackages = [
        ...packages,
        {
          id: Date.now(),
          ...formData,
          features: filteredFeatures,
          color: ['#0ea5e9', '#f43f5e', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'][Math.floor(Math.random() * 6)]
        }
      ];
    }

    setPackages(updatedPackages);
    localStorage.setItem('membershipPackages', JSON.stringify(updatedPackages));
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '1 Month',
      maxMembers: '',
      activeMembers: 0,
      features: [''],
      status: 'Active',
      popular: false
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (pkg) => {
    setFormData(pkg);
    setEditingId(pkg.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const updatedPackages = packages.filter(pkg => pkg.id !== id);
      setPackages(updatedPackages);
      localStorage.setItem('membershipPackages', JSON.stringify(updatedPackages));
    }
  };

  const handleApproveSubscription = (subscriptionId) => {
    const updatedSubscriptions = subscriptions.map(sub => {
      if (sub.id === subscriptionId) {
        // Update active members count
        const updatedPackages = packages.map(pkg => {
          if (pkg.id === sub.packageId && pkg.activeMembers < pkg.maxMembers) {
            return { ...pkg, activeMembers: pkg.activeMembers + 1 };
          }
          return pkg;
        });
        setPackages(updatedPackages);
        localStorage.setItem('membershipPackages', JSON.stringify(updatedPackages));
        
        return { ...sub, status: 'APPROVED' };
      }
      return sub;
    });
    setSubscriptions(updatedSubscriptions);
    localStorage.setItem('userSubscriptions', JSON.stringify(updatedSubscriptions));
    alert('Subscription approved! Member activated.');
  };

  const handleRejectSubscription = (subscriptionId) => {
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === subscriptionId ? { ...sub, status: 'REJECTED' } : sub
    );
    setSubscriptions(updatedSubscriptions);
    localStorage.setItem('userSubscriptions', JSON.stringify(updatedSubscriptions));
    alert('Subscription rejected.');
  };

  const handleViewPaymentSlip = (subscription) => {
    setSelectedSubscription(subscription);
    setShowPaymentSlipModal(true);
  };

  const closePaymentSlipModal = () => {
    setShowPaymentSlipModal(false);
    setSelectedSubscription(null);
    setShowFilePreview(false);
    setPreviewFile(null);
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  const handleDownloadFile = (file) => {
    if (!file || !file.data) return;
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeFilePreview = () => {
    setShowFilePreview(false);
    setPreviewFile(null);
  };

  return (
    <div className="admin-memberships">
      <div className="admin-header">
        <h1>Membership <span>Packages</span></h1>
        <p>Manage your gym's membership tiers and subscriptions</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          Packages
        </button>
        <button 
          className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
      </div>

      {activeTab === 'packages' && (
      <div className="packages-tab">
      <button className="new-package-btn" onClick={() => setShowModal(true)}>
        + New Package
      </button>

      <div className="packages-grid">
        {packages.map(pkg => (
          <div key={pkg.id} className="package-card" style={{ borderTopColor: pkg.color }}>
            {pkg.popular && <div className="popular-badge">POPULAR</div>}
            
            <div className="package-header">
              <h3>{pkg.name}</h3>
              <span className={`status-badge ${pkg.status.toLowerCase()}`}>
                {pkg.status}
              </span>
            </div>

            <div className="package-price">
              <span className="price">LKR {pkg.price.toLocaleString()}</span>
              <span className="duration">/ {pkg.duration}</span>
            </div>

            <div className="package-info">
              <p><strong>Duration:</strong> {pkg.duration}</p>
              <p><strong>Max Members:</strong> {pkg.maxMembers}</p>
            </div>

            <div className="members-section">
              <label>Members</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${(pkg.activeMembers / pkg.maxMembers) * 100}%`,
                    backgroundColor: pkg.color
                  }}
                ></div>
              </div>
              <span className="member-count">{pkg.activeMembers} / {pkg.maxMembers}</span>
            </div>

            <div className="features-list">
              {pkg.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </div>

            <div className="package-actions">
              <button className="edit-btn" onClick={() => handleEdit(pkg)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(pkg.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
      )}

      {activeTab === 'subscriptions' && (
      <div className="subscriptions-tab">
        <div className="subscriptions-header">
          <h2>Subscription Requests</h2>
          <p>Review bank transfer payments and activate memberships</p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="no-data">
            <p>No subscription requests yet</p>
          </div>
        ) : (
          <div className="subscriptions-table-wrapper">
            <table className="subscriptions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User / Contact</th>
                  <th>Package</th>
                  <th>Ref. Number</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className={`sub-row ${sub.status.toLowerCase()}`}>
                    <td className="date-cell">{sub.date}</td>
                    <td className="user-cell">
                      <div className="user-info">
                        <div className="user-name">{sub.fullName}</div>
                        <div className="user-contact">{sub.phone}</div>
                        <div className="user-email">{sub.email}</div>
                      </div>
                    </td>
                    <td className="package-cell">
                      <span className="package-name">{sub.packageName}</span>
                      <span className="package-price">LKR {sub.price.toLocaleString()} / {sub.duration}</span>
                    </td>
                    <td className="ref-cell">{sub.id}</td>
                    <td className="payment-cell">{sub.paymentMethod}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${sub.status.toLowerCase()}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons-group">
                        <button 
                          className="view-slip-btn"
                          onClick={() => handleViewPaymentSlip(sub)}
                        >
                          View Slip
                        </button>
                        {sub.status === 'PENDING' && (
                          <div className="pending-actions">
                            <button 
                              className="approve-btn"
                              onClick={() => handleApproveSubscription(sub.id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleRejectSubscription(sub.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {sub.status === 'APPROVED' && (
                          <span className="activated-badge">✓ Activated</span>
                        )}
                        {sub.status === 'REJECTED' && (
                          <span className="rejected-badge">✗ Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Package' : 'Create New Package'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Package Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Pro Monthly"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (LKR) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select name="duration" value={formData.duration} onChange={handleInputChange}>
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>12 Months</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Members *</label>
                  <input
                    type="number"
                    name="maxMembers"
                    placeholder="100"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Active Members</label>
                  <input
                    type="number"
                    name="activeMembers"
                    value={formData.activeMembers}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleInputChange}
                  />
                  Mark as Popular
                </label>
              </div>

              <div className="form-group">
                <label>Features</label>
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="feature-input">
                    <input
                      type="text"
                      placeholder={`Feature ${idx + 1}`}
                      value={feature}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    />
                    {formData.features.length > 1 && (
                      <button
                        className="remove-feature-btn"
                        onClick={() => removeFeature(idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button className="add-feature-btn" onClick={addFeature}>
                  + Add Feature
                </button>
              </div>

              <div className="modal-buttons">
                <button className="cancel-btn" onClick={resetForm}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>
                  {editingId ? 'Update' : 'Create'} Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentSlipModal && selectedSubscription && (
        <div className="modal-overlay" onClick={closePaymentSlipModal}>
          <div className="modal payment-slip-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closePaymentSlipModal}>×</button>
            
            <div className="modal-header">
              <h2>Payment Slip Details</h2>
            </div>

            <div className="payment-slip-content">
              <div className="slip-section">
                <h3>Subscription Information</h3>
                <div className="slip-row">
                  <span className="slip-label">Subscription ID:</span>
                  <span className="slip-value">{selectedSubscription.id}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">User Name:</span>
                  <span className="slip-value">{selectedSubscription.fullName}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Contact:</span>
                  <span className="slip-value">{selectedSubscription.phone}</span>
                </div>
                {selectedSubscription.email && (
                  <div className="slip-row">
                    <span className="slip-label">Email:</span>
                    <span className="slip-value">{selectedSubscription.email}</span>
                  </div>
                )}
                <div className="slip-row">
                  <span className="slip-label">Date Submitted:</span>
                  <span className="slip-value">{selectedSubscription.date}</span>
                </div>
              </div>

              <div className="slip-section">
                <h3>Package Information</h3>
                <div className="slip-row">
                  <span className="slip-label">Package:</span>
                  <span className="slip-value">{selectedSubscription.packageName}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Price:</span>
                  <span className="slip-value">LKR {selectedSubscription.price.toLocaleString()}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Duration:</span>
                  <span className="slip-value">{selectedSubscription.duration}</span>
                </div>
              </div>

              <div className="slip-section">
                <h3>Payment Information</h3>
                <div className="slip-row">
                  <span className="slip-label">Payment Method:</span>
                  <span className="slip-value">{selectedSubscription.paymentMethod}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Transaction Reference:</span>
                  <span className="slip-value">{selectedSubscription.transactionRef}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Payment Slip File:</span>
                  <div className="slip-value file-section">
                    {selectedSubscription.paymentFile ? (
                      <>
                        <span className="file-name">
                          {typeof selectedSubscription.paymentFile === 'object' 
                            ? selectedSubscription.paymentFile.name 
                            : selectedSubscription.paymentFile}
                        </span>
                        {typeof selectedSubscription.paymentFile === 'object' && selectedSubscription.paymentFile.data && (
                          <div className="file-actions">
                            <button 
                              className="preview-btn"
                              onClick={() => handlePreviewFile(selectedSubscription.paymentFile)}
                            >
                              Preview
                            </button>
                            <button 
                              className="download-btn"
                              onClick={() => handleDownloadFile(selectedSubscription.paymentFile)}
                            >
                              Download
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      'No file uploaded'
                    )}
                  </div>
                </div>
              </div>

              <div className="slip-section">
                <h3>Verification Status</h3>
                <div className="slip-row">
                  <span className="slip-label">Status:</span>
                  <span className={`status-badge ${selectedSubscription.status.toLowerCase()}`}>
                    {selectedSubscription.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={closePaymentSlipModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showFilePreview && previewFile && previewFile.data && (
        <div className="modal-overlay" onClick={closeFilePreview}>
          <div className="modal file-preview-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeFilePreview}>×</button>
            
            <div className="modal-header">
              <h2>File Preview</h2>
              <p>{previewFile.name}</p>
            </div>

            <div className="file-preview-content">
              {previewFile.type && previewFile.type.startsWith('image') ? (
                <img src={previewFile.data} alt={previewFile.name} className="preview-image" />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe 
                  src={previewFile.data} 
                  title={previewFile.name}
                  className="preview-pdf"
                />
              ) : (
                <div className="preview-unsupported">
                  <p>Preview not available for this file type</p>
                  <p>File: {previewFile.name}</p>
                  <p>Type: {previewFile.type}</p>
                  <button className="download-btn" onClick={() => handleDownloadFile(previewFile)}>
                    Download File
                  </button>
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={closeFilePreview}>Close</button>
              <button className="download-btn" onClick={() => handleDownloadFile(previewFile)}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMemberships;
