import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, PackagePlus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cardFilter, setCardFilter] = useState('All');
  
  // Dialog states
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await api.delete(`/products/${deleteProduct._id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleteProduct(null);
    }
  };

  const handleRestockClick = (product) => {
    setRestockProduct(product);
    setRestockQty('');
  };

  const submitRestock = async (e) => {
    e.preventDefault();
    if (!restockProduct) return;
    
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      return toast.error('Please enter a valid amount');
    }

    try {
      await api.post('/stock/in', {
        productId: restockProduct._id,
        quantity: qty,
        reason: 'Quick Restock from Inventory Panel'
      });
      toast.success(`${qty} items added to ${restockProduct.name}`);
      fetchProducts();
      setRestockProduct(null);
    } catch (error) {
      toast.error('Failed to restock product');
    }
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
      const rows = filteredProducts.map(p => [
        p.productCode ? `PRD-${String(p.productCode).padStart(4, '0')}` : p._id.slice(-6).toUpperCase(),
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
      toast.success('Report downloaded successfully!');
    } catch(err) {
      toast.error('Failed to generate report');
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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <div className="flex-gap-2">
          <button onClick={exportCSV} className="btn btn-secondary flex-gap-2">
            <Download size={18} /> Export CSV
          </button>
          <Link to="/inventory/add" className="btn btn-primary">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      <div className="summary-grid">
        <div 
          className="summary-card border-red" 
          style={{ cursor: 'pointer', backgroundColor: cardFilter === 'Low Stock' ? '#FEF2F2' : 'white' }}
          onClick={() => setCardFilter(cardFilter === 'Low Stock' ? 'All' : 'Low Stock')}
        >
          <div className="summary-title" style={{ fontSize: '0.85rem' }}>{cardFilter === 'Low Stock' ? 'Clear Filter (Low Stock)' : 'Low Stock (Click to filter)'}</div>
          <div className="summary-value text-red-600">{lowStockCount}</div>
        </div>
        <div 
          className="summary-card border-yellow" 
          style={{ cursor: 'pointer', backgroundColor: cardFilter === 'Expiring Soon' ? '#FFFBEB' : 'white' }}
          onClick={() => setCardFilter(cardFilter === 'Expiring Soon' ? 'All' : 'Expiring Soon')}
        >
          <div className="summary-title" style={{ fontSize: '0.85rem' }}>{cardFilter === 'Expiring Soon' ? 'Clear Filter (Expiring)' : 'Expiring / Expired (Click to filter)'}</div>
          <div className="summary-value text-yellow-600">{expiringSoonCount}</div>
        </div>
        <div 
          className="summary-card border-green" 
          style={{ cursor: 'pointer', backgroundColor: cardFilter === 'All' ? '#F0FDF4' : 'white' }}
          onClick={() => setCardFilter('All')}
        >
          <div className="summary-title" style={{ fontSize: '0.85rem' }}>Total Products</div>
          <div className="summary-value text-green-600">{products.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-4 flex-wrap gap-4">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`btn ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
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
                  <td colSpan="8" className="empty-state">No products found for this filter</td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockBadge = getStockBadge(product.quantity, product.reorderLevel);
                  const expiryBadge = calculateExpiryLabel(product.expiryDate);
                  
                  return (
                    <tr key={product._id}>
                      <td style={{fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b'}}>
                        {product.productCode ? `PRD-${String(product.productCode).padStart(4, '0')}` : product._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        {product.photo ? (
                          <img 
                            src={`http://localhost:5000/uploads/${product.photo}`} 
                            alt={product.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{color:'#a0aec0', fontSize: '10px'}}>No img</span>
                          </div>
                        )}
                      </td>
                      <td style={{fontWeight: 600}}>{product.name}</td>
                      <td><span className="badge badge-gray">{product.category}</span></td>
                      <td style={{fontWeight: 500}}>Rs. {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-start'}}>
                          <span style={{fontWeight: 600}}>{product.quantity}</span>
                          <span className={`badge ${stockBadge.class}`}>{stockBadge.label}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-start'}}>
                          <span style={{ fontSize: '0.85rem' }}>{expiryBadge.dateStr}</span>
                          {product.expiryDate && <span className={`badge ${expiryBadge.class}`}>{expiryBadge.label}</span>}
                        </div>
                      </td>
                      <td className="text-right flex-gap-2 justify-end">
                        <Link to={`/inventory/edit/${product._id}`} className="btn btn-secondary flex-gap-2" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                          <Edit2 size={14} /> Edit
                        </Link>
                        <button 
                          className="btn btn-secondary flex-gap-2" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                          onClick={() => setDeleteProduct(product)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                        {product.quantity <= product.reorderLevel && (
                          <button 
                            className="btn btn-secondary flex-gap-2" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            onClick={() => handleRestockClick(product)}
                            title="Quick Restock"
                          >
                            <PackagePlus size={14} /> Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete ${deleteProduct?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteProduct(null)}
      />

      {/* Modern Restock Modal */}
      {restockProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Restock Item
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
              Add new stock for <strong>{restockProduct.name}</strong>
            </p>
            
            <form onSubmit={submitRestock}>
              <div className="form-group mb-4">
                <label>Quantity to add *</label>
                <input 
                  type="number" 
                  min="1" 
                  value={restockQty} 
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 50" 
                  autoFocus
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              </div>
              <div className="flex-gap-2" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRestockProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <PackagePlus size={16} /> Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
