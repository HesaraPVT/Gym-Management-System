import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, PackagePlus } from 'lucide-react';
import AdminSuppliers from './AdminSuppliers';
import AdminInvoices from './AdminInvoices';
import './AdminInventory.css';

const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'suppliers', 'invoices'
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cardFilter, setCardFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Supplements',
    price: '',
    quantity: 0,
    reorderLevel: '',
    expiryDate: '',
    description: ''
  });

  // Load products from localStorage
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('inventoryProducts');
      if (stored) {
        setProducts(JSON.parse(stored));
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load products:', error);
      setLoading(false);
    }
  };

  const saveProduct = () => {
    if (!formData.name || !formData.price || !formData.reorderLevel) {
      alert('Please fill all required fields');
      return;
    }

    let updated = [...products];

    if (view === 'add') {
      const newProduct = {
        id: Date.now().toString(),
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        reorderLevel: parseInt(formData.reorderLevel, 10),
        createdAt: new Date().toISOString()
      };
      updated.push(newProduct);
    } else if (view === 'edit' && editingProduct) {
      updated = updated.map(p =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...formData,
              price: parseFloat(formData.price),
              quantity: parseInt(formData.quantity, 10),
              reorderLevel: parseInt(formData.reorderLevel, 10),
              updatedAt: new Date().toISOString()
            }
          : p
      );
    }

    localStorage.setItem('inventoryProducts', JSON.stringify(updated));
    setProducts(updated);
    resetForm();
    setView('list');
  };

  const deleteProduct = () => {
    if (!deleteConfirm) return;
    
    const updated = products.filter(p => p.id !== deleteConfirm.id);
    localStorage.setItem('inventoryProducts', JSON.stringify(updated));
    setProducts(updated);
    setDeleteConfirm(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      expiryDate: product.expiryDate || '',
      description: product.description || ''
    });
    setView('edit');
  };

  const handleRestock = (product) => {
    setRestockProduct(product);
    setRestockQty('');
  };

  const submitRestock = () => {
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const updated = products.map(p =>
      p.id === restockProduct.id
        ? { ...p, quantity: p.quantity + qty }
        : p
    );

    localStorage.setItem('inventoryProducts', JSON.stringify(updated));
    setProducts(updated);
    setRestockProduct(null);
    setRestockQty('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Supplements',
      price: '',
      quantity: 0,
      reorderLevel: '',
      expiryDate: '',
      description: ''
    });
    setEditingProduct(null);
  };

  const calculateExpiryLabel = (date) => {
    if (!date) return { label: '—', class: 'badge-gray', dateStr: 'No Expiry' };
    const now = new Date();
    const expiry = new Date(date);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    const dtString = expiry.toLocaleDateString();

    if (diffDays < 0) return { label: `Expired (${Math.abs(diffDays)}d)`, class: 'badge-red', dateStr: dtString };
    if (diffDays <= 30) return { label: `Soon (${diffDays}d)`, class: 'badge-orange', dateStr: dtString };
    return { label: 'Valid', class: 'badge-green', dateStr: dtString };
  };

  const getStockBadge = (quantity, reorderLevel) => {
    if (quantity === 0) return { label: 'Out of Stock', class: 'badge-red' };
    if (quantity <= reorderLevel && quantity <= 2) return { label: 'Critical', class: 'badge-red' };
    if (quantity <= reorderLevel && quantity <= 5) return { label: 'Low', class: 'badge-orange' };
    if (quantity <= reorderLevel) return { label: 'Medium', class: 'badge-yellow' };
    return { label: 'Adequate', class: 'badge-green' };
  };

  const exportCSV = () => {
    try {
      const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Reorder Level', 'Expiry Date'];
      const rows = filteredProducts.map((p, idx) => [
        p.id.slice(-6).toUpperCase(),
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.price,
        p.quantity,
        p.reorderLevel,
        p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'No Expiry'
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Report downloaded successfully!');
    } catch (err) {
      alert('Failed to generate report');
    }
  };

  const categories = ['All', 'Supplements', 'Equipment', 'Accessories', 'Other'];

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    let matchesCard = true;
    if (cardFilter === 'Low Stock') {
      matchesCard = p.quantity <= p.reorderLevel;
    } else if (cardFilter === 'Expiring Soon') {
      matchesCard = p.expiryDate && new Date(p.expiryDate) <= in30Days;
    }

    return matchesSearch && matchesCategory && matchesCard;
  });

  if (cardFilter === 'Expiring Soon') {
    filteredProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }

  const lowStockCount = products.filter(p => p.quantity <= p.reorderLevel).length;
  const expiringSoonCount = products.filter(p => p.expiryDate && new Date(p.expiryDate) <= in30Days).length;

  // RENDER VIEWS
  if (view === 'add' || view === 'edit') {
    return (
      <div className="inventory-form-container">
        <div className="inventory-form">
          <div className="form-header">
            <h1>{view === 'add' ? 'Add New Product' : 'Edit Product'}</h1>
            <button className="btn-secondary" onClick={() => { resetForm(); setView('list'); }}>
              ← Back
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Whey Protein"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Supplements">Supplements</option>
                <option value="Equipment">Equipment</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Reorder Level *</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                placeholder="5"
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description (optional)"
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => { resetForm(); setView('list'); }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveProduct}>
                {view === 'add' ? 'Save Product' : 'Update Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW WITH TABS
  if (loading && activeTab === 'inventory') {
    return <div className="inventory-loading">Loading inventory...</div>;
  }

  // Render Suppliers tab
  if (activeTab === 'suppliers') {
    return <AdminSuppliers />;
  }

  // Render Invoices tab
  if (activeTab === 'invoices') {
    return <AdminInvoices products={products} />;
  }

  // INVENTORY LIST VIEW
  if (view === 'list') {
    return (
      <div className="inventory-container">
        <div className="inventory-header">
          <h1>Inventory Management</h1>
          <div className="header-actions">
            <button className="btn-secondary export-btn" onClick={exportCSV}>
              📥 Export CSV
            </button>
            <button className="btn-primary" onClick={() => { resetForm(); setView('add'); }}>
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="inventory-tabs">
          <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventory
          </button>
          <button 
            className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            🏢 Suppliers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            📄 Invoices
          </button>
        </div>

        <div className="summary-grid">
          <div
            className="summary-card low-stock"
            style={{ cursor: 'pointer', backgroundColor: cardFilter === 'Low Stock' ? '#fff5f5' : 'white' }}
            onClick={() => setCardFilter(cardFilter === 'Low Stock' ? 'All' : 'Low Stock')}
          >
            <div className="summary-title">{cardFilter === 'Low Stock' ? 'Clear Filter (Low Stock)' : 'Low Stock (Click to filter)'}</div>
            <div className="summary-value">{lowStockCount}</div>
          </div>
          <div
            className="summary-card expiring"
            style={{ cursor: 'pointer', backgroundColor: cardFilter === 'Expiring Soon' ? '#fffbeb' : 'white' }}
            onClick={() => setCardFilter(cardFilter === 'Expiring Soon' ? 'All' : 'Expiring Soon')}
          >
            <div className="summary-title">{cardFilter === 'Expiring Soon' ? 'Clear Filter (Expiring)' : 'Expiring / Expired (Click to filter)'}</div>
            <div className="summary-value">{expiringSoonCount}</div>
          </div>
          <div
            className="summary-card all-products"
            style={{ cursor: 'pointer', backgroundColor: cardFilter === 'All' ? '#f0fdf4' : 'white' }}
            onClick={() => setCardFilter('All')}
          >
            <div className="summary-title">Total Products</div>
            <div className="summary-value">{products.length}</div>
          </div>
        </div>

        <div className="inventory-card">
          <div className="filter-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Expiry Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">No products found for this filter</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockBadge = getStockBadge(product.quantity, product.reorderLevel);
                    const expiryBadge = calculateExpiryLabel(product.expiryDate);

                    return (
                      <tr key={product.id}>
                        <td className="product-id">{product.id.slice(-6).toUpperCase()}</td>
                        <td className="product-name">{product.name}</td>
                        <td><span className="badge badge-gray">{product.category}</span></td>
                        <td className="product-price">Rs. {product.price.toFixed(2)}</td>
                        <td>
                          <div className="stock-info">
                            <span className="stock-qty">{product.quantity}</span>
                            <span className={`badge ${stockBadge.class}`}>{stockBadge.label}</span>
                          </div>
                        </td>
                        <td>
                          <div className="expiry-info">
                            <span className="expiry-date">{expiryBadge.dateStr}</span>
                            {product.expiryDate && <span className={`badge ${expiryBadge.class}`}>{expiryBadge.label}</span>}
                          </div>
                        </td>
                        <td className="action-buttons">
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => handleEdit(product)}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-sm btn-delete"
                            onClick={() => setDeleteConfirm(product)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                          {product.quantity <= product.reorderLevel && (
                            <button
                              className="btn-sm btn-restock"
                              onClick={() => handleRestock(product)}
                              title="Quick Restock"
                            >
                              <PackagePlus size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Product</h2>
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-danger" onClick={deleteProduct}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {restockProduct && (
          <div className="modal-overlay" onClick={() => setRestockProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Restock Item</h2>
              <p>Add new stock for <strong>{restockProduct.name}</strong></p>
              <div className="form-group">
                <label>Quantity to add *</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 50"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setRestockProduct(null)}>Cancel</button>
                <button className="btn-primary" onClick={submitRestock}>Update Stock</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default AdminInventory;
