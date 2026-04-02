import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ShopHeader.css';
import logo from '../../images/PowerWorldGymsIcon.png';

function ShopHeader() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.length);
  }, []);

  return (
    <div className="shop-header">
      <div className="header-content">
        <Link to="/" className="header-logo-link">
          <img src={logo} alt="Power World Gyms" className="header-logo" />
        </Link>

        <div className="header-nav-shop">
          <Link to="/products" className="nav-link">
            PRODUCTS
          </Link>
          <Link to="/track-order" className="nav-link">
            TRACK ORDER
          </Link>
        </div>

        <Link to="/cart" className="cart-icon-link">
          <div className="cart-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>
        </Link>
      </div>
    </div>
  );
}

export default ShopHeader;
