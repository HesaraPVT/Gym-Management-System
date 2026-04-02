import React, { useState, useEffect } from 'react';
import './UserComplaints.css';

function UserComplaints() {
  const [activeTab, setActiveTab] = useState('my-complaints');
  const [complaints, setComplaints] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    description: '',
    attachment: null
  });

  const categories = ['Membership', 'Billing', 'Trainer', 'Facility', 'Equipment', 'Cleanliness', 'Technical', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const statuses = ['Open', 'Acknowledged', 'In Progress', 'Awaiting Customer', 'Resolved', 'Closed', 'Rejected'];

  useEffect(() => {
    const savedComplaints = JSON.parse(localStorage.getItem('userComplaints')) || [];
    setComplaints(savedComplaints);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmitComplaint = () => {
    if (!formData.title || !formData.category || !formData.description) {
      alert('Please fill all required fields');
      return;
    }

    const newComplaint = {
      id: `COMP-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      priority: formData.priority,
      description: formData.description,
      attachment: formData.attachment ? formData.attachment.name : null,
      status: 'Open',
      submittedDate: new Date().toLocaleDateString(),
      assignedTo: 'Not Assigned',
      dueDate: '-'
    };

    const updatedComplaints = [...complaints, newComplaint];
    setComplaints(updatedComplaints);
    localStorage.setItem('userComplaints', JSON.stringify(updatedComplaints));

    alert('Complaint submitted successfully!');
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      priority: 'Medium',
      description: '',
      attachment: null
    });
    setShowSubmitModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': '#ff6b6b',
      'Acknowledged': '#ffd93d',
      'In Progress': '#6bcf7f',
      'Awaiting Customer': '#4d96ff',
      'Resolved': '#4d96ff',
      'Closed': '#95a3a6',
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

  return (
    <div className="user-complaints">
      <div className="complaints-header">
        <h1>Support & <span>Complaints</span></h1>
        <p>Track and manage your gym-related complaints</p>
      </div>

      {activeTab === 'my-complaints' && (
        <div className="complaints-container">
          <div className="complaints-top">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="new-complaint-btn"
              onClick={() => setShowSubmitModal(true)}
            >
              + New Complaint
            </button>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal submit-complaint-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => resetForm()}>×</button>
            
            <div className="modal-header">
              <h2>Submit New Complaint</h2>
            </div>

            <form className="complaint-form">
              <div className="form-section">
                <h3>Complaint Details</h3>

                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Brief summary of your complaint"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select a category...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    placeholder="Please describe your complaint in detail..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label>Attachment (optional)</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      name="attachment"
                      onChange={handleInputChange}
                      id="complaint-attachment"
                    />
                    <label htmlFor="complaint-attachment" className="file-label">
                      Choose File
                    </label>
                    {formData.attachment && (
                      <span className="file-selected">✓ {formData.attachment.name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => resetForm()}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="submit-btn"
                  onClick={handleSubmitComplaint}
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserComplaints;
