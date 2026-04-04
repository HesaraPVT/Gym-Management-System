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





/*import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./AdminOrderTracking.css";

function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const watchIdRef = useRef(null);

  const API_BASE = "http://localhost:5001";

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

      {/* STATS SECTION *//*}
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

      {/* TABLE SECTION *//*}
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

      {/* MODAL *//*}
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

export default AdminOrderTracking;*/






/*import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./AdminOrderTracking.css";

function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const watchIdRef = useRef(null);

  const API_BASE = "http://localhost:5001";

  const fetchOrders = async () => {
    try {
      // Get orders from the backend admin route
      const res = await axios.get(`${API_BASE}/api/shop/admin/orders`);
      
      // FIX: Access the 'orders' array from the { success: true, orders: [] } object
      const data = res.data.orders ? res.data.orders : res.data;
      setOrders(data || []);
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
          await axios.patch(`${API_BASE}/api/shop/order/${orderId}`, {
            riderLocation: { lat: latitude, lng: longitude }
          });
          // Update local state instantly so the UI coordinates change
          setOrders(prev => prev.map(o => 
            o._id === orderId ? { ...o, riderLocation: { lat: latitude, lng: longitude } } : o
          ));
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/api/shop/order/${id}`, { status: newStatus });
      fetchOrders();
    } catch (err) { alert("Status Update failed"); }
  };

  // --- ANALYTICS ---
  const calculateStats = () => {
    let totalRevenue = 0;
    const productSales = {};
    orders.forEach((order) => {
      totalRevenue += Number(order.totalAmount) || 0;
      order.items?.forEach((item) => {
        if (item?.name) {
          productSales[item.name] = (productSales[item.name] || 0) + (Number(item.quantity) || 0);
        }
      });
    });
    const topProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty).slice(0, 5);
    return { totalRevenue, topProducts };
  };

  const { totalRevenue, topProducts } = calculateStats();

  if (loading) return <div className="admin-loading">Loading Order Management...</div>;

  return (
    <div className="admin-tracking-container">
      <header className="tracking-header">
        <h1>Order <span>Tracking Management</span></h1>
      </header>

      <div className="stats-container">
        <div className="stat-card revenue">
          <h4>Total Revenue</h4>
          <p className="price">LKR {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card items">
          <h4>Top Products</h4>
          {topProducts.map((p, i) => (
            <div key={i} className="product-row">
              <span>{p.name}</span> <span className="badge">{p.qty} Sold</span>
            </div>
          ))}
        </div>
      </div>

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
                  <strong>{order.shippingAddress?.fullName || "Guest Customer"}</strong>
                  <br />ID: {order._id.substring(order._id.length - 6)}
                </td>
                <td>
                  <select 
                    value={order.status || "pending"} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td>
                  {activeTrackingId === order._id ? (
                    <button onClick={stopTracking} className="btn-stop">Stop</button>
                  ) : (
                    <button onClick={() => startTracking(order._id)} className="btn-gps" disabled={activeTrackingId !== null}>
                      Start GPS
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
    </div>
  );
}

export default AdminOrderTracking;*/








/*import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ShopHeader from '../common/ShopHeader';

function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const watchIdRef = useRef(null);

  // FIXED: Your backend prefix is /api/shop
  const API_BASE = "http://localhost:5001/api/shop";
  const IMAGE_BASE = "http://localhost:5001";

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/orders`);
      // Since your backend returns { success: true, orders: [...] }
      setOrders(res.data.orders || []);
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

  // --- AUTOMATED GPS TRACKING ---
  const startTracking = (orderId) => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    setActiveTrackingId(orderId);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Updates the riderLocation in your Order.js model
          await axios.patch(`${API_BASE}/order/${orderId}`, {
            riderLocation: { lat: latitude, lng: longitude }
          });
          // Refresh list to show updated coordinates in the table
          fetchOrders(); 
        } catch (err) {
          console.error("GPS Update failed", err);
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

  // --- ANALYTICS LOGIC ---
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
      await axios.patch(`${API_BASE}/order/${id}`, { status: newStatus });
      fetchOrders();
    } catch (err) { alert("Status Update failed"); }
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: "30px 5%", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ShopHeader />
      <h2 style={{ marginBottom: "25px", marginTop: "20px" }}>Admin <span style={{ color: "#ff4500" }}>Command Center</span></h2>

      {/* STATS SECTION *//*}
      <div style={statsGrid}>
        <div style={statCard}>
          <h4 style={statLabel}>Total Revenue</h4>
          <p style={statValue}>LKR {totalRevenue.toLocaleString()}</p>
        </div>
        <div style={statCard}>
          <h4 style={statLabel}>Top Selling Supplements</h4>
          <div style={{ marginTop: "10px" }}>
            {topProducts.map((p, i) => (
              <div key={i} style={topItemRow}>
                <span>{p.name}</span>
                <span style={qtyBadge}>{p.qty} Sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE *//*}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>
              <th style={thStyle}>Customer / ID</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Live GPS Control</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>
                  {/* Matches shippingAddress.fullName from your model *//*}
                  <strong>{order.shippingAddress?.fullName || "Guest"}</strong><br/>
                  <small style={{color: '#888'}}>ID: {order._id.substring(order._id.length - 8)}</small>
                </td>
                <td style={tdStyle}>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  {activeTrackingId === order._id ? (
                    <button onClick={stopTracking} style={btnStop}>🛑 Stop GPS</button>
                  ) : (
                    <button 
                      onClick={() => startTracking(order._id)} 
                      style={btnStart} 
                      disabled={activeTrackingId !== null}
                    >
                      📡 Start GPS
                    </button>
                  )}
                  <div style={{fontSize: '10px', marginTop: '5px', color: '#666'}}>
                    {order.riderLocation?.lat.toFixed(4)}, {order.riderLocation?.lng.toFixed(4)}
                  </div>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => setSelectedOrder(order)} style={btnDetails}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL *//*}
      {selectedOrder && (
        <div style={modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} style={{border:'none', background:'none', fontSize:'24px', cursor:'pointer'}}>×</button>
            </div>
            <hr />
            <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address}</p>
            <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
            
            <h4>Items:</h4>
            <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px'}}>
                {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                        <span><strong>{item.name}</strong> x {item.quantity}</span>
                        <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
                <div style={{borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', textAlign: 'right', fontWeight: 'bold'}}>
                    Total: LKR {Number(selectedOrder.totalAmount).toLocaleString()}
                </div>
            </div>

            {/* PAYMENT VERIFICATION *//*}
            <div style={{ marginTop: '20px' }}>
              <h4>Payment Verification:</h4>
              {selectedOrder.paymentMethod === "BANK" ? (
                <div style={bankBox}>
                  <p style={{ color: '#004085', fontWeight: 'bold' }}>Bank Transfer Slip:</p>
                  {selectedOrder.paymentSlip ? (
                    // Corrects path for Windows vs Linux server storage
                    <img 
                      src={`${IMAGE_BASE}/${selectedOrder.paymentSlip.replace(/\\/g, '/')}`} 
                      alt="Bank Slip" 
                      style={slipImg} 
                    />
                  ) : <p style={{color: 'red'}}>Slip not uploaded.</p>}
                </div>
              ) : (
                <div style={cardBox}>
                  <p style={{ color: '#234e52', fontWeight: 'bold' }}>Method: {selectedOrder.paymentMethod}</p>
                  <p style={{ fontSize: '14px' }}>Automatic verification completed.</p>
                </div>
              )}
            </div>

            <button onClick={() => setSelectedOrder(null)} style={btnClose}>Close Panel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS-in-JS remains the same as your reference
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: "6px solid #ff4500" };
const statLabel = { margin: 0, color: "#777", fontSize: "12px", textTransform: "uppercase" };
const statValue = { margin: "10px 0 0", fontSize: "28px", fontWeight: "bold" };
const topItemRow = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f9f9f9", fontSize: "14px" };
const qtyBadge = { backgroundColor: "#fff0e6", color: "#ff4500", padding: "2px 10px", borderRadius: "20px", fontWeight: "bold" };
const tableWrapper = { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { padding: "15px", textAlign: "left" };
const tdStyle = { padding: "15px" };
const selectStyle = { padding: "6px", borderRadius: "4px", border: "1px solid #ddd" };
const btnStart = { backgroundColor: "#ff4500", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const btnStop = { backgroundColor: "#333", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const btnDetails = { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '500px', maxHeight: '85vh', overflowY: 'auto' };
const btnClose = { marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#ff4500', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const bankBox = { padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce5ff' };
const cardBox = { padding: '15px', backgroundColor: '#e6fffa', borderRadius: '8px', border: '1px solid #b2f5ea' };
const slipImg = { width: "100%", borderRadius: "8px", marginTop: '10px' };

export default AdminOrderTracking;*/









/*import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ShopHeader from '../common/ShopHeader';

function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const watchIdRef = useRef(null);

  const API_BASE = "http://localhost:5001/api/shop";
  const IMAGE_BASE = "http://localhost:5001";

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/orders`);
      setOrders(res.data.orders || []);
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

  // --- AUTOMATED GPS TRACKING ---
  const startTracking = (orderId) => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setActiveTrackingId(orderId);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await axios.patch(`${API_BASE}/order/${orderId}`, {
            riderLocation: { lat: latitude, lng: longitude }
          });
          fetchOrders(); 
        } catch (err) {
          console.error("GPS Update failed", err);
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

  // --- COMBINED STATUS & PAYMENT LOGIC ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      let updateData = {};
      
      if (newStatus === "payment_rejected") {
        updateData = { paymentStatus: "Rejected" };
      } else {
        // If moving to a normal status, we update the status field
        updateData = { status: newStatus };
        // Logic: If order is processing, we assume payment is okay
        if (newStatus === "processing") updateData.paymentStatus = "Completed";
      }

      await axios.patch(`${API_BASE}/order/${id}`, updateData);
      fetchOrders();
      
      if (selectedOrder && selectedOrder._id === id) {
         setSelectedOrder(prev => ({ ...prev, ...updateData }));
      }
    } catch (err) { 
      alert("Update failed"); 
    }
  };

  const handlePaymentStatusChange = async (id, newPaymentStatus) => {
    try {
      await axios.patch(`${API_BASE}/order/${id}`, { paymentStatus: newPaymentStatus });
      fetchOrders();
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
    } catch (err) { alert("Payment Update failed"); }
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

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: "30px 5%", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ShopHeader />
      <h2 style={{ marginBottom: "25px", marginTop: "20px" }}>Admin <span style={{ color: "#ff4500" }}>Command Center</span></h2>

      {/* STATS SECTION *//*}
      <div style={statsGrid}>
        <div style={statCard}>
          <h4 style={statLabel}>Total Revenue</h4>
          <p style={statValue}>LKR {totalRevenue.toLocaleString()}</p>
        </div>
        <div style={statCard}>
          <h4 style={statLabel}>Top Selling Supplements</h4>
          <div style={{ marginTop: "10px" }}>
            {topProducts.map((p, i) => (
              <div key={i} style={topItemRow}>
                <span>{p.name}</span>
                <span style={qtyBadge}>{p.qty} Sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE *//*}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>
              <th style={thStyle}>Customer / ID</th>
              <th style={thStyle}>Status Control</th>
              <th style={thStyle}>Live GPS Control</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>
                  <strong>{order.shippingAddress?.fullName || "Guest"}</strong><br/>
                  <small style={{color: '#888'}}>ID: {order._id.substring(order._id.length - 8)}</small>
                </td>
                <td style={tdStyle}>
                  <select 
                    value={order.paymentStatus === "Rejected" ? "payment_rejected" : order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{
                        ...selectStyle,
                        border: order.paymentStatus === "Rejected" ? "2px solid #ff4d4f" : "1px solid #ddd",
                        color: order.paymentStatus === "Rejected" ? "#ff4d4f" : "#333",
                        fontWeight: order.paymentStatus === "Rejected" ? "bold" : "normal"
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing (Approve)</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="payment_rejected" style={{color: 'red'}}>❌ Reject Payment Slip</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  {activeTrackingId === order._id ? (
                    <button onClick={stopTracking} style={btnStop}>🛑 Stop GPS</button>
                  ) : (
                    <button onClick={() => startTracking(order._id)} style={btnStart} disabled={activeTrackingId !== null}>📡 Start GPS</button>
                  )}
                </td>
                <td style={tdStyle}>
                  <button onClick={() => setSelectedOrder(order)} style={btnDetails}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL *//*}
      {selectedOrder && (
        <div style={modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} style={{border:'none', background:'none', fontSize:'24px', cursor:'pointer'}}>×</button>
            </div>
            <hr />
            <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address}</p>
            <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
            
            <h4>Items:</h4>
            <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
                {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                        <span><strong>{item.name}</strong> x {item.quantity}</span>
                        <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
                <div style={{borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', textAlign: 'right', fontWeight: 'bold'}}>
                    Total: LKR {Number(selectedOrder.totalAmount).toLocaleString()}
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>Payment Verification:</h4>
              <div style={{ marginBottom: '15px' }}>
                <select 
                  value={selectedOrder.paymentStatus || "Pending"} 
                  onChange={(e) => handlePaymentStatusChange(selectedOrder._id, e.target.value)}
                  style={{ ...selectStyle, width: '100%', fontWeight: 'bold' }}
                >
                  <option value="Pending">🕒 Pending</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>

              {selectedOrder.paymentMethod === "BANK" ? (
                <div style={bankBox}>
                  <p style={{ color: '#004085', fontWeight: 'bold' }}>Bank Transfer Slip:</p>
                  {selectedOrder.paymentSlip ? (
                    <img 
                      src={`${IMAGE_BASE}/${selectedOrder.paymentSlip.replace(/\\/g, '/')}`} 
                      alt="Bank Slip" 
                      style={slipImg} 
                    />
                  ) : (
                    <p style={{ color: 'red' }}>
                      {selectedOrder.paymentStatus === 'Rejected' 
                        ? "Waiting for user re-upload..." 
                        : "No slip found."}
                    </p>
                  )}
                </div>
              ) : (
                <div style={cardBox}><p>Method: Card/Other</p></div>
              )}
            </div>

            <button onClick={() => setSelectedOrder(null)} style={btnClose}>Close Panel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: "6px solid #ff4500" };
const statLabel = { margin: 0, color: "#777", fontSize: "12px", textTransform: "uppercase" };
const statValue = { margin: "10px 0 0", fontSize: "28px", fontWeight: "bold" };
const topItemRow = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f9f9f9", fontSize: "14px" };
const qtyBadge = { backgroundColor: "#fff0e6", color: "#ff4500", padding: "2px 10px", borderRadius: "20px", fontWeight: "bold" };
const tableWrapper = { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { padding: "15px", textAlign: "left" };
const tdStyle = { padding: "15px" };
const selectStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", cursor: "pointer" };
const btnStart = { backgroundColor: "#ff4500", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const btnStop = { backgroundColor: "#333", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const btnDetails = { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '500px', maxHeight: '85vh', overflowY: 'auto' };
const btnClose = { marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#ff4500', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const bankBox = { padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce5ff' };
const cardBox = { padding: '15px', backgroundColor: '#e6fffa', borderRadius: '8px', border: '1px solid #b2f5ea' };
const slipImg = { width: "100%", borderRadius: "8px", marginTop: '10px' };

export default AdminOrderTracking;*/




import React, { useEffect, useState, useRef } from "react";
import ShopHeader from '../common/ShopHeader';

function AdminOrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const watchIdRef = useRef(null);

  const API_BASE = "http://localhost:5001/api/shop";
  const IMAGE_BASE = "http://localhost:5001";

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
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

  // --- GPS TRACKING LOGIC ---
  const startTracking = (orderId) => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setActiveTrackingId(orderId);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await fetch(`${API_BASE}/order/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              riderLocation: { lat: latitude, lng: longitude }
            })
          });
          fetchOrders(); 
        } catch (err) {
          console.error("GPS Update failed", err);
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

  // --- ANALYTICS CALCULATIONS ---
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

  // --- STATUS CHANGE LOGIC ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      let updateData = {};
      if (newStatus === "payment_rejected") {
        updateData = { paymentStatus: "Rejected" };
      } else {
        updateData = { status: newStatus };
        if (newStatus === "processing" || newStatus === "shipped") {
          updateData.paymentStatus = "Completed";
        }
      }
      await fetch(`${API_BASE}/order/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      fetchOrders();
    } catch (err) { alert("Update failed"); }
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: "30px 5%", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <ShopHeader />
      <h2 style={{ marginBottom: "25px", marginTop: "20px" }}>Admin <span style={{ color: "#ff4500" }}>Command Center</span></h2>

      {/* STATS SECTION */}
      <div style={statsGrid}>
        <div style={statCard}>
          <h4 style={statLabel}>Total Revenue</h4>
          <p style={statValue}>LKR {totalRevenue.toLocaleString()}</p>
        </div>
        <div style={statCard}>
          <h4 style={statLabel}>Top Selling Supplements</h4>
          <div style={{ marginTop: "10px" }}>
            {topProducts.map((p, i) => (
              <div key={i} style={topItemRow}>
                <span>{p.name}</span>
                <span style={qtyBadge}>{p.qty} Sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>
              <th style={thStyle}>Customer / ID</th>
              <th style={thStyle}>Status Control</th>
              <th style={thStyle}>Live GPS Control</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>
                  <strong>{order.shippingAddress?.fullName || "Guest"}</strong><br/>
                  <small style={{color: '#888'}}>ID: {order._id.substring(order._id.length - 8)}</small>
                </td>
                <td style={tdStyle}>
                  <select 
                    value={order.paymentStatus === "Rejected" ? "payment_rejected" : order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{
                      ...selectStyle,
                      border: order.paymentStatus === "Rejected" ? "2px solid #ff4d4f" : "1px solid #ddd",
                      color: order.paymentStatus === "Rejected" ? "#ff4d4f" : "#333"
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing (Approve)</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="payment_rejected" style={{color: 'red'}}>❌ Reject Payment Slip</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  {activeTrackingId === order._id ? (
                    <button onClick={stopTracking} style={btnStop}>🛑 Stop GPS</button>
                  ) : (
                    <button onClick={() => startTracking(order._id)} style={btnStart} disabled={activeTrackingId !== null}>📡 Start GPS</button>
                  )}
                </td>
                <td style={tdStyle}>
                  <button onClick={() => setSelectedOrder(order)} style={btnDetails}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {selectedOrder && (
        <div style={modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h3>Order Details</h3>
            <hr />
            <p><strong>Address:</strong> {selectedOrder.shippingAddress?.address}</p>
            <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
            
            <h4>Items:</h4>
            <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
                {selectedOrder.items.map((item, i) => (
                    <div key={i} style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between'}}>
                        <span><strong>{item.name}</strong> x {item.quantity}</span>
                        <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
                <div style={{borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', textAlign: 'right', fontWeight: 'bold'}}>
                    Total: LKR {Number(selectedOrder.totalAmount).toLocaleString()}
                </div>
            </div>

            {/* PAYMENT LOGIC INTEGRATION */}
            <div>
              <h4>Payment Verification:</h4>
              {selectedOrder.paymentMethod === "BANK" ? (
                <div style={bankBox}>
                  <p style={{ color: '#004085', fontWeight: 'bold' }}>Method: Bank Transfer</p>
                  {selectedOrder.paymentSlip ? (
                    <img 
                      src={`${IMAGE_BASE}/${selectedOrder.paymentSlip.replace(/\\/g, '/')}`} 
                      alt="Slip" 
                      style={slipImg} 
                    />
                  ) : <p style={{color: 'red'}}>Slip missing!</p>}
                </div>
              ) : selectedOrder.paymentMethod === "CARD" ? (
                <div style={cardBox}>
                  <p style={{ color: '#234e52', fontWeight: 'bold' }}>Method: Paid via Card 💳</p>
                  <p style={{ fontSize: '14px' }}>Status: Payment Confirmed (LKR {selectedOrder.totalAmount.toLocaleString()})</p>
                </div>
              ) : (
                <div style={codBox}>
                  <p style={{ color: '#d9480f', fontWeight: 'bold' }}>Method: Cash on Delivery</p>
                  <p style={{ fontSize: '14px' }}>Collect cash upon arrival.</p>
                </div>
              )}
            </div>

            <button onClick={() => setSelectedOrder(null)} style={btnClose}>Close Panel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: "6px solid #ff4500" };
const statLabel = { margin: 0, color: "#777", fontSize: "12px", textTransform: "uppercase" };
const statValue = { margin: "10px 0 0", fontSize: "28px", fontWeight: "bold" };
const topItemRow = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f9f9f9", fontSize: "14px" };
const qtyBadge = { backgroundColor: "#fff0e6", color: "#ff4500", padding: "2px 10px", borderRadius: "20px", fontWeight: "bold" };
const tableWrapper = { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { padding: "15px", textAlign: "left" };
const tdStyle = { padding: "15px" };
const selectStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", cursor: "pointer" };
const btnStart = { backgroundColor: "#ff4500", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const btnStop = { backgroundColor: "#333", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const btnDetails = { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '500px', maxHeight: '85vh', overflowY: 'auto' };
const btnClose = { marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#ff4500', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const bankBox = { padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce5ff' };
const cardBox = { padding: '15px', backgroundColor: '#e6fffa', borderRadius: '8px', border: '1px solid #b2f5ea' };
const codBox = { padding: '15px', backgroundColor: '#fff4e6', borderRadius: '8px', border: '1px solid #ffe8cc' };
const slipImg = { width: "100%", borderRadius: "8px", marginTop: '10px' };

export default AdminOrderTracking;