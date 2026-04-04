import React from 'react';
import { format, parseISO } from 'date-fns';

export const getCategoryColor = (category) => {
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

const BookingConfirmationModal = ({ visible, onClose, onConfirm, session, loading = false }) => {
  console.log('BookingConfirmationModal rendered:', { visible, session, loading });
  
  if (!visible || !session) {
    console.log('BookingConfirmationModal: Not rendering - visible:', visible, 'session:', session);
    return null;
  }

  const startDate = parseISO(session.start_time);
  const endDate = parseISO(session.end_time);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-icon">📅</div>

        <h3>Confirm Booking?</h3>

        <div className="confirmation-details">
          <div className="detail-row">
            <span className="detail-label">Category</span>
            <span
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(session.category) }}
            >
              {session.category}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">{format(startDate, 'MMMM d, yyyy')}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Time</span>
            <span className="detail-value">
              {format(startDate, 'h:mm a')} ({duration} min)
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Trainer</span>
            <span className="detail-value trainer">{session.trainer_name}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <button 
            className="btn-cancel" 
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              console.log('Cancel clicked');
              onClose(); 
            }} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn-confirm" 
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              console.log('Confirm clicked, calling onConfirm');
              onConfirm(); 
            }} 
            disabled={loading}
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
