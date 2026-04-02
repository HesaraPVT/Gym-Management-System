import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, prodRes, movRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/products'),
          api.get('/stock/movements')
        ]);
        setSummary(sumRes.data);
        setProducts(prodRes.data);
        setMovements(movRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !summary) return <LoadingSpinner />;

  // Prepare Bar Chart Data (Top 8 products by absolute quantity)
  const barChartData = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      Stock: p.quantity,
      'Reorder Level': p.reorderLevel
    }));

  // Prepare Line Chart Data (Last 30 days stock IN vs OUT)
  const now = new Date();
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const lineChartData = last30Days.map(dateStr => {
    const dayMovements = movements.filter(m => m.date && typeof m.date === 'string' && m.date.startsWith(dateStr));
    const stockIn = dayMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0);
    const stockOut = dayMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0);

    // Format date as "MMM DD" for X-axis
    const [year, month, day] = dateStr.split('-');
    const dt = new Date(year, parseInt(month) - 1, day);
    const formatted = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: formatted,
      'Stock IN': stockIn,
      'Stock OUT': stockOut
    };
  });

  // Alerts
  const lowStockAlerts = products
    .filter(p => p.quantity <= p.reorderLevel)
    .sort((a, b) => (a.quantity - a.reorderLevel) - (b.quantity - b.reorderLevel)) // most critical first
    .slice(0, 10);

  const expiringSoonAlerts = products
    .filter(p => p.expiryDate)
    .filter(p => {
      const exp = new Date(p.expiryDate);
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return exp <= in30Days;
    })
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)) // nearest first
    .slice(0, 10);

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      {/* Summary Stat Cards */}
      <div className="summary-grid mb-8">
        <div className="summary-card" style={{ borderLeftColor: 'var(--primary)' }}>
          <div className="flex-between">
            <div>
              <div className="summary-title flex-gap-2">
                <Package size={16} /> Total Products
              </div>
              <div className="summary-value" style={{ color: 'var(--primary)' }}>
                {summary.totalProducts}
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card border-red">
          <div className="flex-between">
            <div>
              <div className="summary-title flex-gap-2">
                <AlertTriangle size={16} color="var(--danger)" /> Low Stock Items
              </div>
              <div className="summary-value text-red-600">
                {summary.lowStockCount}
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card border-yellow">
          <div className="flex-between">
            <div>
              <div className="summary-title flex-gap-2">
                <Clock size={16} color="var(--warning)" /> Expiring / Expired
              </div>
              <div className="summary-value text-yellow-600">
                {summary.expiringSoonCount}
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card border-green">
          <div className="flex-between">
            <div>
              <div className="summary-title flex-gap-2">
                <DollarSign size={16} color="var(--success)" /> Total Inventory Value
              </div>
              <div className="summary-value text-green-600">
                Rs. {(summary.totalInventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="form-grid mb-8">
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Stock vs Reorder Levels (Top 8 Items)</h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Stock" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Reorder Level" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Stock Movements (Last 30 Days)</h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#718096' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Stock IN" stroke="var(--success)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Stock OUT" stroke="var(--danger)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="form-grid">
        <div className="card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--danger)" /> Low Stock Alerts
            </h3>
            <Link to="/inventory" className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', textDecoration: 'none' }}>View All</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lowStockAlerts.length === 0 ? (
              <p className="text-muted text-center py-4">All stock levels are adequate.</p>
            ) : (
              lowStockAlerts.map(p => (
                <div key={p._id} className="flex-between" style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {p.photo ? (
                      <img src={`http://localhost:5000/uploads/${p.photo}`} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', backgroundColor: '#FCA5A5', borderRadius: '4px' }}></div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Reorder below {p.reorderLevel}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--danger)' }}>
                    {p.quantity} left
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--warning)" /> Expiring / Expired
            </h3>
            <Link to="/inventory" className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', textDecoration: 'none' }}>View All</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {expiringSoonAlerts.length === 0 ? (
              <p className="text-muted text-center py-4">No items expiring within 30 days.</p>
            ) : (
              expiringSoonAlerts.map(p => {
                const diffDays = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={p._id} className="flex-between" style={{ padding: '0.75rem', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FCD34D' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {p.photo ? (
                        <img src={`http://localhost:5000/uploads/${p.photo}`} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FCD34D', borderRadius: '4px' }}></div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Stock: {p.quantity}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', color: diffDays < 0 ? 'var(--danger)' : 'var(--warning)', textAlign: 'right' }}>
                      {diffDays < 0 ? `Expired ${Math.abs(diffDays)}d ago` : `${diffDays} days`}
                      <div style={{ fontSize: '0.7rem', fontWeight: 500 }}>{new Date(p.expiryDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
