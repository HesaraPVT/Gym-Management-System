import React from 'react';
import { format, parseISO } from 'date-fns';

const getCategoryColor = (category) => {
  const colors = {
    Yoga: '#9C27B0',
    Cardio: '#E63939',
    Strength: '#2196F3',
    HIIT: '#FF9800',
    Pilates: '#00BCD4',
    'Personal Training': '#E91E63',
    'Group Class': '#03A9F4',
    Mobility: '#4CAF50'
  };
  return colors[category] || '#666';
};

const OpenTrainingSlots = ({ slots, onTrainerClick, onBookClick }) => {
  if (slots.length === 0) {
    return (
      <div className="no-slots">
        <div className="no-slots-icon">📅</div>
        <p>No open slots match your criteria</p>
      </div>
    );
  }

  return (
    <div className="training-slots-grid">
      {slots.map((slot) => {
        const start = parseISO(slot.start_time);
        const end = parseISO(slot.end_time);
        const duration = Math.round((end.getTime() - start.getTime()) / 60000);
        const category = slot.session_category || 'General';
        const isFull = slot.spots_left <= 0;

        return (
          <div
            key={slot._id}
            className={`training-slot-card ${isFull ? 'full' : ''}`}
          >
            <div className="slot-header">
              <span className="category-badge" style={{ backgroundColor: getCategoryColor(category) }}>
                {category}
              </span>
              {slot.session_type === 'Group' && <span className="group-badge">Group</span>}
            </div>

            <h4 className="slot-title">{slot.session_title || `${category} Session`}</h4>

            <div className="trainer-info" onClick={() => onTrainerClick({ id: slot.trainer_id, name: slot.trainer_name, rating: slot.rating })}>
              <div className="trainer-avatar">👤</div>
              <span className="trainer-name">{slot.trainer_name}</span>
              <span className="trainer-rating">★ {slot.rating || 4.8}</span>
            </div>

            <div className="slot-datetime">
              <div className="date-box">
                <span className="month">{format(start, 'MMM')}</span>
                <span className="day">{format(start, 'd')}</span>
              </div>
              <div className="time-info">
                <p className="day-name">{format(start, 'EEEE')}</p>
                <p className="time-range">
                  {format(start, 'h:mm a')} • {duration} min
                </p>
              </div>
            </div>

            <div className="slot-footer">
              <div className="availability">
                <p className="availability-label">Availability</p>
                <p className={`availability-value ${isFull ? 'full' : 'available'}`}>
                  {isFull ? 'Sold Out' : `${slot.spots_left} spot${slot.spots_left !== 1 ? 's' : ''} left`}
                </p>
              </div>
              <button
                className={`book-btn ${isFull ? 'disabled' : ''}`}
                disabled={isFull}
                onClick={() => onBookClick(slot)}
              >
                View & Book
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OpenTrainingSlots;
