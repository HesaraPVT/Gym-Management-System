import React, { useState, useEffect } from 'react';
import './AdminShopPage.css';

function AdminShopPage() {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({});

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(savedOrders);
    
    const statuses = {};
    savedOrders.forEach(order => {
      statuses[order.id] = order.status;
    });
    setOrderStatuses(statuses);
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatuses({
      ...orderStatuses,
      [orderId]: newStatus
    });

    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const calculateTotalRevenue = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getTopSellingItems = () => {
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (itemCounts[item.name]) {
          itemCounts[item.name] += item.quantity;
        } else {
          itemCounts[item.name] = item.quantity;
        }
      });
    });

    return Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topItems = getTopSellingItems();
  const totalRevenue = calculateTotalRevenue();

  return (
    <div className="admin-shop-page">
      {/* Header */}
      <div className="admin-header">
        <h1>Admin <span>Command Center</span></h1>
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">TOTAL REVENUE</div>
          <div className="stat-value">LKR {totalRevenue.toLocaleString()}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">TOP SELLING ITEMS</div>
          <div className="top-items-list">
            {topItems.length > 0 ? (
              topItems.map((item, index) => (
                <div key={index} className="top-item">
                  <span>{item.name}</span>
                  <span className="sold-count">{item.count} Sold</span>
                </div>
              ))
            ) : (
              <p>No sales yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-section">
        <h2>Order Management</h2>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Customer / ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="customer-cell">
                      <div className="customer-info">
                        <div className="customer-name">{order.deliveryDetails.fullName}</div>
                        <div className="customer-id">ID: {order.id}</div>
                      </div>
                    </td>
                    <td className="items-cell">
                      {order.items.map(item => (
                        <div key={item.id} className="item-info">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="total-cell">LKR {order.total.toLocaleString()}</td>
                    <td className="status-cell">
                      <select
                        value={orderStatuses[order.id] || order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="details-cell">
                      <button className="view-details-btn">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminShopPage;
