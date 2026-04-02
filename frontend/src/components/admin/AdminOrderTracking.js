import React, { useState, useEffect } from 'react';
import './AdminOrderTracking.css';

function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [locationForm, setLocationForm] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(savedOrders);
  }, []);

  const handleSelectOrder = (order, index) => {
    setSelectedOrder(index);
    setLocationForm({
      latitude: order.currentLocation?.latitude || '',
      longitude: order.currentLocation?.longitude || '',
      address: order.currentLocation?.address || ''
    });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationForm({
      ...locationForm,
      [name]: value
    });
  };

  const handleUpdateLocation = () => {
    if (!locationForm.latitude || !locationForm.longitude || !locationForm.address) {
      alert('Please fill in all location details');
      return;
    }

    const updatedOrders = [...orders];
    updatedOrders[selectedOrder] = {
      ...updatedOrders[selectedOrder],
      currentLocation: {
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        address: locationForm.address
      }
    };

    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    // Dispatch custom event to notify other pages of the update
    window.dispatchEvent(new Event('ordersUpdated'));
    alert('Location updated successfully!');
    setSelectedOrder(null);
  };

  const predefinedLocations = [
    { name: 'Warehouse', lat: 6.9271, long: 79.8620, address: 'Warehouse - Processing' },
    { name: 'In Transit', lat: 6.9150, long: 79.8550, address: 'En route to delivery destination' },
    { name: 'Local Hub', lat: 6.9420, long: 79.8750, address: 'Local Distribution Hub' },
    { name: 'Delivered', lat: 6.9100, long: 79.8500, address: 'Delivered to customer' }
  ];

  const handleQuickUpdate = (location) => {
    setLocationForm({
      latitude: location.lat.toString(),
      longitude: location.long.toString(),
      address: location.address
    });
  };

  return (
    <div className="admin-order-tracking">
      <div className="tracking-header">
        <h1>Order <span>Tracking Management</span></h1>
        <p>Update order locations in real-time</p>
      </div>

      <div className="tracking-content">
        <div className="orders-list-section">
          <h2>Active Orders</h2>
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>No orders to track</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className={`order-item ${selectedOrder === index ? 'selected' : ''}`}
                  onClick={() => handleSelectOrder(order, index)}
                >
                  <div className="order-item-header">
                    <strong>{order.id}</strong>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="order-customer">
                    {order.deliveryDetails.fullName}
                  </p>
                  <p className="order-current-location">
                    <strong>Current:</strong> {order.currentLocation?.address || 'Not set'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder !== null && (
          <div className="location-update-section">
            <h2>Update Order Location</h2>

            <div className="update-form">
              <div className="form-group">
                <label>Latitude *</label>
                <input
                  type="number"
                  name="latitude"
                  value={locationForm.latitude}
                  onChange={handleLocationChange}
                  placeholder="e.g., 6.9271"
                  step="0.0001"
                />
              </div>

              <div className="form-group">
                <label>Longitude *</label>
                <input
                  type="number"
                  name="longitude"
                  value={locationForm.longitude}
                  onChange={handleLocationChange}
                  placeholder="e.g., 79.8620"
                  step="0.0001"
                />
              </div>

              <div className="form-group full-width">
                <label>Location Description *</label>
                <input
                  type="text"
                  name="address"
                  value={locationForm.address}
                  onChange={handleLocationChange}
                  placeholder="e.g., En route to delivery destination"
                />
              </div>

              <div className="quick-update-section">
                <label>Quick Update Options:</label>
                <div className="quick-buttons">
                  {predefinedLocations.map((location, idx) => (
                    <button
                      key={idx}
                      className="quick-btn"
                      onClick={() => handleQuickUpdate(location)}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="map-preview">
                <h3>Location Preview</h3>
                <iframe
                  title="Location Preview"
                  width="100%"
                  height="250"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31676.60703725659!2d${locationForm.longitude || 79.8620}!3d${locationForm.latitude || 6.9271}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(locationForm.address || 'Location')}!5e0!3m2!1sen!2slk!4v1234567890`}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <button className="update-btn" onClick={handleUpdateLocation}>
                Update Order Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderTracking;
