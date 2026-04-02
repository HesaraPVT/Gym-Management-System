import React, { useState } from 'react';
import './UserShopPage.css';
import ShopHeader from '../common/ShopHeader';
import wheyImage from '../../images/whey.jpg';
import creatineImage from '../../images/creatine.jpg';
import bcaaImage from '../../images/bcaa.jpg';
import gainerImage from '../../images/gainer.jpg';
import fishoilImage from '../../images/fishoil.jpg';
import multiImage from '../../images/multi.jpg';
import proteinbarImage from '../../images/proteinbar.jpg';
import preworkoutImage from '../../images/preworkout.jpg';

function UserShopPage({ onCartUpdate }) {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  const products = [
    {
      id: 1,
      name: 'Whey Protein',
      description: 'High-quality protein for muscle recovery.',
      price: 8500,
      image: wheyImage,
      category: 'Protein'
    },
    {
      id: 2,
      name: 'Creatine',
      description: 'Boost strength and high-intensity power.',
      price: 3500,
      image: creatineImage,
      category: 'Strength'
    },
    {
      id: 3,
      name: 'BCAA',
      description: 'Supports muscle endurance and hydration.',
      price: 4000,
      image: bcaaImage,
      category: 'Amino Acids'
    },
    {
      id: 4,
      name: 'Mass Gainer',
      description: 'High-calorie formula for bulking.',
      price: 5000,
      image: gainerImage,
      category: 'Gainer'
    },
    {
      id: 5,
      name: 'Fish Oil',
      description: 'Omega-3 for joint and heart health.',
      price: 3000,
      image: fishoilImage,
      category: 'Supplement'
    },
    {
      id: 6,
      name: 'Multivitamin',
      description: 'Complete essential vitamins and minerals.',
      price: 2500,
      image: multiImage,
      category: 'Vitamin'
    },
    {
      id: 7,
      name: 'Protein Bar',
      description: 'Convenient on-the-go protein snack.',
      price: 800,
      image: proteinbarImage,
      category: 'Snack'
    },
    {
      id: 8,
      name: 'Pre-Workout',
      description: 'Energy and focus for intense workouts.',
      price: 2800,
      image: preworkoutImage,
      category: 'Energy'
    }
  ];

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    localStorage.setItem('cart', JSON.stringify([...cart, { ...product, quantity: 1 }]));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="user-shop-page">
      <ShopHeader />
      {/* Hero Banner */}
      <div className="shop-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>FUEL YOUR <span>AMBITION</span></h1>
          <p>Premium supplements. Professional tracking.</p>
        </div>
      </div>

      {/* Our Collection */}
      <div className="shop-container">
        <div className="collection-header">
          <h2>OUR <span>COLLECTION</span></h2>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                
                <div className="product-footer">
                  <div className="product-price">Rs. {product.price.toLocaleString()}</div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>

                <a href="#how-to-use" className="how-to-use-link">
                  How to use?
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserShopPage;
