import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, PackagePlus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(o => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : search;

  const searchTerms = search.toLowerCase().split(' ').filter(Boolean);
  const filteredOptions = options.filter(o => {
    const lbl = o.label.toLowerCase();
    return searchTerms.every(term => lbl.includes(term));
  });

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input 
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={isOpen ? search : (displayValue || '')}
          onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setSearch(''); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid var(--border)', borderRadius: '4px' }}
          required={!value}
        />
        <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      </div>
      {isOpen && (
        <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--border)', zIndex: 10, maxHeight: '350px', overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {filteredOptions.length === 0 ? <li style={{ padding: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>No products found</li> : null}
          {filteredOptions.map(o => (
            <li 
              key={o.value}
              onMouseDown={() => { onChange(o.value); setIsOpen(false); }}
              style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [supplier, setSupplier] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  const [items, setItems] = useState([{ product: '', quantity: 1, unitCost: 0, expiryDate: '' }]);
  
  // Quick Add Product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Supplements');
  const [newProdPrice, setNewProdPrice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supsRes, prodsRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/products')
        ]);
        setSuppliers(supsRes.data);
        setProducts(prodsRes.data);
      } catch (error) {
        toast.error('Failed to load initial data');
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, unitCost: 0, expiryDate: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-fill unit cost if product is selected
    if (field === 'product' && value) {
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) {
        newItems[index].unitCost = selectedProd.costPrice || 0;
      }
    }
    
    setItems(newItems);
  };

  const handleQuickAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', {
        name: newProdName,
        category: newProdCategory,
        price: Number(newProdPrice),
        costPrice: 0,
        quantity: 0,
        reorderLevel: 5,
      });
      toast.success('Product created successfully!');
      
      const newProduct = res.data;
      setProducts([...products, newProduct]);
      
      // Auto-select in the last empty item row or add a new row
      setItems(prevItems => {
        const newItems = [...prevItems];
        const emptyIndex = newItems.findIndex(i => !i.product);
        if (emptyIndex !== -1) {
          // IMPORTANT: Immutable update to prevent React Strict mode duplication bug!
          newItems[emptyIndex] = {
            ...newItems[emptyIndex],
            product: newProduct._id,
            unitCost: newProduct.costPrice || 0
          };
        } else {
          newItems.push({ product: newProduct._id, quantity: 1, unitCost: newProduct.costPrice || 0, expiryDate: '' });
        }
        return newItems;
      });
      
      setShowAddProduct(false);
      setNewProdName('');
      setNewProdPrice('');
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const grandTotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.unitCost));
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!supplier) return toast.error('Please select a supplier');
    if (!invoiceDate) return toast.error('Please select an invoice date');
    
    if (new Date(invoiceDate) > new Date()) {
      return toast.error('Invoice date cannot be in the future');
    }

    if (items.some(i => !i.product)) {
      return toast.error('All line items must implicitly have a product selected');
    }
    
    if (items.some(i => i.quantity < 1 || i.unitCost <= 0)) {
      return toast.error('Invalid quantity or unit cost in line items. Cost must be strictly greater than 0.');
    }

    const payload = {
      supplier,
      invoiceDate,
      notes,
      items: items.map(i => ({
        product: i.product,
        quantity: Number(i.quantity),
        unitCost: Number(i.unitCost),
        expiryDate: i.expiryDate || null
      }))
    };

    try {
      await api.post('/invoices', payload);
      toast.success('Invoice recorded successfully!');
      navigate('/invoices');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    }
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="page-title">Record Supply Invoice</h1>
        <span className="badge badge-yellow">Adds to inventory stock</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid mb-6">
          <div className="form-group">
            <label>Supplier *</label>
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)} required>
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Invoice Date *</label>
            <input 
              type="date" 
              value={invoiceDate} 
              onChange={(e) => setInvoiceDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex-between mb-2">
            <label>Line Items *</label>
            <div className="flex-gap-2">
              <button type="button" onClick={() => setShowAddProduct(true)} className="btn btn-secondary flex-gap-2" style={{padding: '0.25rem 0.5rem', fontSize:'0.75rem'}}>
                <PackagePlus size={14} /> New Product
              </button>
              <button type="button" onClick={handleAddItem} className="btn btn-secondary flex-gap-2" style={{padding: '0.25rem 0.5rem', fontSize:'0.75rem', backgroundColor: 'var(--primary)', color: 'white'}}>
                <Plus size={14} /> Add Row
              </button>
            </div>
          </div>

          <div className="table-container border" style={{ borderRadius: '8px', minHeight: '300px' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead style={{ backgroundColor: '#F1F5F9' }}>
                <tr>
                  <th style={{width: '35%'}}>Product</th>
                  <th style={{width: '15%'}}>Quantity</th>
                  <th style={{width: '15%'}}>Unit Cost (Rs)</th>
                  <th style={{width: '20%'}}>Batch Expiry Date</th>
                  <th style={{width: '10%'}}>Total</th>
                  <th style={{width: '5%'}}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const lineTotal = (Number(item.quantity) * Number(item.unitCost)).toFixed(2);
                  return (
                    <tr key={index}>
                      <td style={{padding: '0.5rem'}}>
                        <SearchableSelect 
                          value={item.product}
                          onChange={(val) => handleItemChange(index, 'product', val)}
                          options={products.map(p => ({ value: p._id, label: `${p.name} (${p.category})` }))}
                          placeholder="Search product..."
                        />
                      </td>
                      <td style={{padding: '0.5rem'}}>
                        <input 
                          type="number" min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                          style={{width:'100%', padding:'0.5rem'}}
                        />
                      </td>
                      <td style={{padding: '0.5rem'}}>
                        <input 
                          type="number" min="0.01" step="0.01"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                          required
                          style={{width:'100%', padding:'0.5rem'}}
                          placeholder="Rs."
                        />
                      </td>
                      <td style={{padding: '0.5rem'}}>
                        <input 
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                          style={{width:'100%', padding:'0.5rem'}}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </td>
                      <td style={{padding: '0.5rem', fontWeight: 600}}>
                        Rs. {isNaN(lineTotal) ? '0.00' : Number(lineTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td style={{padding: '0.5rem', textAlign: 'center'}}>
                        {items.length > 1 && (
                          <button 
                            type="button" 
                            className="btn-icon delete" 
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-right" style={{padding: '1rem', fontWeight: 600}}>Grand Total:</td>
                  <td colSpan="2" style={{padding: '1rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)'}}>
                    Rs. {grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="form-group full-width mb-6">
          <label>Notes (Optional)</label>
          <textarea 
            rows="2" 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery details, conditions, etc."
          />
        </div>

        <div className="flex-between mt-6">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Submit Invoice & Update Stock
          </button>
        </div>
      </form>

      {/* Quick Add Product Modal */}
      {showAddProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
            <h2 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add Missing Product</h2>
            <form onSubmit={handleQuickAddProduct}>
              <div className="form-group mb-4">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  value={newProdName} 
                  onChange={(e) => setNewProdName(e.target.value)}
                  required 
                  autoFocus
                />
              </div>
              <div className="form-group mb-4">
                <label>Category *</label>
                <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} required>
                  <option value="Supplements">Supplements</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group mb-4">
                <label>Member Selling Price (Rs) *</label>
                <input 
                  type="number" min="0" step="0.01"
                  value={newProdPrice} 
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  required 
                />
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Note: Cost price and quantity will be automatically updated from this invoice after saving!
              </p>
              <div className="flex-gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add & Select</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;
