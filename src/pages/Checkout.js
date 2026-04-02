import React, { useState, useEffect } from 'react';
import './Checkout.css';
import ShopHeader from '../components/common/ShopHeader';

function Checkout() {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const order = JSON.parse(localStorage.getItem('currentOrder'));
    if (order) {
      setCurrentOrder(order);
    }
  }, []);

  const handlePlaceOrder = () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    const finalOrder = {
      ...currentOrder,
      paymentMethod: selectedPayment,
      timestamp: new Date().toLocaleString(),
      currentLocation: {
        latitude: 6.9271,
        longitude: 79.8620,
        address: 'Power World Warehouse - Processing'
      }
    };

    // Save the final order
    localStorage.setItem('currentOrder', JSON.stringify(finalOrder));
    
    // Show confirmation
    setOrderId(finalOrder.id);
    setShowOrderConfirmation(true);

    // Clear cart after successful order
    setTimeout(() => {
      localStorage.removeItem('cart');
      localStorage.removeItem('currentOrder');
    }, 2000);
  };

  if (!currentOrder) {
    return (
      <div>
        <ShopHeader />
        <div className="checkout-container">
          <div className="loading">
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showOrderConfirmation) {
    return (
      <div>
        <ShopHeader />
        <div className="checkout-container">
          <div className="order-confirmation-page">
            <div className="confirmation-card">
              <div className="confirmation-header">
                <div className="checkmark-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <div className="confirmation-content">
                <h2>Order Placed Successfully!</h2>
                <p className="confirmation-message">Your order has been confirmed and is being processed.</p>

                <div className="order-id-display">
                  <strong>Order ID:</strong>
                  <span>{orderId}</span>
                </div>

                <div className="payment-confirmation">
                  <strong>Payment Method:</strong>
                  <span>
                    {selectedPayment === 'COD' && 'Cash On Delivery (COD)'}
                    {selectedPayment === 'BANK' && 'Bank Transfer'}
                    {selectedPayment === 'CARD' && 'Credit / Debit Card'}
                  </span>
                </div>

                <p className="next-steps">
                  You can track your order from the <strong>Track Order</strong> page.
                </p>

                <div className="confirmation-buttons">
                  <button 
                    className="continue-btn"
                    onClick={() => window.location.href = '/products'}
                  >
                    Continue Shopping
                  </button>
                  <button 
                    className="track-btn"
                    onClick={() => window.location.href = '/track-order'}
                  >
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ShopHeader />
      <div className="checkout-container">
        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            
            <div className="summary-box">
              <div className="summary-header">
                <strong>Items</strong>
                <strong>Total</strong>
              </div>

              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="summary-total">
                <strong>Total Amount:</strong>
                <strong className="total-amount">LKR {currentOrder.total.toLocaleString()}</strong>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="delivery-info">
              <h3>Delivery Address</h3>
              <p className="address-info">
                <strong>{currentOrder.deliveryDetails.fullName}</strong><br />
                {currentOrder.deliveryDetails.address}<br />
                {currentOrder.deliveryDetails.phone}
              </p>
            </div>
          </div>

          {/* Payment Methods & Map */}
          <div className="payment-section">
            <h2>Secure Checkout</h2>
            <div className="total-amount-display">
              Total Amount: <span>LKR {currentOrder.total.toLocaleString()}</span>
            </div>

            <div className="payment-methods">
              <h3>Select Payment Method</h3>

              <div className="payment-option">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  value="COD"
                  checked={selectedPayment === 'COD'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <label htmlFor="cod">
                  <strong>Cash On Delivery (COD)</strong>
                  <span>Pay when your order arrives</span>
                </label>
              </div>

              <div className="payment-option">
                <input
                  type="radio"
                  id="bank"
                  name="payment"
                  value="BANK"
                  checked={selectedPayment === 'BANK'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <label htmlFor="bank">
                  <strong>Bank Transfer (Upload Slip)</strong>
                  <span>Transfer funds to our account and upload slip</span>
                </label>
              </div>

              <div className="payment-option">
                <input
                  type="radio"
                  id="card"
                  name="payment"
                  value="CARD"
                  checked={selectedPayment === 'CARD'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <label htmlFor="card">
                  <strong>Credit / Debit Card 💳</strong>
                  <span>Secure payment with Visa, Mastercard, etc.</span>
                </label>
              </div>
            </div>

            <button 
              className="confirm-order-btn"
              onClick={handlePlaceOrder}
            >
              Confirm & Place Order
            </button>
          </div>
        </div>

        {/* Delivery Map */}
        <div className="delivery-map-section">
          <h2>Delivery Location</h2>
          <div className="map-container">
            <iframe
              title="Delivery Location Map"
              width="100%"
              height="400"
              frameBorder="0"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31676.60703725659!2d79.8620!3d6.9271!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNi45MjcxIE4gNzkuODYyMCBF!5e0!3m2!1sen!2slk!4v1234567890"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <p className="map-note">Your order will be delivered to Suduwella, Colombo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
