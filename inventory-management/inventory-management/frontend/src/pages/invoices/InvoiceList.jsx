import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/invoices');
        setInvoices(res.data);
      } catch (error) {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Received Invoices</h1>
        <Link to="/invoices/create" className="btn btn-primary">
          <Plus size={18} /> New Invoice
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Items Count</th>
                <th>Total Cost</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No invoices recorded yet</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td style={{fontFamily: 'monospace', fontSize: '0.75rem'}}>
                      {inv.invoiceNumber ? `INV-${String(inv.invoiceNumber).padStart(4, '0')}` : inv._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{fontWeight: 600}}>{inv.supplier?.name || 'Unknown Supplier'}</td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td>{inv.items.length} items</td>
                    <td style={{fontWeight: 600, color: 'var(--text-main)'}}>Rs. {inv.totalCost.toFixed(2)}</td>
                    <td className="text-right">
                      <Link to={`/invoices/${inv._id}`} className="btn-icon">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
