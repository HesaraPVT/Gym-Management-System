import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const AdminInvoices = ({ products: initialProducts }) => {
  const [view, setView] = useState('list'); // 'list', 'add'
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState(initialProducts || []);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailView, setShowDetailView] = useState(null);

  // Form state
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [notes, setNotes] = useState('');

  // New Product Form state
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Supplements',
    price: '',
    quantity: '',
    expiry: ''
  });

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const storedInvoices = localStorage.getItem('invoices');
      const storedSuppliers = localStorage.getItem('suppliers');
      const storedProducts = localStorage.getItem('inventoryProducts');

      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
      if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
      if (storedProducts) setProducts(JSON.parse(storedProducts));

      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const addInvoiceItem = (productId) => {
    if (!productId) {
      alert('Please select a product');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = invoiceItems.find(item => item.productId === productId);
    if (existingItem) {
      alert('This product is already added. Edit the quantity if needed.');
      return;
    }

    setInvoiceItems([
      ...invoiceItems,
      {
        productId: productId,
        productName: product.name,
        quantity: 1,
        unitCost: product.price,
        total: product.price
      }
    ]);
  };

  const updateInvoiceItem = (index, field, value) => {
    const updated = [...invoiceItems];
    if (field === 'quantity') {
      const qty = parseInt(value, 10);
      updated[index].quantity = qty;
      updated[index].total = qty * updated[index].unitCost;
    } else if (field === 'unitCost') {
      const cost = parseFloat(value);
      updated[index].unitCost = cost;
      updated[index].total = updated[index].quantity * cost;
    }
    setInvoiceItems(updated);
  };

  const removeInvoiceItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const addNewProductToInvoice = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      alert('Please fill all required fields for the new product');
      return;
    }

    const productId = Date.now().toString();
    const productData = {
      id: productId,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      quantity: 0,
      reorderLevel: 5,
      expiryDate: newProduct.expiry,
      description: 'Added via invoice'
    };

    // Add to products
    const updatedProducts = [...products, productData];
    localStorage.setItem('inventoryProducts', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // Add to invoice items
    setInvoiceItems([
      ...invoiceItems,
      {
        productId: productId,
        productName: newProduct.name,
        quantity: parseInt(newProduct.quantity, 10),
        unitCost: parseFloat(newProduct.price),
        total: parseInt(newProduct.quantity, 10) * parseFloat(newProduct.price)
      }
    ]);

    // Reset form
    setNewProduct({
      name: '',
      category: 'Supplements',
      price: '',
      quantity: '',
      expiry: ''
    });
    setShowNewProductForm(false);
  };

  const calculateGrandTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const submitInvoice = () => {
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }

    if (invoiceItems.length === 0) {
      alert('Please add at least one product to the invoice');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    const invoiceData = {
      id: Date.now().toString(),
      invoiceDate: invoiceDate,
      supplier: supplier.companyName,
      supplierId: selectedSupplier,
      items: invoiceItems,
      grandTotal: calculateGrandTotal(),
      notes: notes,
      createdAt: new Date().toISOString()
    };

    // Update inventory quantities
    let updatedProducts = [...products];
    invoiceItems.forEach(item => {
      updatedProducts = updatedProducts.map(p =>
        p.id === item.productId
          ? { ...p, quantity: p.quantity + item.quantity }
          : p
      );
    });

    // Save to localStorage
    const updatedInvoices = [...invoices, invoiceData];
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    localStorage.setItem('inventoryProducts', JSON.stringify(updatedProducts));

    setInvoices(updatedInvoices);
    setProducts(updatedProducts);

    // Reset form
    resetInvoiceForm();
    setView('list');
    alert('Invoice submitted successfully! Inventory has been updated.');
  };

  const resetInvoiceForm = () => {
    setSelectedSupplier('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setInvoiceItems([]);
    setNotes('');
    setShowNewProductForm(false);
  };

  if (loading) {
    return <div className="inventory-loading">Loading invoices...</div>;
  }

  // ADD INVOICE VIEW
  if (view === 'add') {
    return (
      <div className="invoice-form-container">
        <div className="invoice-form">
          <div className="form-header">
            <h1>Record Supply Invoice</h1>
            <button className="btn-secondary" onClick={() => { resetInvoiceForm(); setView('list'); }}>
              ← Back
            </button>
          </div>

          <div className="invoice-form-content">
            {/* Supplier & Date Section */}
            <div className="invoice-section">
              <div className="section-grid">
                <div className="form-group">
                  <label>Supplier *</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.companyName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Invoice Date *</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="invoice-section">
              <div className="section-header">
                <h3>Line Items</h3>
                <div className="section-actions">
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => setShowNewProductForm(!showNewProductForm)}
                  >
                    <Plus size={16} /> New Product
                  </button>
                </div>
              </div>

              {/* New Product Form */}
              {showNewProductForm && (
                <div className="new-product-form">
                  <h4>Add New Product</h4>
                  <div className="form-grid-compact">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g., Whey Protein"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="form-select"
                      >
                        <option value="Supplements">Supplements</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Unit Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        placeholder="0"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={newProduct.expiry}
                        onChange={(e) => setNewProduct({ ...newProduct, expiry: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <button 
                        className="btn-primary btn-full"
                        onClick={addNewProductToInvoice}
                      >
                        Add to Invoice
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Selection */}
              <div className="product-selector">
                <label>Add Product from Inventory</label>
                <div className="selector-row">
                  <select 
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addInvoiceItem(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Rs. {p.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              {invoiceItems.length > 0 && (
                <div className="line-items-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Cost (Rs.)</th>
                        <th>Total (Rs.)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(idx, 'quantity', e.target.value)}
                              className="qty-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitCost.toFixed(2)}
                              onChange={(e) => updateInvoiceItem(idx, 'unitCost', e.target.value)}
                              className="cost-input"
                            />
                          </td>
                          <td className="total-cell">Rs. {item.total.toFixed(2)}</td>
                          <td>
                            <button 
                              className="btn-sm btn-delete"
                              onClick={() => removeInvoiceItem(idx)}
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="total-label">Grand Total:</td>
                        <td className="grand-total">Rs. {calculateGrandTotal().toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="invoice-section">
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery details, conditions, etc."
                  className="form-textarea"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="invoice-actions">
              <button className="btn-secondary" onClick={() => { resetInvoiceForm(); setView('list'); }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={submitInvoice}>
                Submit Invoice & Update Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // INVOICES LIST VIEW
  return (
    <div className="invoice-list-container">
      <div className="inventory-header">
        <h1>Received Invoices</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => { resetInvoiceForm(); setView('add'); }}>
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      <div className="invoice-card">
        <div className="table-wrapper">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Items Count</th>
                <th>Total Cost (Rs.)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">No invoices recorded yet</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="invoice-id">{invoice.id.slice(-6).toUpperCase()}</td>
                    <td>{invoice.supplier}</td>
                    <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td className="center-cell">{invoice.items.length}</td>
                    <td className="total-cost">Rs. {invoice.grandTotal.toFixed(2)}</td>
                    <td className="action-buttons">
                      <button
                        className="btn-sm btn-view"
                        onClick={() => setShowDetailView(invoice)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {showDetailView && (
        <div className="modal-overlay" onClick={() => setShowDetailView(null)}>
          <div className="modal-content invoice-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invoice Details #{showDetailView.id.slice(-6).toUpperCase()}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowDetailView(null)}
              >
                ✕
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-label">Supplier:</span>
                  <span className="detail-value">{showDetailView.supplier}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(showDetailView.invoiceDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Cost:</span>
                  <span className="detail-value">Rs. {showDetailView.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Items</h4>
                <table className="detail-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Cost</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showDetailView.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productName}</td>
                        <td className="center-cell">{item.quantity}</td>
                        <td>Rs. {item.unitCost.toFixed(2)}</td>
                        <td>Rs. {item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showDetailView.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p>{showDetailView.notes}</p>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowDetailView(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;
