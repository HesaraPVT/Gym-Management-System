import React, { useState, useEffect } from 'react';
import './SchedulePage.css';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import OpenTrainingSlots from './OpenTrainingSlots';
import ScheduleCalendar from '../common/ScheduleCalendar';
import TrainerProfileModal from '../common/TrainerProfileModal';
import BookingConfirmationModal from '../common/BookingConfirmationModal';
import ChatBox from '../common/ChatBox';

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
  const [unreadCounts, setUnreadCounts] = useState({});

  // Mock fetch data (replace with actual API calls)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data for demo - replace with actual API calls
      const mockAvailabilities = [
        {
          _id: '1',
          trainer_id: 'trainer-1',
          trainer_name: 'praveen',
          session_title: 'Training Session',
          session_category: 'General',
          session_type: 'Individual',
          start_time: new Date(2026, 3, 30, 13, 0).toISOString(),
          end_time: new Date(2026, 3, 30, 14, 0).toISOString(),
          max_participants: 1,
          spots_left: 1,
          rating: 4.8
        },
        {
          _id: '2',
          trainer_id: 'trainer-2',
          trainer_name: 'sayash perera',
          session_title: 'Morning schedule',
          session_category: 'Personal Training',
          session_type: 'Group',
          start_time: new Date(2026, 3, 31, 4, 0).toISOString(),
          end_time: new Date(2026, 3, 31, 6, 0).toISOString(),
          max_participants: 12,
          spots_left: 4,
          rating: 4.8
        },
        {
          _id: '3',
          trainer_id: 'trainer-3',
          trainer_name: 'Himaya Ranawaka',
          session_title: 'Training Session',
          session_category: 'General',
          session_type: 'Individual',
          start_time: new Date(2026, 4, 2, 6, 0).toISOString(),
          end_time: new Date(2026, 4, 2, 8, 0).toISOString(),
          max_participants: 1,
          spots_left: 1,
          rating: 4.8
        },
        {
          _id: '4',
          trainer_id: 'trainer-1',
          trainer_name: 'Himaya Ranawaka',
          session_title: 'General Session',
          session_category: 'General',
          session_type: 'Individual',
          start_time: new Date(2026, 4, 3, 8, 0).toISOString(),
          end_time: new Date(2026, 4, 3, 10, 0).toISOString(),
          max_participants: 1,
          spots_left: 1,
          rating: 4.8
        },
        {
          _id: '5',
          trainer_id: 'trainer-2',
          trainer_name: 'praveen',
          session_title: 'Weekend Blast',
          session_category: 'Strength',
          session_type: 'Group',
          start_time: new Date(2026, 4, 4, 7, 0).toISOString(),
          end_time: new Date(2026, 4, 4, 9, 0).toISOString(),
          max_participants: 15,
          spots_left: 1,
          rating: 4.8
        },
        {
          _id: '6',
          trainer_id: 'trainer-3',
          trainer_name: 'praveen',
          session_title: 'Weekend Blast',
          session_category: 'Strength',
          session_type: 'Group',
          start_time: new Date(2026, 4, 5, 7, 0).toISOString(),
          end_time: new Date(2026, 4, 5, 9, 0).toISOString(),
          max_participants: 15,
          spots_left: 1,
          rating: 4.8
        },
        {
          _id: '7',
          trainer_id: 'trainer-1',
          trainer_name: 'sayash perera',
          session_title: 'General Session',
          session_category: 'General',
          session_type: 'Individual',
          start_time: new Date(2026, 4, 1, 8, 0).toISOString(),
          end_time: new Date(2026, 4, 1, 9, 0).toISOString(),
          max_participants: 1,
          spots_left: 0,
          rating: 4.8
        }
      ];

      const mockBookings = [
        {
          _id: 'booking-1',
          availability_id: '1',
          trainer_id: 'trainer-1',
          trainer_name: 'Himaya Ranawaka',
          start_time: new Date(2026, 3, 3, 8, 0).toISOString(),
          end_time: new Date(2026, 3, 3, 11, 0).toISOString(),
          time_changed: true
        },
        {
          _id: 'booking-2',
          availability_id: '2',
          trainer_id: 'trainer-2',
          trainer_name: 'praveen',
          start_time: new Date(2026, 3, 10, 13, 0).toISOString(),
          end_time: new Date(2026, 3, 10, 16, 0).toISOString(),
          time_changed: false
        },
        {
          _id: 'booking-3',
          availability_id: '3',
          trainer_id: 'trainer-3',
          trainer_name: 'sayash perera',
          start_time: new Date(2026, 4, 1, 4, 0).toISOString(),
          end_time: new Date(2026, 4, 1, 6, 0).toISOString(),
          time_changed: false
        }
      ];

      setAvailabilities(mockAvailabilities);
      setBookings(mockBookings);
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredAvailabilities = availabilities.filter((slot) => {
    if (categoryFilter !== 'All' && slot.session_category !== categoryFilter) return false;
    if (trainerFilter !== 'All' && slot.trainer_id !== trainerFilter) return false;
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

  // Unique Categories and Trainers for filters
  const uniqueCategories = ['All', ...Array.from(new Set(availabilities.map((a) => a.session_category || 'General')))];
  const uniqueTrainers = [
    { id: 'All', name: 'All Trainers' },
    ...Array.from(new Map(availabilities.map((a) => [a.trainer_id, { id: a.trainer_id, name: a.trainer_name }])).values())
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

  const confirmBooking = () => {
    console.log('=== CONFIRM BOOKING STARTED ===');
    console.log('selectedSlot:', selectedSlot);
    
    if (!selectedSlot) {
      console.warn('❌ No slot selected!');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      const newBooking = {
        _id: `booking-${Date.now()}`,
        availability_id: selectedSlot._id,
        trainer_id: selectedSlot.trainer_id,
        trainer_name: selectedSlot.trainer_name,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        time_changed: false
      };

      console.log('✓ Created new booking object:', newBooking);
      
      // Add booking FIRST
      setBookings((prev) => {
        const updated = [...prev, newBooking];
        console.log('✓ Bookings array updated. New length:', updated.length);
        console.log('✓ All bookings:', updated);
        return updated;
      });
      
      // Close modals
      console.log('✓ Closing modals...');
      setBookingModalVisible(false);
      setProfileModalVisible(false);
      setSelectedSlot(null);
      
      // Show success message
      alert('✅ Booking confirmed! Check the "My Bookings" section on the right.');
      
      console.log('✅ BOOKING CONFIRMED SUCCESSFULLY');
    } catch (err) {
      console.error('❌ Error in confirmBooking:', err);
      alert('❌ Error creating booking: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      // TODO: Replace with actual API call
      console.log('Booking cancelled:', id);
      fetchData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  const handleOpenChat = (trainer) => {
    setChatUser(trainer);
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
                              })
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

      {chatUser && <ChatBox currentUser={{ id: 'user-id', name: 'You', role: 'user' }} otherUser={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
};

export default SchedulePage;
