import React from 'react';

const TrainerProfileModal = ({ visible, onClose, trainer, onBook }) => {
  if (!visible || !trainer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trainer-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
          ✕
        </button>

        <div className="trainer-profile">
          <div className="trainer-avatar-large">
            {trainer.profile_image_url ? (
              <img src={trainer.profile_image_url} alt={trainer.name} />
            ) : (
              <div className="avatar-placeholder">{trainer.name?.charAt(0).toUpperCase()}</div>
            )}
          </div>

          <h2 className="trainer-name">{trainer.name}</h2>

          <div className="trainer-rating">
            <span className="stars">★ {trainer.rating || 4.8}</span>
            <span className="reviews">({trainer.review_count !== undefined ? trainer.review_count : 42} reviews)</span>
          </div>

          <div className="trainer-details">
            <div className="detail-item">
              <span className="detail-label">Experience</span>
              <span className="detail-value">{trainer.experience_years || 5} Years</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Training ID</span>
              <span className="detail-value">{trainer.training_id || 'TRN-10029'}</span>
            </div>
          </div>

          <div className="trainer-achievements">
            <h3>Achievements</h3>
            <div className="achievements-list">
              {trainer.achievements && trainer.achievements.length > 0 ? (
                trainer.achievements.map((ach, idx) => (
                  <span key={idx} className="achievement-badge">
                    {ach}
                  </span>
                ))
              ) : (
                <>
                  <span className="achievement-badge">Certified Personal Trainer</span>
                  <span className="achievement-badge">Nutrition Specialist</span>
                  <span className="achievement-badge">CPR/AED</span>
                </>
              )}
            </div>
          </div>

          {onBook && (
            <button className="book-button" onClick={(e) => { e.stopPropagation(); onBook(); }}>
              Book This Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerProfileModal;
