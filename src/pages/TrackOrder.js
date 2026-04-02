import React, { useState, useEffect } from 'react';
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

export default TrackOrder;
