import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (error) {
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="card max-w-4xl mx-auto" style={{ padding: '2rem' }}>
      <div className="flex-between mb-8 pb-6" style={{ borderBottom: '2px solid var(--border)' }}>
        <div>
          <Link to="/invoices" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="page-title">
            Invoice #{invoice.invoiceNumber ? `INV-${String(invoice.invoiceNumber).padStart(4, '0')}` : invoice._id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-muted mt-2">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={18} /> Print
        </button>
      </div>

      <div className="form-grid mb-8">
        <div>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Supplier Details</h3>
          {invoice.supplier ? (
            <div>
              <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{invoice.supplier.name}</p>
              <p className="text-muted">{invoice.supplier.contactPerson}</p>
              <p className="text-muted">{invoice.supplier.phone}</p>
              <p className="text-muted">{invoice.supplier.email}</p>
              {invoice.supplier.address && <p className="text-muted">{invoice.supplier.address}</p>}
            </div>
          ) : (
            <p className="error-text">Supplier information missing or deleted</p>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>System Metadata</h3>
          <p className="text-muted">Recorded on: {new Date(invoice.createdAt).toLocaleString()}</p>
          <p className="text-muted">Stock Status: <span className="badge badge-green">Added to Inventory</span></p>
        </div>
      </div>

      <div className="table-container mb-8">
        <table className="table border" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ backgroundColor: '#F8FAFC' }}>
            <tr>
              <th>Item Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>
                  {item.product?.name || `Product Deleted (${item.product})`}
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {item.product?.category}
                  </div>
                </td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">Rs. {item.unitCost.toFixed(2)}</td>
                <td className="text-right" style={{ fontWeight: 600 }}>
                  Rs. {(item.quantity * item.unitCost).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#F8FAFC' }}>
              <td colSpan="3" className="text-right" style={{ padding: '1rem', fontWeight: 600 }}>Grand Total</td>
              <td className="text-right" style={{ padding: '1rem', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                Rs. {invoice.totalCost.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.notes && (
        <div style={{ backgroundColor: '#F1F5F9', padding: '1rem', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Notes:</h4>
          <p className="text-muted">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
