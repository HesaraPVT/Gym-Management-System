import React, { useState, useEffect } from 'react';
import './SchedulePage.css';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import OpenTrainingSlots from './OpenTrainingSlots';
import ScheduleCalendar from '../common/ScheduleCalendar';
import TrainerProfileModal from '../common/TrainerProfileModal';
import BookingConfirmationModal from '../common/BookingConfirmationModal';
import ChatBox from '../common/ChatBox';

const API_BASE = 'http://localhost:5001/api';

const SchedulePage = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [trainerFilter, setTrainerFilter] = useState('All');
  const [dateRange, setDateRange] = useState([null, null]);

  // Modals
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Chat
  const [chatUser, setChatUser] = useState(null);
  const [chatScheduleId, setChatScheduleId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Helper to get auth header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Helper to map a schedule from the DB into the shape the UI expects
  const mapScheduleToAvailability = (schedule) => {
    const trainerObj = schedule.trainerId;
    const trainerName = typeof trainerObj === 'object' && trainerObj
      ? trainerObj.name
      : 'Unknown Trainer';
    const trainerId = typeof trainerObj === 'object' && trainerObj
      ? trainerObj._id
      : trainerObj;

    const enrolled = schedule.enrolledMembers ? schedule.enrolledMembers.length : 0;
    const max = schedule.maxParticipants || 1;

    return {
      _id: schedule._id,
      trainer_id: trainerId,
      trainer_name: trainerName,
      session_title: schedule.title || 'Training Session',
      session_category: schedule.sessionType || 'General',
      session_type: max > 1 ? 'Group' : 'Individual',
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      max_participants: max,
      spots_left: Math.max(0, max - enrolled),
      rating: 4.8
    };
  };

  // Helper to map a schedule into a booking shape
  const mapScheduleToBooking = (schedule) => {
    const trainerObj = schedule.trainerId;
    const trainerName = typeof trainerObj === 'object' && trainerObj
      ? trainerObj.name
      : 'Unknown Trainer';
    const trainerId = typeof trainerObj === 'object' && trainerObj
      ? trainerObj._id
      : trainerObj;

    return {
      _id: schedule._id,
      availability_id: schedule._id,
      trainer_id: trainerId,
      trainer_name: trainerName,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      time_changed: false
    };
  };

  // Fetch all available schedules and user's bookings from the database
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all schedules
      const schedulesRes = await fetch(`${API_BASE}/schedule`, {
        headers: getAuthHeaders()
      });
      const schedulesData = await schedulesRes.json();

      if (schedulesData.success && schedulesData.schedules) {
        const mapped = schedulesData.schedules.map(mapScheduleToAvailability);
        setAvailabilities(mapped);
      } else {
        setAvailabilities([]);
      }

      // Fetch user's bookings (schedules user is enrolled in)
      const bookingsRes = await fetch(`${API_BASE}/schedule/my-bookings`, {
        headers: getAuthHeaders()
      });
      const bookingsData = await bookingsRes.json();

      if (bookingsData.success && bookingsData.schedules) {
        const mappedBookings = bookingsData.schedules.map(mapScheduleToBooking);
        setBookings(mappedBookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic — trainer filter now uses trainer_name
  const filteredAvailabilities = availabilities.filter((slot) => {
    if (categoryFilter !== 'All' && slot.session_category !== categoryFilter) return false;
    if (trainerFilter !== 'All' && slot.trainer_name !== trainerFilter) return false;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const slotDate = parseISO(slot.start_time);
      const start = dateRange[0];
      const end = dateRange[1];
      if (!isWithinInterval(slotDate, { start: startOfDay(start), end: endOfDay(end) })) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Unique Categories and Trainers for filters — deduplicate by trainer name
  const uniqueCategories = ['All', ...Array.from(new Set(availabilities.map((a) => a.session_category || 'General')))];
  const uniqueTrainers = [
    { id: 'All', name: 'All Trainers' },
    ...Array.from(new Map(availabilities.map((a) => [a.trainer_name, { id: a.trainer_name, name: a.trainer_name }])).values())
  ];

  const handleTrainerClick = (trainer) => {
    setSelectedTrainer(trainer);
    setProfileModalVisible(true);
  };

  const handleBookClick = (slot) => {
    console.log('Book clicked for slot:', slot);
    setSelectedSlot(slot);
    setBookingModalVisible(true);
  };

  const confirmBooking = async () => {
    console.log('=== CONFIRM BOOKING STARTED ===');
    console.log('selectedSlot:', selectedSlot);
    
    if (!selectedSlot) {
      console.warn('❌ No slot selected!');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      // Call the enroll API
      const res = await fetch(`${API_BASE}/schedule/${selectedSlot._id}/enroll`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to book session');
      }

      console.log('✅ BOOKING CONFIRMED SUCCESSFULLY');
      
      // Close modals
      setBookingModalVisible(false);
      setProfileModalVisible(false);
      setSelectedSlot(null);
      
      // Refresh data from the database
      await fetchData();

      alert('✅ Booking confirmed! Check the "My Bookings" section on the right.');
    } catch (err) {
      console.error('❌ Error in confirmBooking:', err);
      alert('❌ Error creating booking: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/schedule/${id}/unenroll`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }

      // Remove the booking from local state immediately
      setBookings((prev) => prev.filter((b) => b._id !== id));

      // Also refresh availabilities so spots_left updates
      const schedulesRes = await fetch(`${API_BASE}/schedule`, {
        headers: getAuthHeaders()
      });
      const schedulesData = await schedulesRes.json();
      if (schedulesData.success && schedulesData.schedules) {
        setAvailabilities(schedulesData.schedules.map(mapScheduleToAvailability));
      }

      alert('Booking cancelled successfully.');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Error cancelling booking: ' + err.message);
    }
  };

  const handleOpenChat = (trainer, scheduleId) => {
    setChatUser(trainer);
    setChatScheduleId(scheduleId);
    setUnreadCounts((prev) => ({ ...prev, [trainer._id]: 0 }));
  };

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <div className="schedule-header">
          <h2>Schedule & Appointments</h2>
          <p>Book your training sessions with professional trainers</p>
        </div>

        {loading ? (
          <div className="schedule-loading">
            <p>Loading schedules...</p>
          </div>
        ) : (
          <div className="schedule-content">
            {/* Filters */}
            <div className="schedule-filters">
              <div className="filter-group">
                <label>Category:</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Trainer:</label>
                <select value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
                  {uniqueTrainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </button>
                <button
                  className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                  onClick={() => setViewMode('calendar')}
                >
                  Calendar View
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="schedule-main">
              <div className="available-sessions">
                <h3>
                  Available Sessions
                  <span className="session-count">{filteredAvailabilities.length}</span>
                </h3>

                {viewMode === 'list' ? (
                  <OpenTrainingSlots
                    slots={filteredAvailabilities}
                    onTrainerClick={handleTrainerClick}
                    onBookClick={handleBookClick}
                  />
                ) : (
                  <ScheduleCalendar
                    slots={filteredAvailabilities}
                    onTrainerClick={handleTrainerClick}
                    onBookClick={handleBookClick}
                  />
                )}
              </div>

              {/* My Bookings Sidebar */}
              <div className="my-bookings">
                <h3>
                  My Bookings
                  <span className="booking-count">{bookings.length}</span>
                </h3>

              {bookings.length === 0 ? (
                  <div className="no-bookings">
                    <p>You have no upcoming sessions</p>
                  </div>
                ) : (
                  <div className="bookings-list" id="bookings-list-container">
                    {bookings && bookings.map((booking, index) => {
                      // Auto-scroll to last booking if just added
                      if (index === bookings.length - 1) {
                        setTimeout(() => {
                          const container = document.getElementById('bookings-list-container');
                          if (container) {
                            container.scrollTop = container.scrollHeight;
                          }
                        }, 100);
                      }
                      console.log('Rendering booking card:', booking);
                      return (
                        <div key={booking._id} className="booking-card">
                          <div className="booking-info">
                            <p className="booking-date">{format(parseISO(booking.start_time), 'MMM d, yyyy')}</p>
                            <p className="booking-time">
                              {format(parseISO(booking.start_time), 'h:mm a')} - {format(parseISO(booking.end_time), 'h:mm a')}
                            </p>
                            <p className="booking-trainer">Trainer: {booking.trainer_name}</p>
                          </div>
                        <div className="booking-actions">
                          <button
                            className="btn-chat"
                            title="Chat with trainer"
                            onClick={() =>
                              handleOpenChat({
                                _id: booking.trainer_id || 'trainer-' + booking._id,
                                name: booking.trainer_name,
                                role: 'trainer'
                              }, booking.availability_id || booking._id)
                            }
                          >
                            💬
                          </button>
                          <button
                            className="btn-cancel"
                            title="Cancel booking"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            ✕
                          </button>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {profileModalVisible && (
        <TrainerProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          trainer={selectedTrainer}
          onBook={() => {
            const trainerSlots = filteredAvailabilities.filter(
              (s) => s.trainer_id === selectedTrainer?.id && s.spots_left > 0
            );
            if (trainerSlots.length > 0) {
              setSelectedSlot(trainerSlots[0]);
              setBookingModalVisible(true);
            } else {
              alert('This trainer has no available slots.');
              setProfileModalVisible(false);
            }
          }}
        />
      )}

      {bookingModalVisible && (
        <BookingConfirmationModal
          visible={bookingModalVisible}
          onClose={() => setBookingModalVisible(false)}
          onConfirm={confirmBooking}
          session={
            selectedSlot
              ? {
                  id: selectedSlot._id,
                  category: selectedSlot.session_category || 'General',
                  date: selectedSlot.start_time,
                  start_time: selectedSlot.start_time,
                  end_time: selectedSlot.end_time,
                  trainer_name: selectedSlot.trainer_name
                }
              : null
          }
          loading={bookingLoading}
        />
      )}

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
};

export default SchedulePage;
