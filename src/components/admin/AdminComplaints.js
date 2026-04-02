import React, { useState, useEffect } from 'react';
import './AdminComplaints.css';

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [searchTerm, setSearchTerm] = useState('');

  const [editForm, setEditForm] = useState({
    status: '',
    assignedTo: '',
    priority: '',
    notes: ''
  });

  const categories = ['Membership', 'Billing', 'Trainer', 'Facility', 'Equipment', 'Cleanliness', 'Technical', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const statuses = ['Open', 'Acknowledged', 'In Progress', 'Awaiting Customer', 'Resolved', 'Closed', 'Escalated', 'Rejected'];
  const adminUsers = ['Admin 1', 'Admin 2', 'Admin 3', 'Admin 4'];

  useEffect(() => {
    const savedComplaints = JSON.parse(localStorage.getItem('userComplaints')) || [];
    setComplaints(savedComplaints);
  }, []);

  const handleViewDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setEditForm({
      status: complaint.status,
      assignedTo: complaint.assignedTo,
      priority: complaint.priority,
      notes: ''
    });
    setShowDetailModal(true);
  };

  const handleUpdateComplaint = () => {
    const updatedComplaints = complaints.map(c =>
      c.id === selectedComplaint.id
        ? {
            ...c,
            status: editForm.status,
            assignedTo: editForm.assignedTo,
            priority: editForm.priority
          }
        : c
    );

    setComplaints(updatedComplaints);
    localStorage.setItem('userComplaints', JSON.stringify(updatedComplaints));

    alert('Complaint updated successfully!');
    closeDetailModal();
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedComplaint(null);
    setEditForm({
      status: '',
      assignedTo: '',
      priority: '',
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': '#ff6b6b',
      'Acknowledged': '#ffd93d',
      'In Progress': '#6bcf7f',
      'Awaiting Customer': '#4d96ff',
      'Resolved': '#4d96ff',
      'Closed': '#95a3a6',
      'Escalated': '#e67e22',
      'Rejected': '#c0392b'
    };
    return colors[status] || '#95a3a6';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#27ae60',
      'Medium': '#f39c12',
      'High': '#e74c3c',
      'Urgent': '#c0392b'
    };
    return colors[priority] || '#95a3a6';
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filterStatus === 'All Statuses' || complaint.status === filterStatus;
    const matchesCategory = filterCategory === 'All Categories' || complaint.category === filterCategory;
    const matchesPriority = filterPriority === 'All Priorities' || complaint.priority === filterPriority;
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  const getComplaintStats = () => {
    return {
      total: complaints.length,
      open: complaints.filter(c => c.status === 'Open').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      urgent: complaints.filter(c => c.priority === 'Urgent').length
    };
  };

  const stats = getComplaintStats();

  return (
    <div className="admin-complaints">
      <div className="admin-header">
        <h1>Support & <span>Complaints</span></h1>
        <p>Manage and track all gym member complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card open">
          <div className="stat-number">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-number">{stats.urgent}</div>
          <div className="stat-label">Urgent</div>
        </div>
      </div>

      {/* Filters */}
      <div className="complaints-header-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search complaints by ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-section">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option>All Statuses</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option>All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option>All Priorities</option>
          {priorities.map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredComplaints.length === 0 ? (
        <div className="no-complaints">
          <p>No complaints found.</p>
        </div>
      ) : (
        <div className="complaints-table-wrapper">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>SUBMITTED</th>
                <th>ASSIGNED TO</th>
                <th>DUE DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td className="id-cell">{complaint.id}</td>
                  <td className="title-cell">{complaint.title}</td>
                  <td className="category-cell">{complaint.category}</td>
                  <td className="priority-cell">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                    >
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td className="date-cell">{complaint.submittedDate}</td>
                  <td className="assigned-cell">{complaint.assignedTo}</td>
                  <td className="due-date-cell">{complaint.dueDate}</td>
                  <td className="action-cell">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDetail(complaint)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetailModal}>×</button>
            
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <p>{selectedComplaint.id}</p>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3>Complaint Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{selectedComplaint.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedComplaint.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value full-width">{selectedComplaint.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submitted Date:</span>
                  <span className="detail-value">{selectedComplaint.submittedDate}</span>
                </div>
                {selectedComplaint.attachment && (
                  <div className="detail-row">
                    <span className="detail-label">Attachment:</span>
                    <span className="detail-value">{selectedComplaint.attachment}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Management</h3>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="form-select"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority *</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="form-select"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    className="form-select"
                  >
                    <option value="Not Assigned">Not Assigned</option>
                    {adminUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Internal Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="form-textarea"
                    placeholder="Add internal notes..."
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={closeDetailModal}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="update-btn"
                onClick={handleUpdateComplaint}
              >
                Update Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplaints;
