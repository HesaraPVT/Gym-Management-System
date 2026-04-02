import React, { useState, useEffect } from 'react';
import './StatsPage.css';
import { useToast } from '../Toast';
import instructionImg from '../../images/instruction.jpeg';

function StatsPage({ measurements, setMeasurements }) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    height: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Load measurements from backend on mount
  useEffect(() => {
    const loadMeasurements = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/users/${userData.id}/measurements`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMeasurements(data);
        }
      } catch (error) {
        console.error('Error loading measurements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeasurements();
  }, []);

  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        toast.error('User not found');
        return;
      }

      const measurementPayload = {
        weight: parseFloat(formData.weight),
        bodyFat: parseFloat(formData.bodyFat),
        muscleMass: parseFloat(formData.muscleMass),
        height: parseFloat(formData.height),
        date: formData.date
      };

      let response;
      
      if (editingId !== null) {
        // Update existing measurement
        response = await fetch(`http://localhost:5000/api/users/${userData.id}/measurements/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(measurementPayload)
        });

        if (response.ok) {
          const updated = await response.json();
          setMeasurements(
            measurements.map((m) => m.id === editingId ? updated : m)
          );
          toast.success('Measurement updated successfully');
          setEditingId(null);
        } else {
          const error = await response.json();
          toast.error('Error updating measurement: ' + error.detail);
          return;
        }
      } else {
        // Create new measurement
        response = await fetch(`http://localhost:5000/api/users/${userData.id}/measurements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(measurementPayload)
        });

        if (response.ok) {
          const newMeasurement = await response.json();
          setMeasurements([...measurements, newMeasurement]);
          toast.success('Measurement added successfully');
        } else {
          const error = await response.json();
          toast.error('Error saving measurement: ' + error.detail);
          return;
        }
      }

      setFormData({
        weight: '',
        bodyFat: '',
        muscleMass: '',
        height: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast.error('Error saving measurement');
    }
  };

  const handleEdit = (measurement) => {
    setFormData({
      weight: measurement.weight,
      bodyFat: measurement.bodyFat,
      muscleMass: measurement.muscleMass,
      height: measurement.height,
      date: measurement.date,
    });
    setEditingId(measurement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) return;
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        toast.error('User not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userData.id}/measurements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMeasurements(measurements.filter((m) => m.id !== id));
        toast.success('Measurement deleted successfully');
      } else {
        const error = await response.json();
        toast.error('Error deleting measurement: ' + error.detail);
      }
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast.error('Error deleting measurement');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      weight: '',
      bodyFat: '',
      muscleMass: '',
      height: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const formatDate = (dateStr) => {
    let d;
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      d = new Date(dateStr);
    } else if (typeof dateStr === 'string') {
      d = new Date(dateStr + 'T00:00:00');
    } else {
      d = new Date(dateStr);
    }
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div className="stats-page"><p>Loading...</p></div>;
  }

  return (
    <div className="stats-page">
      {/* Stats Header */}
      <div className="stats-header">
        <h1 className="stats-title">Body Stats</h1>
        <button
          className="new-measurement-btn"
          onClick={() => setShowForm(true)}
        >
          New Measurement
        </button>
      </div>

          {/* Stat Cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-label">Weight</div>
              <div className="stat-card-value">
                {latestMeasurement ? latestMeasurement.weight : '--'}
              </div>
              <div className="stat-card-unit">kg</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Body Fat</div>
              <div className="stat-card-value">
                {latestMeasurement ? latestMeasurement.bodyFat : '--'}
              </div>
              <div className="stat-card-unit">%</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Muscle Mass</div>
              <div className="stat-card-value">
                {latestMeasurement ? latestMeasurement.muscleMass : '--'}
              </div>
              <div className="stat-card-unit">kg</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Height</div>
              <div className="stat-card-value">
                {latestMeasurement ? latestMeasurement.height : '--'}
              </div>
              <div className="stat-card-unit">cm</div>
            </div>
          </div>

          {/* Instruction or Measurement History */}
          {measurements.length === 0 ? (
            <div className="instruction-section">
              <img
                src={instructionImg}
                alt="How to track your stats"
                className="instruction-image"
              />
              <p className="instruction-text">
                Welcome to your Body Stats tracker! Here you can record and monitor
                your fitness progress over time. Tap <strong>"New Measurement"</strong> to
                log your weight, body fat percentage, muscle mass, and height. Each
                entry is saved with the date so you can track how your body is
                changing. Review your measurement history below to stay motivated
                and make informed decisions about your training and nutrition.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="measurement-history-title">Measurement History</h2>
              <div className="measurement-history-list">
                {[...measurements].reverse().map((m) => (
                  <div className="measurement-card" key={m.id}>
                    <div className="measurement-card-data">
                      <p>
                        <span>Weight:</span> {m.weight} kg
                      </p>
                      <p>
                        <span>Muscle Mass:</span> {m.muscleMass} kg
                      </p>
                      <p>
                        <span>Body Fat:</span> {m.bodyFat} %
                      </p>
                      <p>
                        <span>Height:</span> {m.height} cm
                      </p>
                      <p className="measurement-card-date">{formatDate(m.date)}</p>
                    </div>
                    <div className="measurement-card-actions">
                      <button className="edit-btn" onClick={() => handleEdit(m)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(m.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      {/* Measurement Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId !== null ? 'Edit Measurement' : 'New Measurement'}
              </h2>
              <button className="modal-close" onClick={handleCloseForm}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  className="form-input"
                  placeholder="e.g. 75"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Body Fat (%)</label>
                <input
                  type="number"
                  name="bodyFat"
                  className="form-input"
                  placeholder="e.g. 18"
                  value={formData.bodyFat}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Muscle Mass (kg)</label>
                <input
                  type="number"
                  name="muscleMass"
                  className="form-input"
                  placeholder="e.g. 65"
                  value={formData.muscleMass}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  className="form-input"
                  placeholder="e.g. 175"
                  value={formData.height}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
              <button type="submit" className="form-submit-btn">
                {editingId !== null ? 'Update Measurement' : 'Save Measurement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPage;
