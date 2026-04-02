import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import './TrainerScheduleManagement.css';

function TrainerScheduleManagement() {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    startAMPM: 'AM',
    endTime: '',
    endAMPM: 'AM',
    category: 'General',
    sessionTitle: '',
    type: '1-on-1 Personal',
    maxParticipants: 1,
    recurringSession: false
  });

  const [schedules, setSchedules] = useState([
    {
      _id: '1',
      date: new Date(2026, 3, 2).toISOString(),
      startTime: '6:00 AM',
      endTime: '8:00 AM',
      duration: '120m',
      category: 'General',
      title: 'Session',
      type: 'Personal',
      bookings: '0/1'
    },
    {
      _id: '2',
      date: new Date(2026, 3, 3).toISOString(),
      startTime: '8:00 AM',
      endTime: '11:00 AM',
      duration: '180m',
      category: 'General',
      title: 'General Session',
      type: 'Personal',
      bookings: '1/1'
    }
  ]);

  const [clientBookings, setClientBookings] = useState([
    {
      _id: 'booking-1',
      clientName: 'Sarinthha Fernando',
      email: 'sarinthha@gmail.com',
      category: 'General',
      status: 'CONFIRMED',
      bookingId: '50/195320',
      date: new Date(2026, 3, 3),
      time: '8:00 AM'
    },
    {
      _id: 'booking-2',
      clientName: 'sehara hope',
      email: 'sehara@gmail.com',
      category: 'General',
      status: 'CONFIRMED',
      bookingId: '88/180C3',
      date: new Date(2026, 2, 31),
      time: '4:00 AM'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePublishTimeslot = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.sessionTitle) {
      alert('Please fill all required fields');
      return;
    }

    const newSchedule = {
      _id: `schedule-${Date.now()}`,
      date: new Date(formData.date).toISOString(),
      startTime: `${formData.startTime} ${formData.startAMPM}`,
      endTime: `${formData.endTime} ${formData.endAMPM}`,
      duration: '60m',
      category: formData.category,
      title: formData.sessionTitle,
      type: formData.type.includes('1-on-1') ? 'Personal' : 'Group',
      bookings: `0/${formData.maxParticipants}`
    };

    setSchedules((prev) => [...prev, newSchedule]);

    // Reset form
    setFormData({
      date: '',
      startTime: '',
      startAMPM: 'AM',
      endTime: '',
      endAMPM: 'AM',
      category: 'General',
      sessionTitle: '',
      type: '1-on-1 Personal',
      maxParticipants: 1,
      recurringSession: false
    });

    alert('✅ Timeslot published successfully!');
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    }
  };

  return (
    <div className="trainer-schedule-management">
      {/* Header */}
      <div className="trainer-workspace-header">
        <h1>TRAINER WORKSPACE</h1>
        <p>Manage Your Schedule & Clients</p>
      </div>

      {/* Create New Timeslot Section */}
      <div className="create-timeslot-section">
        <div className="section-header">
          <span className="calendar-icon">📅</span>
          <h2>CREATE NEW TIMESLOT</h2>
        </div>

        <form onSubmit={handlePublishTimeslot} className="timeslot-form">
          <div className="form-row">
            <div className="form-group">
              <label>*Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                placeholder="Select Date"
                required
              />
            </div>

            <div className="form-group">
              <label>*Start Time (AM/PM)</label>
              <div className="time-input-group">
                <input
                  type="text"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  placeholder="00:00"
                  required
                />
                <select
                  name="startAMPM"
                  value={formData.startAMPM}
                  onChange={handleInputChange}
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>*End Time (AM/PM)</label>
              <div className="time-input-group">
                <input
                  type="text"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  placeholder="00:00"
                  required
                />
                <select
                  name="endAMPM"
                  value={formData.endAMPM}
                  onChange={handleInputChange}
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>*Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option>General</option>
                <option>Strength Training</option>
                <option>Yoga</option>
                <option>Cardio</option>
                <option>HIIT</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Session Title</label>
              <input
                type="text"
                name="sessionTitle"
                value={formData.sessionTitle}
                onChange={handleInputChange}
                placeholder="e.g. Morning Blast"
                required
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option>1-on-1 Personal</option>
                <option>Group Class</option>
              </select>
            </div>

            <div className="form-group">
              <label>*Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="recurringSession"
                  checked={formData.recurringSession}
                  onChange={handleInputChange}
                />
                Recurring Session
              </label>
            </div>
          </div>

          <button type="submit" className="publish-btn">
            PUBLISH TIMESLOT
          </button>
        </form>
      </div>

      {/* My Schedules Section */}
      <div className="my-schedules-section">
        <div className="section-header">
          <span className="clock-icon">⏱️</span>
          <h2>MY SCHEDULES</h2>
        </div>

        <div className="schedules-table-wrapper">
          <table className="schedules-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TIME & DURATION</th>
                <th>CATEGORY & TITLE</th>
                <th>TYPE</th>
                <th>BOOKINGS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule._id}>
                  <td className="date-cell">
                    {format(parseISO(schedule.date), 'MMM d, yyyy')}
                  </td>
                  <td className="time-cell">
                    <span className="time-range">{schedule.startTime} - {schedule.endTime}</span>
                    <span className="duration">({schedule.duration})</span>
                  </td>
                  <td className="category-cell">
                    <div className="category-title">
                      <span className="category-label">{schedule.category}</span>
                      <span className="title">{schedule.title}</span>
                    </div>
                  </td>
                  <td className="type-cell">{schedule.type}</td>
                  <td className="bookings-cell">{schedule.bookings}</td>
                  <td className="actions-cell">
                    <button className="action-btn edit-btn">Edit</button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteSchedule(schedule._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Bookings Section */}
      <div className="client-bookings-section">
        <div className="section-header">
          <span className="users-icon">👥</span>
          <h2>CLIENT BOOKINGS</h2>
        </div>

        <div className="bookings-list">
          {clientBookings.map((booking) => (
            <div key={booking._id} className="booking-item">
              <div className="client-info">
                <h3>{booking.clientName}</h3>
                <p className="email">{booking.email}</p>
                <div className="booking-details">
                  <span className="category">{booking.category}</span>
                  <span className="booking-id">ID: {booking.bookingId}</span>
                </div>
                <p className="booking-time">
                  🗓️ {format(new Date(booking.date), 'MMM d, yyyy')} | {booking.time}
                </p>
              </div>
              <div className="booking-status">
                <span className="status-badge confirmed">{booking.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrainerScheduleManagement;
