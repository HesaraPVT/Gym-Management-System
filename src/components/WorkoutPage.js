import React, { useState } from 'react';
import './WorkoutPage.css';
import instructionImg from '../images/instruction.jpeg';

function WorkoutPage({ workouts, setWorkouts }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId !== null) {
      setWorkouts(
        workouts.map((w) =>
          w.id === editingId ? { ...w, ...formData } : w
        )
      );
      setEditingId(null);
    } else {
      const newWorkout = {
        id: Date.now(),
        ...formData,
      };
      setWorkouts([...workouts, newWorkout]);
    }
    setFormData({
      exercise: '',
      sets: '',
      reps: '',
      weight: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const handleEdit = (workout) => {
    setFormData({
      exercise: workout.exercise,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight,
      date: workout.date,
    });
    setEditingId(workout.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      exercise: '',
      sets: '',
      reps: '',
      weight: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="workout-page">
      {/* Workout Header */}
      <div className="workout-header">
        <button
          className="start-workout-btn"
          onClick={() => setShowForm(true)}
        >
          Start New Workout
        </button>
      </div>

      {/* Instruction or Workout History */}
      {workouts.length === 0 ? (
        <div className="instruction-section">
          <img
            src={instructionImg}
            alt="Start your workout"
            className="instruction-image"
          />
          <p className="instruction-text">
            Start a new workout to see your workout history! Log your exercises,
            sets, reps, and weights to keep track of your training progress. Stay
            consistent and watch your strength grow over time.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="workout-history-title">Workout History</h2>
          <div className="workout-history-list">
            {[...workouts].reverse().map((w) => (
              <div className="workout-card" key={w.id}>
                <div className="workout-card-data">
                  <p className="workout-card-exercise">{w.exercise}</p>
                  <p className="workout-card-details">
                    {w.sets} sets × {w.reps} reps @ {w.weight} kg
                  </p>
                  <p className="workout-card-date">{formatDate(w.date)}</p>
                </div>
                <div className="workout-card-actions">
                  <button className="edit-btn" onClick={() => handleEdit(w)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(w.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workout Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId !== null ? 'Edit Workout' : 'New Workout'}
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
                <label className="form-label">Exercise</label>
                <input
                  type="text"
                  name="exercise"
                  className="form-input"
                  placeholder="e.g. Bench Press"
                  value={formData.exercise}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sets</label>
                <input
                  type="number"
                  name="sets"
                  className="form-input"
                  placeholder="e.g. 4"
                  value={formData.sets}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reps</label>
                <input
                  type="number"
                  name="reps"
                  className="form-input"
                  placeholder="e.g. 8"
                  value={formData.reps}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  className="form-input"
                  placeholder="e.g. 100"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.5"
                  required
                />
              </div>
              <button type="submit" className="form-submit-btn">
                {editingId !== null ? 'Update Workout' : 'Save Workout'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutPage;
