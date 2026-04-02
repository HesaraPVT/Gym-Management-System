import React, { useMemo, useState } from 'react';
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

const ScheduleCalendar = ({ slots, onTrainerClick, onBookClick }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped = {};
    slots.forEach((slot) => {
      const dateStr = format(parseISO(slot.start_time), 'yyyy-MM-dd');
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(slot);
    });
    return grouped;
  }, [slots]);

  // Generate calendar grid (simplified version)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (slotsByDate[format(date, 'yyyy-MM-dd')]?.length > 0) {
      setShowDetails(true);
    }
  };

  const selectedSlots = selectedDate ? slotsByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

  return (
    <div className="schedule-calendar">
      <div className="calendar-container">
        <div className="calendar-header">
          <h3>{format(firstDay, 'MMMM yyyy')}</h3>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((date, idx) => {
            const dateStr = date ? format(date, 'yyyy-MM-dd') : null;
            const daySlots = dateStr ? slotsByDate[dateStr] || [] : [];
            const isSelected = selectedDate && dateStr === format(selectedDate, 'yyyy-MM-dd');

            return (
              <div
                key={idx}
                className={`calendar-day ${!date ? 'empty' : ''} ${daySlots.length > 0 ? 'has-slots' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => date && handleDateClick(date)}
              >
                {date && <span className="day-number">{date.getDate()}</span>}
                {daySlots.length > 0 && (
                  <div className="day-indicator">
                    {daySlots.slice(0, 2).map((slot, i) => (
                      <div
                        key={i}
                        className="slot-dot"
                        style={{ backgroundColor: getCategoryColor(slot.session_category || 'General') }}
                        title={slot.session_title}
                      />
                    ))}
                    {daySlots.length > 2 && <span className="more-indicator">+{daySlots.length - 2}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && selectedSlots.length > 0 && (
        <div className="calendar-details">
          <div className="details-header">
            <h3>Sessions for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</h3>
            <button className="close-btn" onClick={() => setShowDetails(false)}>
              ✕
            </button>
          </div>

          <div className="details-list">
            {selectedSlots.map((slot) => {
              const start = parseISO(slot.start_time);
              const end = parseISO(slot.end_time);
              const duration = Math.round((end.getTime() - start.getTime()) / 60000);
              const isFull = slot.spots_left <= 0;

              return (
                <div key={slot._id} className="detail-item">
                  <div className="detail-header">
                    <span className="category" style={{ backgroundColor: getCategoryColor(slot.session_category || 'General') }}>
                      {slot.session_category || 'General'}
                    </span>
                    <span className={`spots ${isFull ? 'full' : 'available'}`}>
                      {isFull ? 'Sold Out' : `${slot.spots_left} spots`}
                    </span>
                  </div>

                  <h4>{slot.session_title || `${slot.session_category || 'General'} Session`}</h4>

                  <div className="detail-time">
                    <span>⏱ {format(start, 'h:mm a')} - {format(end, 'h:mm a')} ({duration} min)</span>
                  </div>

                  <div className="detail-trainer">
                    <span
                      className="trainer-link"
                      onClick={() => {
                        onTrainerClick({
                          id: slot.trainer_id,
                          name: slot.trainer_name,
                          experience_years: 5,
                          training_id: 'TRN-10029',
                          achievements: ['Certified Personal Trainer'],
                          rating: 4.8,
                          review_count: 42
                        });
                      }}
                    >
                      👤 {slot.trainer_name}
                    </span>
                  </div>

                  <button
                    className={`detail-book-btn ${isFull ? 'disabled' : ''}`}
                    disabled={isFull}
                    onClick={() => onBookClick(slot)}
                  >
                    View & Book
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
