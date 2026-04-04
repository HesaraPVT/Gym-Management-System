import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './TrainerScheduleManagement.css';
import ChatBox from '../common/ChatBox';

const API_BASE = 'http://localhost:5000/api';

function TrainerScheduleManagement() {
  const [formData, setFormData] = useState({
    date: '',
    startHour: '5',
    startMinute: '00',
    startAMPM: 'AM',
    endHour: '6',
    endMinute: '00',
    endAMPM: 'AM',
    category: 'General',
    sessionTitle: '',
    type: '1-on-1 Personal',
    maxParticipants: 1,
    recurringSession: false,
    recurringFrequency: 'daily',
    recurringDuration: '4'
  });

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [clientBookings, setClientBookings] = useState([]);

  // Chat state
  const [chatUser, setChatUser] = useState(null);
  const [chatScheduleId, setChatScheduleId] = useState(null);

  const todayDate = new Date().toISOString().split('T')[0];
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = ['00', '15', '30', '45'];

  const parseTimeValue = (dateStr, hourStr, minuteStr, period) => {
    let hours = Number(hourStr);
    const minutes = Number(minuteStr || '0');

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const isConflict = (newStart, newEnd, excludeId = null) => {
    return schedules.some((schedule) => {
      if (excludeId && schedule._id === excludeId) return false;
      const existingStart = new Date(schedule.startTime);
      const existingEnd = new Date(schedule.endTime);
      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Fetch trainer's schedules from database
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const trainerId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        
        if (!trainerId) {
          console.error('Trainer ID not found');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/schedule/trainer/${trainerId}`, {
          headers: getAuthHeaders()
        });
        
        const data = await res.json();
        
        if (data.success && data.schedules) {
          setSchedules(data.schedules);
        } else {
          setSchedules([]);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Fetch client bookings (enrolled members in trainer's sessions)
  useEffect(() => {
    const fetchClientBookings = async () => {
      try {
        const trainerId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        
        if (!trainerId) return;

        // Get all schedules for this trainer with enrolled members
        const res = await fetch(`${API_BASE}/schedule/trainer/${trainerId}`, {
          headers: getAuthHeaders()
        });
        
        const data = await res.json();
        
        if (data.success && data.schedules) {
          // Extract all enrolled members from all schedules
          const bookings = [];
          data.schedules.forEach(schedule => {
            if (schedule.enrolledMembers && schedule.enrolledMembers.length > 0) {
              schedule.enrolledMembers.forEach(member => {
                bookings.push({
                  _id: `${schedule._id}-${member._id}`,
                  clientName: member.name,
                  email: member.email,
                  category: schedule.sessionType,
                  status: 'CONFIRMED',
                  bookingId: `${schedule._id.slice(-6)}/${member._id.slice(-6)}`,
                  date: new Date(schedule.startTime),
                  time: new Date(schedule.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }),
                  scheduleId: schedule._id,
                  memberId: member._id
                });
              });
            }
          });
          setClientBookings(bookings);
        }
      } catch (error) {
        console.error('Error fetching client bookings:', error);
      }
    };

    fetchClientBookings();
  }, [schedules]); // Re-fetch when schedules change

  const handleOpenChat = (booking) => {
    setChatUser({
      _id: booking.memberId,
      name: booking.clientName,
      email: booking.email,
      role: 'user'
    });
    setChatScheduleId(booking.scheduleId);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePublishTimeslot = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startHour || !formData.startMinute || !formData.endHour || !formData.endMinute || !formData.sessionTitle) {
      alert('Please fill all required fields');
      return;
    }

    const start = parseTimeValue(formData.date, formData.startHour, formData.startMinute, formData.startAMPM);
    const end = parseTimeValue(formData.date, formData.endHour, formData.endMinute, formData.endAMPM);
    const now = new Date();

    if (start <= now) {
      alert('Please choose a future date and time. Past slots are not allowed.');
      return;
    }

    if (end <= start) {
      alert('End time must be after the start time.');
      return;
    }

    if (isConflict(start, end)) {
      alert('This time slot conflicts with an existing schedule. Please choose another time.');
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        title: formData.sessionTitle,
        description: `${formData.category} session`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        sessionType: formData.type.includes('1-on-1') ? 'One-on-One' : 'Group Class',
        maxParticipants: parseInt(formData.maxParticipants, 10),
        location: 'Gym',
        isRecurring: formData.recurringSession,
        recurringFrequency: formData.recurringSession ? formData.recurringFrequency : null,
        recurringDuration: formData.recurringSession ? parseInt(formData.recurringDuration, 10) : null
      };

      const res = await fetch(`${API_BASE}/schedule`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create schedule');
      }

      if (Array.isArray(data.schedules)) {
        setSchedules((prev) => [
          ...prev,
          ...data.schedules.map(s => ({ ...s, enrolledMembers: s.enrolledMembers || [] }))
        ]);
      } else {
        setSchedules((prev) => [
          ...prev,
          {
            ...data.schedule,
            enrolledMembers: data.schedule.enrolledMembers || []
          }
        ]);
      }

      const count = Array.isArray(data.schedules) ? data.schedules.length : 1;
      const message = formData.recurringSession 
        ? `✅ ${count} recurring session(s) created! Users can now see and book these sessions.`
        : '✅ Timeslot published successfully! Users can now see and book this session.';

      setFormData({
        date: '',
        startHour: '5',
        startMinute: '00',
        startAMPM: 'AM',
        endHour: '6',
        endMinute: '00',
        endAMPM: 'AM',
        category: 'General',
        sessionTitle: '',
        type: '1-on-1 Personal',
        maxParticipants: 1,
        recurringSession: false,
        recurringFrequency: 'daily',
        recurringDuration: '4'
      });

      alert(message);
    } catch (error) {
      console.error('Error publishing timeslot:', error);
      alert('❌ Error creating session: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/schedule/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete schedule');
      }

      setSchedules((prev) => prev.filter((s) => s._id !== id));
      alert('✅ Schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('❌ Error deleting schedule: ' + error.message);
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    // Pre-fill the form with existing schedule data
    const startDate = new Date(schedule.startTime);
    const endDate = new Date(schedule.endTime);
    
    setFormData({
      date: startDate.toISOString().split('T')[0],
      startHour: startDate.getHours() % 12 === 0 ? '12' : String(startDate.getHours() % 12),
      startMinute: String(startDate.getMinutes()).padStart(2, '0'),
      startAMPM: startDate.getHours() >= 12 ? 'PM' : 'AM',
      endHour: endDate.getHours() % 12 === 0 ? '12' : String(endDate.getHours() % 12),
      endMinute: String(endDate.getMinutes()).padStart(2, '0'),
      endAMPM: endDate.getHours() >= 12 ? 'PM' : 'AM',
      category: schedule.sessionType || 'General',
      sessionTitle: schedule.title,
      type: schedule.maxParticipants > 1 ? 'Group Class' : '1-on-1 Personal',
      maxParticipants: schedule.maxParticipants,
      recurringSession: false,
      recurringFrequency: 'daily',
      recurringDuration: '4'
    });
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    
    if (!editingSchedule) return;

    if (!formData.date || !formData.startHour || !formData.startMinute || !formData.endHour || !formData.endMinute || !formData.sessionTitle) {
      alert('Please fill all required fields');
      return;
    }

    const start = parseTimeValue(formData.date, formData.startHour, formData.startMinute, formData.startAMPM);
    const end = parseTimeValue(formData.date, formData.endHour, formData.endMinute, formData.endAMPM);

    if (start < new Date()) {
      alert('Please choose a future date and time. Past slots are not allowed.');
      return;
    }

    if (end <= start) {
      alert('End time must be after the start time.');
      return;
    }

    if (isConflict(start, end, editingSchedule._id)) {
      alert('This updated time slot conflicts with another existing schedule. Please choose another time.');
      return;
    }

    try {
      setIsPublishing(true);

      const payload = {
        title: formData.sessionTitle,
        description: `${formData.category} session`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        sessionType: formData.type.includes('1-on-1') ? 'One-on-One' : 'Group Class',
        maxParticipants: parseInt(formData.maxParticipants, 10),
        location: 'Gym'
      };

      const res = await fetch(`${API_BASE}/schedule/${editingSchedule._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update schedule');
      }

      setSchedules((prev) => prev.map((s) => 
        s._id === editingSchedule._id ? { ...s, ...data.schedule } : s
      ));

      setEditingSchedule(null);
      setFormData({
        date: '',
        startHour: '5',
        startMinute: '00',
        startAMPM: 'AM',
        endHour: '6',
        endMinute: '00',
        endAMPM: 'AM',
        category: 'General',
        sessionTitle: '',
        type: '1-on-1 Personal',
        maxParticipants: 1,
        recurringSession: false,
        recurringFrequency: 'daily',
        recurringDuration: '4'
      });

      alert('✅ Schedule updated successfully!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('❌ Error updating schedule: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setFormData({
      date: '',
      startHour: '5',
      startMinute: '00',
      startAMPM: 'AM',
      endHour: '6',
      endMinute: '00',
      endAMPM: 'AM',
      category: 'General',
      sessionTitle: '',
      type: '1-on-1 Personal',
      maxParticipants: 1,
      recurringSession: false,
      recurringFrequency: 'daily',
      recurringDuration: '4'
    });
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

        <form onSubmit={editingSchedule ? handleUpdateSchedule : handlePublishTimeslot} className="timeslot-form">
          <div className="form-row">
            <div className="form-group">
              <label>*Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={todayDate}
                required
              />
            </div>

            <div className="form-group">
              <label>*Start Time (Hour:Minute AM/PM)</label>
              <div className="time-input-group">
                <select
                  name="startHour"
                  value={formData.startHour}
                  onChange={handleInputChange}
                  required
                >
                  {hourOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="time-colon">:</span>
                <select
                  name="startMinute"
                  value={formData.startMinute}
                  onChange={handleInputChange}
                  required
                >
                  {minuteOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
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
              <label>*End Time (Hour:Minute AM/PM)</label>
              <div className="time-input-group">
                <select
                  name="endHour"
                  value={formData.endHour}
                  onChange={handleInputChange}
                  required
                >
                  {hourOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="time-colon">:</span>
                <select
                  name="endMinute"
                  value={formData.endMinute}
                  onChange={handleInputChange}
                  required
                >
                  {minuteOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
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

            {formData.recurringSession && (
              <>
                <div className="form-group">
                  <label>Repeat Frequency</label>
                  <select
                    name="recurringFrequency"
                    value={formData.recurringFrequency}
                    onChange={handleInputChange}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Same day each week)</option>
                    <option value="biweekly">Bi-weekly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>How many sessions?</label>
                  <select
                    name="recurringDuration"
                    value={formData.recurringDuration}
                    onChange={handleInputChange}
                  >
                    <option value="2">2 sessions</option>
                    <option value="3">3 sessions</option>
                    <option value="4">4 sessions</option>
                    <option value="5">5 sessions</option>
                    <option value="6">6 sessions</option>
                    <option value="8">8 sessions</option>
                    <option value="10">10 sessions</option>
                    <option value="12">12 sessions (3 months)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <button type="submit" className="publish-btn" disabled={isPublishing}>
            {isPublishing 
              ? (editingSchedule ? 'UPDATING...' : 'PUBLISHING...') 
              : (editingSchedule ? 'UPDATE TIMESLOT' : 'PUBLISH TIMESLOT')
            }
          </button>
          {editingSchedule && (
            <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
              CANCEL EDIT
            </button>
          )}
        </form>
      </div>

      {/* My Schedules Section */}
      <div className="my-schedules-section">
        <div className="section-header">
          <span className="clock-icon">⏱️</span>
          <h2>MY SCHEDULES</h2>
        </div>

        <div className="schedules-table-wrapper">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>No schedules yet. Create one above!</p>
          ) : (
            <table className="schedules-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TIME & DURATION</th>
                  <th>TITLE</th>
                  <th>TYPE</th>
                  <th>BOOKINGS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const startDate = new Date(schedule.startTime);
                  const endDate = new Date(schedule.endTime);
                  const durationMs = endDate - startDate;
                  const durationMins = Math.floor(durationMs / 60000);
                  const enrolled = schedule.enrolledMembers ? schedule.enrolledMembers.length : 0;
                  const max = schedule.maxParticipants || 1;
                  
                  return (
                    <tr key={schedule._id}>
                      <td className="date-cell">
                        {format(startDate, 'MMM d, yyyy')}
                      </td>
                      <td className="time-cell">
                        <span className="time-range">
                          {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                        </span>
                        <span className="duration">({durationMins}m)</span>
                      </td>
                      <td className="title-cell">{schedule.title}</td>
                      <td className="type-cell">{schedule.sessionType}</td>
                      <td className="bookings-cell">{enrolled}/{max}</td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditSchedule(schedule)}
                          disabled={isPublishing}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteSchedule(schedule._id)}
                          disabled={isPublishing}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
                <button 
                  className="btn-chat"
                  onClick={() => handleOpenChat(booking)}
                  title="Send message"
                >
                  💬
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Box */}
      {chatUser && (
        <ChatBox 
          currentUser={JSON.parse(localStorage.getItem('user') || '{}')} 
          otherUser={chatUser} 
          scheduleId={chatScheduleId}
          onClose={() => {
            setChatUser(null);
            setChatScheduleId(null);
          }} 
        />
      )}
    </div>
  );
}

export default TrainerScheduleManagement;
