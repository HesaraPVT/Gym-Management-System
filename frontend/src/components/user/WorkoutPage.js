import React, { useState, useEffect } from 'react';
import './WorkoutPage.css';
import { useToast } from '../Toast';
import instructionImg from '../../images/instruction.jpeg';

function WorkoutPage({ workouts, setWorkouts }) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Load workouts from backend on mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5001/api/progress/workouts/${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWorkouts(data.workouts || []);
        }
      } catch (error) {
        console.error('Error loading workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, []);

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

      const workoutPayload = {
        exerciseName: formData.exercise,
        sets: parseInt(formData.sets),
        reps: parseInt(formData.reps),
        weight: parseFloat(formData.weight),
        date: formData.date
      };

      let response;

      if (editingId !== null) {
        // Update existing workout
        response = await fetch(`http://localhost:5001/api/progress/workouts/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(workoutPayload)
        });

        if (response.ok) {
          const data = await response.json();
          const updated = { ...data.workout, id: data.workout._id };
          setWorkouts(
            workouts.map((w) => w.id === editingId ? updated : w)
          );
          toast.success('Workout updated successfully');
          setEditingId(null);
        } else {
          const error = await response.json();
          toast.error('Error updating workout: ' + (error.message || error.detail));
          return;
        }
      } else {
        // Create new workout
        response = await fetch(`http://localhost:5001/api/progress/workouts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(workoutPayload)
        });

        if (response.ok) {
          const data = await response.json();
          const newWorkout = { ...data.workout, id: data.workout._id };
          setWorkouts([...workouts, newWorkout]);
          toast.success('Workout added successfully');
        } else {
          const error = await response.json();
          toast.error('Error saving workout: ' + (error.message || error.detail));
          return;
        }
      }

      setFormData({
        exercise: '',
        sets: '',
        reps: '',
        weight: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Error saving workout');
    }
  };

  const handleEdit = (workout) => {
    setFormData({
      exercise: workout.exerciseName,
      sets: workout.sets.toString(),
      reps: workout.reps.toString(),
      weight: workout.weight.toString(),
      date: workout.date,
    });
    setEditingId(workout._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        toast.error('User not found');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/progress/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setWorkouts(workouts.filter((w) => w._id !== id));
        toast.success('Workout deleted successfully');
      } else {
        const error = await response.json();
        toast.error('Error deleting workout: ' + (error.message || error.detail));
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Error deleting workout');
    }
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
    return <div className="workout-page"><p>Loading...</p></div>;
  }

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
              <div className="workout-card" key={w._id}>
                <div className="workout-card-data">
                  <p className="workout-card-exercise">{w.exerciseName}</p>
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
                    onClick={() => handleDelete(w._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}}
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
                  minLength="1"
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
                  min="1"
                  max="500"
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
