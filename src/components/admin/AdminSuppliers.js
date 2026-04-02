import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const AdminSuppliers = () => {
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  // Load suppliers from localStorage
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('suppliers');
      if (stored) {
        setSuppliers(JSON.parse(stored));
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setLoading(false);
    }
  };

  const saveSupplier = () => {
    if (!formData.companyName || !formData.phone || !formData.email) {
      alert('Please fill all required fields');
      return;
    }

    let updated = [...suppliers];

    if (view === 'add') {
      const newSupplier = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      updated.push(newSupplier);
    } else if (view === 'edit' && editingSupplier) {
      updated = updated.map(s =>
        s.id === editingSupplier.id
          ? {
              ...s,
              ...formData,
              updatedAt: new Date().toISOString()
            }
          : s
      );
    }

    localStorage.setItem('suppliers', JSON.stringify(updated));
    setSuppliers(updated);
    resetForm();
    setView('list');
  };

  const deleteSupplier = () => {
    if (!deleteConfirm) return;
    
    const updated = suppliers.filter(s => s.id !== deleteConfirm.id);
    localStorage.setItem('suppliers', JSON.stringify(updated));
    setSuppliers(updated);
    setDeleteConfirm(null);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address || ''
    });
    setView('edit');
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    });
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // RENDER VIEWS
  if (view === 'add' || view === 'edit') {
    return (
      <div className="inventory-form-container">
        <div className="inventory-form">
          <div className="form-header">
            <h1>{view === 'add' ? 'Add New Supplier' : 'Edit Supplier'}</h1>
            <button className="btn-secondary" onClick={() => { resetForm(); setView('list'); }}>
              ← Back
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g., ABC Supplements Ltd"
              />
            </div>

            <div className="form-group">
              <label>Contact Person Name *</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +92 300 1234567"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., contact@supplier.com"
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                rows="3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Supplier address"
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => { resetForm(); setView('list'); }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveSupplier}>
                {view === 'add' ? 'Add Supplier' : 'Update Supplier'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  if (loading) {
    return <div className="inventory-loading">Loading suppliers...</div>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>Suppliers</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => { resetForm(); setView('add'); }}>
            <Plus size={18} /> Add Supplier
          </button>
        </div>
      </div>

      <div className="inventory-card">
        <div className="filter-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by company or contact name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">No suppliers found</td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="product-id">{supplier.id.slice(-6).toUpperCase()}</td>
                    <td className="product-name">{supplier.companyName}</td>
                    <td>{supplier.contactPerson}</td>
                    <td>{supplier.phone}</td>
                    <td className="email-cell">{supplier.email}</td>
                    <td className="address-cell">{supplier.address || '—'}</td>
                    <td className="action-buttons">
                      <button
                        className="btn-sm btn-edit"
                        onClick={() => handleEdit(supplier)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-sm btn-delete"
                        onClick={() => setDeleteConfirm(supplier)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Supplier</h2>
            <p>Are you sure you want to delete <strong>{deleteConfirm.companyName}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={deleteSupplier}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;
