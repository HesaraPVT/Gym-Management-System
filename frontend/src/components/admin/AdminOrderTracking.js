/*import React, { useState, useEffect } from 'react';
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
*/





import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./AdminOrderTracking.css";

function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const watchIdRef = useRef(null);

  const API_BASE = "http://localhost:5000";

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => stopTracking();
  }, []);

  // --- LIVE GPS TRACKING ---
  const startTracking = (orderId) => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setActiveTrackingId(orderId);
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await axios.patch(`${API_BASE}/api/orders/${orderId}`, {
            riderLocation: { lat: latitude, lng: longitude }
          });
          fetchOrders();
        } catch (err) {
          console.error("Update failed", err);
        }
      },
      (error) => {
        alert("GPS Error: " + error.message);
        stopTracking();
      },
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setActiveTrackingId(null);
  };

  // --- ANALYTICS ---
  const calculateStats = () => {
    let totalRevenue = 0;
    const productSales = {};

    orders.forEach((order) => {
      totalRevenue += Number(order.totalAmount) || 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item?.name) {
            productSales[item.name] = (productSales[item.name] || 0) + (Number(item.quantity) || 0);
          }
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { totalRevenue, topProducts };
  };

  const { totalRevenue, topProducts } = calculateStats();

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/api/orders/${id}`, { status: newStatus });
      fetchOrders();
    } catch (err) { alert("Update failed"); }
  };

  if (loading) return <div className="admin-loading">Loading Order Management...</div>;

  return (
    <div className="admin-tracking-container">
      <header className="tracking-header">
        <h1>Order <span>Tracking Management</span></h1>
        <p>Control live delivery status and monitor revenue</p>
      </header>

      {/* STATS SECTION */}
      <div className="stats-container">
        <div className="stat-card revenue">
          <h4>Total Revenue</h4>
          <p className="price">LKR {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card items">
          <h4>Top Selling Products</h4>
          <div className="top-products-list">
            {topProducts.map((p, i) => (
              <div key={i} className="product-row">
                <span>{p.name}</span>
                <span className="badge">{p.qty} Sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-card">
        <table className="order-table">
          <thead>
            <tr>
              <th>Customer / ID</th>
              <th>Status</th>
              <th>Live GPS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>
                  <div className="customer-info">
                    <strong>{order.deliveryDetails?.customerName || "Unknown"}</strong>
                    <span>ID: {order._id.substring(order._id.length - 6)}</span>
                  </div>
                </td>
                <td>
                  <select 
                    className="status-dropdown"
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out for delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  {activeTrackingId === order._id ? (
                    <button onClick={stopTracking} className="btn-stop">🛑 Stop</button>
                  ) : (
                    <button 
                      onClick={() => startTracking(order._id)} 
                      className="btn-gps" 
                      disabled={activeTrackingId !== null}
                    >
                      📡 Start GPS
                    </button>
                  )}
                  <div className="coord-text">
                    {order.riderLocation?.lat?.toFixed(4) || "0.000"}, {order.riderLocation?.lng?.toFixed(4) || "0.000"}
                  </div>
                </td>
                <td>
                  <button onClick={() => setSelectedOrder(order)} className="btn-details">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Detail Overview</h3>
              <button className="close-x" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <section className="info-section">
                <p><strong>Customer:</strong> {selectedOrder.deliveryDetails?.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrder.deliveryDetails?.phone}</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryDetails?.address}</p>
              </section>

              <h4>Ordered Items</h4>
              <div className="items-box">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="item-line">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="total-line">
                  Total: LKR {Number(selectedOrder.totalAmount).toLocaleString()}
                </div>
              </div>

              <h4>Payment Status</h4>
              <div className={`payment-method-box ${selectedOrder.paymentMethod?.toLowerCase()}`}>
                <p>Method: <strong>{selectedOrder.paymentMethod}</strong></p>
                {selectedOrder.paymentMethod === "BANK" && selectedOrder.paymentSlip && (
                   <img 
                     src={`${API_BASE}/images/${selectedOrder.paymentSlip.split(/[\\/]/).pop()}`} 
                     alt="Bank Slip" 
                     className="slip-preview" 
                   />
                )}
              </div>
            </div>
            <button className="btn-close-panel" onClick={() => setSelectedOrder(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderTracking;