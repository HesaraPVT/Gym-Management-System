import React, { useState, useEffect } from 'react';
import './UserMemberships.css';

function UserMemberships() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    transactionRef: '',
    paymentFile: null,
    paymentMethod: 'BANK'
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
  }, []);

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
    setShowDetailsModal(true);
  };

  const handleProceedToPurchase = () => {
    setShowDetailsModal(false);
    setShowPurchaseModal(true);
    // Reset form
    setPurchaseForm({
      fullName: '',
      email: '',
      phone: '',
      transactionRef: '',
      paymentFile: null,
      paymentMethod: 'BANK'
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = (event) => {
          setPurchaseForm({
            ...purchaseForm,
            [name]: {
              name: file.name,
              size: file.size,
              type: file.type,
              data: event.target.result // base64 encoded data
            }
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPurchaseForm({
        ...purchaseForm,
        [name]: value
      });
    }
  };

  const handleSubmitPurchase = () => {
    if (!purchaseForm.fullName || !purchaseForm.phone) {
      alert('Please fill all required fields');
      return;
    }

    if (purchaseForm.paymentMethod === 'BANK') {
      if (!purchaseForm.transactionRef) {
        alert('Please enter transaction reference number');
        return;
      }
      if (!purchaseForm.paymentFile) {
        alert('Please upload bank payment slip');
        return;
      }
    } else {
      if (!purchaseForm.email) {
        alert('Please enter your email');
        return;
      }
    }

    const subscription = {
      id: `SUB-${Date.now()}`,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      price: selectedPackage.price,
      duration: selectedPackage.duration,
      fullName: purchaseForm.fullName,
      email: purchaseForm.email,
      phone: purchaseForm.phone,
      transactionRef: purchaseForm.transactionRef,
      paymentMethod: purchaseForm.paymentMethod,
      paymentFile: purchaseForm.paymentFile ? purchaseForm.paymentFile : null,
      date: new Date().toLocaleDateString(),
      status: 'PENDING'
    };

    const subscriptions = JSON.parse(localStorage.getItem('userSubscriptions')) || [];
    subscriptions.push(subscription);
    localStorage.setItem('userSubscriptions', JSON.stringify(subscriptions));

    alert('Payment request submitted! Admin will verify and activate your membership.');
    resetPurchaseModal();
  };

  const resetPurchaseModal = () => {
    setPurchaseForm({
      fullName: '',
      email: '',
      phone: '',
      transactionRef: '',
      paymentFile: null,
      paymentMethod: 'BANK'
    });
    setSelectedPackage(null);
    setShowDetailsModal(false);
    setShowPurchaseModal(false);
  };

  return (
    <div className="user-memberships">
      <div className="memberships-header">
        <h1>Membership <span>Packages</span></h1>
        <p>View our gym's membership tiers</p>
      </div>

      <div className="packages-grid">
        {packages.map(pkg => (
          <div 
            key={pkg.id} 
            className={`package-card ${pkg.popular ? 'popular' : ''}`}
            style={{ borderTopColor: pkg.color }}
          >
            {pkg.popular && <div className="popular-badge">POPULAR</div>}
            
            <div className="package-name">{pkg.name}</div>
            
            <div className="package-price">
              <span className="price">LKR {pkg.price.toLocaleString()}</span>
              <span className="duration">/ {pkg.duration}</span>
            </div>

            <div className="features-list">
              {pkg.features.map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <span className="feature-dot"></span>
                  {feature}
                </div>
              ))}
            </div>

            <div className="members-info">
              <span>Members: {pkg.activeMembers} / {pkg.maxMembers}</span>
            </div>

            <button 
              className="select-btn"
              onClick={() => handleViewDetails(pkg)}
              style={{ backgroundColor: pkg.color }}
            >
              Select / View Details
            </button>
          </div>
        ))}
      </div>

      {showDetailsModal && selectedPackage && (
        <div className="modal-overlay" onClick={() => resetPurchaseModal()}>
          <div className="modal modal-small" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => resetPurchaseModal()}>×</button>
            
            <div className="modal-header-content">
              <h2>{selectedPackage.name}</h2>
              <p>Duration: {selectedPackage.duration}</p>
            </div>

            <div className="modal-price">
              <span>LKR {selectedPackage.price.toLocaleString()}</span>
            </div>

            <div className="features-section">
              <h3>Included Features</h3>
              <ul className="features-modal-list">
                {selectedPackage.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="checkmark">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-buttons">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => resetPurchaseModal()}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="purchase-btn"
                onClick={handleProceedToPurchase}
                style={{ backgroundColor: selectedPackage.color }}
              >
                Purchase Membership
              </button>
            </div>
          </div>
        </div>
      )}

      {showPurchaseModal && selectedPackage && (
        <div className="modal-overlay" onClick={() => resetPurchaseModal()}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => resetPurchaseModal()}>×</button>
            
            <div className="modal-header-complete">
              <h2>Complete Your Subscription</h2>
              <p>You selected: {selectedPackage.name} ({selectedPackage.duration}) for LKR {selectedPackage.price.toLocaleString()}</p>
            </div>

            <form className="purchase-form-complete">
              {purchaseForm.paymentMethod === 'BANK' && (
                <div className="payment-instructions">
                  <h3>Payment Instructions (Bank Transfer)</h3>
                  <p>Please transfer exactly <strong>LKR {selectedPackage.price.toLocaleString()}</strong> to the following bank account:</p>
                  <div className="bank-details">
                    <div className="detail-row">
                      <span className="detail-label">Bank:</span>
                      <span className="detail-value">Commercial Bank</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account Name:</span>
                      <span className="detail-value">Power World Fitness</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account No:</span>
                      <span className="detail-value">1234567890</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Branch:</span>
                      <span className="detail-value">Colombo</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row-single">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={purchaseForm.fullName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row-single">
                <div className="form-group">
                  <label>Contact Information *</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone number or email"
                    value={purchaseForm.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {purchaseForm.paymentMethod === 'BANK' && (
                <>
                  <div className="form-row-single">
                    <div className="form-group">
                      <label>Transaction Reference Number *</label>
                      <input
                        type="text"
                        name="transactionRef"
                        placeholder="Found on your transfer receipt"
                        value={purchaseForm.transactionRef}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-single">
                    <div className="form-group">
                      <label>Upload Bank Payment Slip (Required) *</label>
                      <div className="file-input-wrapper">
                        <input
                          type="file"
                          name="paymentFile"
                          accept="image/*,.pdf"
                          onChange={handleInputChange}
                          id="payment-file"
                        />
                        <label htmlFor="payment-file" className="file-label">
                          {purchaseForm.paymentFile ? purchaseForm.paymentFile.name : 'Choose File'}
                        </label>
                        {purchaseForm.paymentFile && (
                          <span className="file-selected">✓ {purchaseForm.paymentFile.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {purchaseForm.paymentMethod !== 'BANK' && (
                <div className="form-row-single">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={purchaseForm.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="modal-buttons-complete">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => resetPurchaseModal()}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="submit-btn"
                  onClick={handleSubmitPurchase}
                >
                  Submit Payment Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMemberships;
