/*import React, { useState, useEffect } from 'react';
import './TrackOrder.css';
import ShopHeader from '../components/common/ShopHeader';

function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(savedOrders);
  }, []);

  // Listen for storage changes from admin updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedOrders = JSON.parse(localStorage.getItem('orders')) || [];
      setOrders(updatedOrders);
    };

    const handleOrdersUpdated = () => {
      const updatedOrders = JSON.parse(localStorage.getItem('orders')) || [];
      setOrders(updatedOrders);
    };

    // Listen for storage changes (different tabs)
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom event (same tab updates)
    window.addEventListener('ordersUpdated', handleOrdersUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };
  }, []);

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status.toLowerCase()}`;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="track-order-page">
      <ShopHeader />
      <div className="track-order-container">
      <div className="track-header">
        <h1>TRACK YOUR <span>ORDERS</span></h1>
        <p>Monitor your delivery status in real-time</p>
      </div>

      <div className="track-content">
        {orders.length === 0 ? (
          <div className="no-orders-message">
            <p>No orders yet. Start shopping to track your orders!</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => (
              <div 
                key={index} 
                className="order-card"
                onClick={() => setSelectedOrder(selectedOrder === index ? null : index)}
              >
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-id">
                      <strong>Order {order.id}</strong>
                    </div>
                    <div className="order-date">{order.date}</div>
                  </div>
                  <div className="order-status">
                    <span className={getStatusBadgeClass(order.status)}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {selectedOrder === index && (
                  <div className="order-details">
                    <div className="details-section">
                      <h3>Order Details</h3>
                      <div className="items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="item-row">
                            <span>{item.name} x{item.quantity}</span>
                            <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="total-row">
                        <strong>Total:</strong>
                        <strong>LKR {order.total.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="details-section">
                      <h3>Delivery Address</h3>
                      <p className="address-text">
                        <strong>{order.deliveryDetails.fullName}</strong><br />
                        {order.deliveryDetails.address}<br />
                        {order.deliveryDetails.phone}
                      </p>
                    </div>

                    <div className="details-section">
                      <h3>Order Timeline</h3>
                      <div className="timeline">
                        <div className={`timeline-step ${order.status !== 'PENDING' ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">
                            <strong>Order Placed</strong>
                            <p>Confirmed</p>
                          </div>
                        </div>
                        <div className={`timeline-step ${['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">
                            <strong>Confirmed</strong>
                            <p>Processing your order</p>
                          </div>
                        </div>
                        <div className={`timeline-step ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">
                            <strong>Shipped</strong>
                            <p>On the way</p>
                          </div>
                        </div>
                        <div className={`timeline-step ${order.status === 'DELIVERED' ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-label">
                            <strong>Delivered</strong>
                            <p>Order received</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h3>Current Location</h3>
                      <div className="tracking-map">
                        <iframe
                          title={`Order ${order.id} Location`}
                          width="100%"
                          height="300"
                          frameBorder="0"
                          src={`https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31676.60703725659!2d${order.currentLocation?.longitude || 79.8620}!3d${order.currentLocation?.latitude || 6.9271}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zCurrent%20Order%20Location!5e0!3m2!1sen!2slk!4v1234567890`}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                        <p className="location-info">
                          <strong>Current Location:</strong><br />
                          {order.currentLocation?.address || 'Warehouse - Processing'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default TrackOrder;*/






/*import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ShopHeader from '../components/common/ShopHeader';
import './TrackOrder.css';

const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function TrackOrder({ orderId }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newSlip, setNewSlip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const fetchOrder = useCallback(async () => {
    const id = orderId || localStorage.getItem("lastOrderId");
    if (!id) {
      setError("No active order found.");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5001/api/orders/${id}`);
      setOrder(res.data);
      setError("");
    } catch (err) {
      setError("Order not found or has been removed.");
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/orders/${order?._id}`);
      localStorage.removeItem("lastOrderId");
      alert("Order Cancelled.");
      navigate("/");
    } catch (err) {
      alert("Cannot cancel: Order is already being processed.");
      setShowCancelModal(false);
    }
  };

  const handleReupload = async () => {
    if (!newSlip) return alert("Please select a new payment slip.");
    setUploading(true);
    const formData = new FormData();
    formData.append("paymentSlip", newSlip);
    formData.append("status", "pending"); 

    try {
      await axios.patch(`http://localhost:5001/api/orders/${order?._id}`, formData);
      alert("Slip updated!");
      setNewSlip(null);
      fetchOrder();
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (error) return (
    <div className="track-order-page">
      <ShopHeader />
      <div className="error-display" style={{padding: '100px', textAlign: 'center', color: 'red'}}>{error}</div>
    </div>
  );

  // Safety check for location data
  if (!order || !order.riderLocation) return (
    <div className="track-order-page">
      <ShopHeader />
      <div className="loading-state" style={{padding: '100px', textAlign: 'center'}}>Loading Power Tracker...</div>
    </div>
  );

  const position = [order.riderLocation.lat, order.riderLocation.lng];

  return (
    <div className="track-order-page">
      <ShopHeader />
      
      <div className="track-order-content">
        <div className="track-sidebar">
          <div className={`status-banner ${order.status === 'rejected' ? 'rejected' : 'default'}`}>
            {order.status === "rejected" ? "⚠️ PAYMENT REJECTED" : `STATUS: ${order.status.toUpperCase()}`}
          </div>

          {order.status === "rejected" && (
            <div className="reupload-card">
              <p>Issue with your slip. Please re-upload.</p>
              <input type="file" accept="image/*" onChange={(e) => setNewSlip(e.target.files[0])} />
              <button onClick={handleReupload} disabled={uploading} className="reupload-btn">
                {uploading ? "UPLOADING..." : "SUBMIT NEW SLIP"}
          
              </button>
            </div>
          )}

          {order.status === "pending" && (
            <button onClick={() => setShowCancelModal(true)} className="cancel-trigger-btn">
              CANCEL ORDER
            </button>
          )}

          <div className="order-details-text">
            <h4 className="label-text">Order ID</h4>
            <p style={{ fontWeight: "bold", color: "#e60000" }}>#{order._id.substring(order._id.length - 8)}</p>
            
            <h4 className="label-text">Total</h4>
            <p style={{ fontWeight: "bold", fontSize: "20px" }}>LKR {order.totalAmount?.toLocaleString()}</p>
            
            <hr />
            
            <p><strong>Customer:</strong> {order.deliveryDetails?.customerName}</p>
            <p className="address-text">{order.deliveryDetails?.address}</p>
          </div>
        </div>

        <div className="map-box">
          {/* Use order ID as key to prevent 'render is not a function' errors on update *//*}
          <MapContainer key={order._id} center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position} icon={redIcon}>
              <Popup>Power Rider Location</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: "#e60000" }}>Cancel Order?</h2>
            <p>This cannot be undone.</p>
            <div className="modal-btn-group">
              <button onClick={handleCancelOrder} className="modal-btn" style={{backgroundColor: '#e60000'}}>YES</button>
              <button onClick={() => setShowCancelModal(false)} className="modal-btn" style={{backgroundColor: '#333'}}>NO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackOrder;*/






/*import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ShopHeader from '../components/common/ShopHeader'; 
import './TrackOrder.css';

const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function TrackOrder() {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchOrder = useCallback(async () => {
    const orderId = id || localStorage.getItem("lastOrderId");
    if (!orderId) {
      setError("No active order found.");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5001/api/shop/order/${orderId}?t=${Date.now()}`);
      setOrder(res.data);
      setError("");
    } catch (err) {
      setError("Order not found.");
    }
  }, [id]);

  const handleDeleteOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await axios.delete(`http://localhost:5001/api/shop/order/${order._id}`);
        alert("Order cancelled.");
        localStorage.removeItem("lastOrderId");
        navigate("/products");
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting order.");
      }
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (error) return <div className="loading-container"><ShopHeader /><p>{error}</p></div>;
  if (!order) return <div className="loading-container"><ShopHeader /><p>Loading...</p></div>;

  return (
    <div className="track-order-container">
      <ShopHeader />
      <div className="track-order-content">
        <div className="info-panel">
          <div className="status-badge-top">
            STATUS: {(order.status || "Pending").toUpperCase()}
          </div>

          <div className="details-card">
            <div className="detail-group">
              <label>Order ID</label>
              <span className="order-id-red">#{order._id?.substring(order._id.length - 6)}</span>
            </div>

            <div className="detail-group total-box">
              <label>Total</label>
              <span className="amount-text">LKR {order.totalAmount?.toLocaleString()}</span>
            </div>

            
            {order.status === 'pending' && (
              <button onClick={handleDeleteOrder} className="cancel-btn-modern">
                ✕ Cancel Order
              </button>
            )}

            <hr className="sep-line" />

            <div className="delivery-info-section">
              <label>DELIVERY TO:</label>
              <h4>{order.shippingAddress?.fullName}</h4>
              <p>{order.shippingAddress?.phone}</p>
              <p className="addr-small">{order.shippingAddress?.address}</p>
            </div>
          </div>
        </div>

        <div className="map-panel">
          <MapContainer 
            key={order.riderLocation?.lat}
            center={order.riderLocation?.lat ? [order.riderLocation.lat, order.riderLocation.lng] : [6.9271, 79.8612]} 
            zoom={15} 
            className="main-map"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[order.riderLocation.lat, order.riderLocation.lng]} icon={redIcon}>
              <Popup>Power Rider is here!</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;*/




import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ShopHeader from '../components/common/ShopHeader'; 
import './TrackOrder.css';

const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function TrackOrder() {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [newSlip, setNewSlip] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5001/api/shop";

  const fetchOrder = useCallback(async () => {
    const orderId = id || localStorage.getItem("lastOrderId");
    if (!orderId) {
      setError("No active order found.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/order/${orderId}?t=${Date.now()}`);
      const data = await res.json();
      setOrder(data);
      setError("");
    } catch (err) {
      setError("Order not found.");
    }
  }, [id]);

  const handleReupload = async () => {
    if (!newSlip) return alert("Please select a file first.");
    
    const formData = new FormData();
    formData.append("paymentSlip", newSlip);

    try {
      setIsUploading(true);
      const res = await fetch(`${API_BASE}/order/${order._id}`, {
        method: 'PATCH',
        body: formData
      });
      if (res.ok) {
        alert("Slip re-uploaded! Admin will verify it shortly.");
        setNewSlip(null);
        fetchOrder();
      }
    } catch (err) {
      alert("Failed to upload slip.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const res = await fetch(`${API_BASE}/order/${order._id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          alert("Order cancelled.");
          localStorage.removeItem("lastOrderId");
          navigate("/products");
        } else {
          const data = await res.json();
          alert(data?.message || "Error deleting order.");
        }
      } catch (err) {
        alert("Error deleting order.");
      }
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (error) return <div className="loading-container"><ShopHeader /><p>{error}</p></div>;
  if (!order) return <div className="loading-container"><ShopHeader /><p>Loading...</p></div>;

  return (
    <div className="track-order-container">
      <ShopHeader />
      <div className="track-order-content">
        <div className="info-panel">
          {/* Main Status Badge - Kept as requested */}
          <div className="status-badge-top">
            STATUS: {(order.status || "Pending").toUpperCase()}
          </div>

          <div className="details-card">
            {/* Rejection alert remains for functionality, but text is cleaner */}
            {order.paymentStatus === "Rejected" && (
              <div className="rejection-alert">
                <p>⚠️ <strong>Action Required</strong></p>
                <small>Issue found with your bank slip. Please re-upload below.</small>
                <input 
                  type="file" 
                  onChange={(e) => setNewSlip(e.target.files[0])} 
                  className="reupload-input"
                />
                <button 
                  onClick={handleReupload} 
                  disabled={isUploading}
                  className="reupload-btn"
                >
                  {isUploading ? "Uploading..." : "Submit New Slip"}
                </button>
              </div>
            )}

            <div className="detail-group">
              <label>Order ID</label>
              <span className="order-id-red">#{order._id?.substring(order._id.length - 6)}</span>
            </div>

            <div className="detail-group total-box">
              <label>Total</label>
              <span className="amount-text">LKR {order.totalAmount?.toLocaleString()}</span>
            </div>

            {/* PAYMENT STATUS BLOCK REMOVED FROM HERE */}

            {order.status === 'pending' && (
              <button onClick={handleDeleteOrder} className="cancel-btn-modern">
                ✕ Cancel Order
              </button>
            )}

            <hr className="sep-line" />

            <div className="delivery-info-section">
              <label>DELIVERY TO:</label>
              <h4>{order.shippingAddress?.fullName}</h4>
              <p>{order.shippingAddress?.phone}</p>
              <p className="addr-small">{order.shippingAddress?.address}</p>
            </div>
          </div>
        </div>

        <div className="map-panel">
          <MapContainer 
            key={order.riderLocation?.lat}
            center={order.riderLocation?.lat ? [order.riderLocation.lat, order.riderLocation.lng] : [6.9271, 79.8612]} 
            zoom={15} 
            className="main-map"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {order.riderLocation?.lat && (
              <Marker position={[order.riderLocation.lat, order.riderLocation.lng]} icon={redIcon}>
                <Popup>Your Supplement Rider is here!</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;