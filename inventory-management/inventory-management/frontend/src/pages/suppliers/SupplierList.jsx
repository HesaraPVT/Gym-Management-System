import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [deleteSupplier, setDeleteSupplier] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async () => {
    if (!deleteSupplier) return;
    try {
      await api.delete(`/suppliers/${deleteSupplier._id}`);
      toast.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    } finally {
      setDeleteSupplier(null);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <Link to="/suppliers/add" className="btn btn-primary">
          <Plus size={18} /> Add Supplier
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by company or contact name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No suppliers found</td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => (
                  <tr key={sup._id}>
                    <td style={{fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b'}}>
                      {sup.supplierCode ? `SUP-${String(sup.supplierCode).padStart(4, '0')}` : sup._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{fontWeight: 600}}>{sup.name}</td>
                    <td>{sup.contactPerson}</td>
                    <td>{sup.phone}</td>
                    <td>{sup.email}</td>
                    <td className="text-right flex-gap-2 justify-end">
                      <Link to={`/suppliers/edit/${sup._id}`} className="btn btn-secondary flex-gap-2" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        <Edit2 size={14} /> Edit
                      </Link>
                      <button 
                        className="btn btn-secondary flex-gap-2" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                        onClick={() => setDeleteSupplier(sup)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteSupplier}
        title="Delete Supplier"
        message={`Are you sure you want to delete ${deleteSupplier?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteSupplier(null)}
      />
    </div>
  );
};

export default SupplierList;
