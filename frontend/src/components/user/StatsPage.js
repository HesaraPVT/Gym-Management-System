import React, { useState, useEffect } from 'react';
import './StatsPage.css';
import { useToast } from '../Toast';
import instructionImg from '../../images/instruction.jpeg';
import { calculateBodyFat, calculateBMI, getBodyFatCategory } from '../../utils/bodyFatCalculator';

function StatsPage({ measurements, setMeasurements }) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    chest: '',
    waist: '',
    arms: '',
    legs: '',
    shoulders: '',
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

        const response = await fetch(`http://localhost:5001/api/progress/measurements/${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMeasurements(data.measurements || []);
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

      // Validate required fields
      if (!formData.weight || !formData.height || !formData.waist) {
        toast.error('Weight, height, and waist measurements are required for body fat calculation');
        return;
      }

      // Calculate body fat percentage
      const bodyFatPercentage = calculateBodyFat({
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        chest: parseFloat(formData.chest) || 0,
        waist: parseFloat(formData.waist),
        arms: parseFloat(formData.arms) || 0,
        legs: parseFloat(formData.legs) || 0,
        shoulders: parseFloat(formData.shoulders) || 0,
      }, userData.gender || 'male');

      // Calculate BMI
      const bmi = calculateBMI(parseFloat(formData.weight), parseFloat(formData.height));

      // Calculate muscle mass (estimated from lean body mass)
      const leanMass = parseFloat(formData.weight) * (1 - bodyFatPercentage / 100);
      const calculatedMuscleMass = Math.round(leanMass * 0.95 * 10) / 10; // Estimated muscle mass from lean mass

      const measurementPayload = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        chest: parseFloat(formData.chest) || null,
        waist: parseFloat(formData.waist),
        arms: parseFloat(formData.arms) || null,
        legs: parseFloat(formData.legs) || null,
        shoulders: parseFloat(formData.shoulders) || null,
        bodyFatPercentage: bodyFatPercentage,
        muscleMass: calculatedMuscleMass,
        bmi: bmi,
        date: formData.date
      };

      let response;
      
      if (editingId !== null) {
        // Update existing measurement
        response = await fetch(`http://localhost:5001/api/progress/measurements/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(measurementPayload)
        });

        if (response.ok) {
          const data = await response.json();
          const updated = { ...data.measurement, id: data.measurement._id };
          setMeasurements(
            measurements.map((m) => m.id === editingId ? updated : m)
          );
          toast.success('Measurement updated successfully');
          setEditingId(null);
        } else {
          const error = await response.json();
          toast.error('Error updating measurement: ' + (error.message || error.detail));
          return;
        }
      } else {
        // Check if a measurement already exists for this date
        const measurementExists = measurements.some(m => {
          const existingDate = typeof m.date === 'string' ? m.date.split('T')[0] : new Date(m.date).toISOString().split('T')[0];
          return existingDate === formData.date;
        });
        if (measurementExists) {
          toast.error('A measurement already exists for this date. Please edit the existing one or choose a different date.');
          return;
        }

        // Create new measurement
        console.log('📤 Sending measurement to backend:', measurementPayload);
        
        response = await fetch(`http://localhost:5001/api/progress/measurements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(measurementPayload)
        });

        console.log('📥 Backend response status:', response.status);
        const data = await response.json();
        console.log('📥 Backend response:', data);

        if (response.ok) {
          const newMeasurement = { ...data.measurement, id: data.measurement._id };
          setMeasurements([...measurements, newMeasurement]);
          toast.success('Measurement added successfully');
        } else {
          const error = await response.json();
          toast.error('Error saving measurement: ' + (error.message || error.detail));
          return;
        }
      }

      setFormData({
        weight: '',
        height: '',
        chest: '',
        waist: '',
        arms: '',
        legs: '',
        shoulders: '',
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
      height: measurement.height,
      chest: measurement.chest || '',
      waist: measurement.waist || '',
      arms: measurement.arms || '',
      legs: measurement.legs || '',
      shoulders: measurement.shoulders || '',
      date: measurement.date,
    });
    setEditingId(measurement._id);
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

      const response = await fetch(`http://localhost:5001/api/progress/measurements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMeasurements(measurements.filter((m) => m._id !== id));
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
      height: '',
      chest: '',
      waist: '',
      arms: '',
      legs: '',
      shoulders: '',
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
                {latestMeasurement ? latestMeasurement.bodyFatPercentage : '--'}
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
              <div className="stat-card-label">BMI</div>
              <div className="stat-card-value">
                {latestMeasurement ? latestMeasurement.bmi : '--'}
              </div>
              <div className="stat-card-unit"></div>
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
                  <div className="measurement-card" key={m._id}>
                    <div className="measurement-card-data">
                      <p>
                        <span>Weight:</span> {m.weight} kg
                      </p>
                      <p>
                        <span>Height:</span> {m.height} cm
                      </p>
                      <p>
                        <span>Waist:</span> {m.waist} cm
                      </p>
                      {m.chest && <p><span>Chest:</span> {m.chest} cm</p>}
                      {m.arms && <p><span>Arms:</span> {m.arms} cm</p>}
                      {m.legs && <p><span>Legs:</span> {m.legs} cm</p>}
                      {m.shoulders && <p><span>Shoulders:</span> {m.shoulders} cm</p>}
                      <p>
                        <span>Body Fat:</span> {m.bodyFatPercentage} % <span style={{fontSize: '0.8em', color: '#999'}}>(calculated)</span>
                      </p>
                      <p><span>Muscle Mass:</span> {m.muscleMass} kg <span style={{fontSize: '0.8em', color: '#999'}}>(calculated)</span></p>
                      {m.bmi && <p><span>BMI:</span> {m.bmi}</p>}
                      <p className="measurement-card-date">{formatDate(m.date)}</p>
                    </div>
                    <div className="measurement-card-actions">
                      <button className="edit-btn" onClick={() => handleEdit(m)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(m._id)}
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
              <div className="form-group">
                <label className="form-label">Waist (cm)</label>
                <input
                  type="number"
                  name="waist"
                  className="form-input"
                  placeholder="e.g. 80"
                  value={formData.waist}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Chest (cm)</label>
                <input
                  type="number"
                  name="chest"
                  className="form-input"
                  placeholder="e.g. 100"
                  value={formData.chest}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Arms (cm)</label>
                <input
                  type="number"
                  name="arms"
                  className="form-input"
                  placeholder="e.g. 32"
                  value={formData.arms}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Legs (cm)</label>
                <input
                  type="number"
                  name="legs"
                  className="form-input"
                  placeholder="e.g. 58"
                  value={formData.legs}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Shoulders (cm)</label>
                <input
                  type="number"
                  name="shoulders"
                  className="form-input"
                  placeholder="e.g. 120"
                  value={formData.shoulders}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <p className="form-info" style={{fontSize: '0.85em', color: '#666', margin: '10px 0', fontStyle: 'italic'}}>
                Body fat percentage and muscle mass are automatically calculated from your measurements
              </p>
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
