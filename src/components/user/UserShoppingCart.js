import React, { useState, useEffect } from 'react';
import './UserShoppingCart.css';
import ShopHeader from '../common/ShopHeader';

function UserShoppingCart() {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    saveInfo: false
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    // Remove duplicates and sum quantities
    const uniqueCart = [];
    savedCart.forEach(item => {
      const existing = uniqueCart.find(u => u.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        uniqueCart.push({ ...item });
      }
    });
    setCart(uniqueCart);
  }, []);

  const handleQuantityChange = (id, quantity) => {
    let updatedCart;
    if (quantity <= 0) {
      updatedCart = cart.filter(item => item.id !== id);
    } else {
      updatedCart = cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
    }
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleProceedCheckout = () => {
    if (!formData.fullName || !formData.address || !formData.phone) {
      alert('Please fill in all delivery details');
      return;
    }
    
    const order = {
      id: `#0583d${Math.floor(Math.random() * 10000)}`,
      items: cart,
      total: calculateTotal(),
      deliveryDetails: formData,
      status: 'PENDING',
      date: new Date().toLocaleDateString(),
      currentLocation: {
        latitude: 6.9271,
        longitude: 79.8620,
        address: 'Power World Warehouse - Processing'
      }
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));
    localStorage.setItem('orders', JSON.stringify([
      ...(JSON.parse(localStorage.getItem('orders')) || []),
      order
    ]));
    
    alert('Order placed successfully! Proceeding to payment...');
    setCart([]);
    localStorage.removeItem('cart');
    window.location.href = '/checkout';
  };

  if (cart.length === 0 && !showCheckout) {
    return (
      <div>
        <ShopHeader />
        <div className="shopping-cart-container">
          <div className="empty-cart">
            <h2>Your Cart is Empty</h2>
            <p>Start adding products to your cart!</p>
            <button className="continue-shopping-btn" onClick={() => window.history.back()}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div>
      <ShopHeader />
      <div className="shopping-cart-container">
        <div className="cart-content">
        <div className="cart-items-section">
          <h2>Shopping Cart ({cart.length} items)</h2>
          
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-code">LKR {item.price}</p>
                </div>

                <div className="quantity-control">
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    min="1"
                  />
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary-section">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-item">
                <span>Subtotal</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>Delivery</span>
                <span>LKR 0</span>
              </div>
              <div className="summary-item">
                <span>Tax</span>
                <span>LKR 0</span>
              </div>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>LKR {total.toLocaleString()}</span>
            </div>

            <button 
              className="proceed-checkout-btn"
              onClick={() => setShowCheckout(true)}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <button className="close-btn" onClick={() => setShowCheckout(false)}>×</button>
            
            <h2>DELIVERY DETAILS</h2>

            <form className="checkout-form">
              <div className="form-group">
                <label>FULL NAME *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>DELIVERY ADDRESS *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your delivery address"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label>PHONE NUMBER *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  name="saveInfo"
                  id="saveInfo"
                  checked={formData.saveInfo}
                  onChange={handleInputChange}
                />
                <label htmlFor="saveInfo">Save my information for next time</label>
              </div>

              <div className="total-amount">
                Total Amount: <span>LKR {total.toLocaleString()}</span>
              </div>

              <button 
                type="button"
                className="continue-payment-btn"
                onClick={handleProceedCheckout}
              >
                CONTINUE TO PAYMENT
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default UserShoppingCart;
