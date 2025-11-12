import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchEventById, formatEventDate, formatEventTime } from '../utils/events';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import AuthPrompt from './AuthPrompt';
import './EventDetail.css';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventData = await fetchEventById(eventId);
        if (eventData) {
          setEvent(eventData);
        } else {
          setError('الفعالية غير موجودة');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('حدث خطأ في تحميل الفعالية');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <Layout>
        <div className="event-detail-page">
          <div className="event-detail-loading">
            <div className="loading-spinner">⏳</div>
            <p>جاري تحميل الفعالية...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="event-detail-page">
          <div className="event-detail-error">
            <div className="error-icon">❌</div>
            <p>{error || 'الفعالية غير موجودة'}</p>
            <Link to="/" className="btn btn-primary">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Transform event data for display
  const displayEvent = {
    id: event.id,
    title: event.title || event.name || 'فعالية',
    club: event.clubName || event.club || 'نادي',
    clubType: event.category || event.clubType || 'cultural',
    date: formatEventDate(event.eventDate),
    time: formatEventTime(event.startTime, event.endTime),
    location: event.location || event.venue || 'موقع غير محدد',
    seats: event.capacity ? (event.capacity - (event.registeredCount || 0)) : 0,
    capacity: event.capacity || 0,
    registered: event.registeredCount || 0,
    image: event.image || event.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop',
    description: event.description || 'لا يوجد وصف متاح',
    organizer: event.organizerName || event.organizer || 'منظم الفعالية',
  };

  return (
    <Layout>
      <div className="event-detail-page">
        <div className="event-detail-container">
        {/* Header with back button */}
        <div className="event-detail-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            العودة
          </button>
        </div>

        {/* Event Image */}
        <div className="event-detail-image-container">
          <img 
            src={displayEvent.image} 
            alt={displayEvent.title}
            className="event-detail-image"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop';
            }}
          />
        </div>

        {/* Event Content */}
        <div className="event-detail-content">
          <div className="event-detail-meta">
            <span className={`event-detail-club ${displayEvent.clubType}`}>
              {displayEvent.club}
            </span>
            <span className="event-detail-date">{displayEvent.date}</span>
          </div>

          <h1 className="event-detail-title">{displayEvent.title}</h1>

          <div className="event-detail-info-grid">
            <div className="event-detail-info-item">
              <svg className="event-detail-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="event-detail-info-label">الوقت</div>
                <div className="event-detail-info-value">{displayEvent.time}</div>
              </div>
            </div>

            <div className="event-detail-info-item">
              <svg className="event-detail-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="event-detail-info-label">الموقع</div>
                <div className="event-detail-info-value">{displayEvent.location}</div>
              </div>
            </div>

            <div className="event-detail-info-item">
              <svg className="event-detail-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <div className="event-detail-info-label">المقاعد المتاحة</div>
                <div className="event-detail-info-value">
                  {displayEvent.seats} من {displayEvent.capacity}
                </div>
              </div>
            </div>

            <div className="event-detail-info-item">
              <svg className="event-detail-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <div className="event-detail-info-label">المنظم</div>
                <div className="event-detail-info-value">{displayEvent.organizer}</div>
              </div>
            </div>
          </div>

          <div className="event-detail-description">
            <h2 className="event-detail-section-title">عن الفعالية</h2>
            <p className="event-detail-description-text">{displayEvent.description}</p>
          </div>

          <div className="event-detail-actions">
            {currentUser ? (
              <button className="btn btn-primary btn-large">
                التسجيل في الفعالية
              </button>
            ) : (
              <button 
                className="btn btn-primary btn-large"
                onClick={() => setShowAuthPrompt(true)}
              >
                التسجيل في الفعالية
              </button>
            )}
            <button className="btn btn-secondary btn-large">
              مشاركة الفعالية
            </button>
          </div>
        </div>
      </div>

        {/* Auth Prompt */}
        {showAuthPrompt && (
          <AuthPrompt 
            message="يجب عليك تسجيل الدخول للتسجيل في الفعاليات"
            onClose={() => setShowAuthPrompt(false)}
          />
        )}
      </div>
    </Layout>
  );
}

