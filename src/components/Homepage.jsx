import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchEvents } from '../utils/events';
import Layout from './Layout';
import './Homepage.css';

export default function Homepage() {
  const { currentUser, userData } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats] = useState({
    totalEvents: 0,
    myRegistrations: 0,
    myClubs: 0,
  });

  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        const events = await fetchEvents({ sortBy: 'closest', limitCount: 3 });
        setUpcomingEvents(events.slice(0, 3));
      } catch (error) {
        console.error('Error loading upcoming events:', error);
      }
    };

    loadUpcomingEvents();
  }, []);

  const userDisplayName = userData?.fullName || userData?.username || 'مستخدم';

  return (
    <Layout>
      <div className="homepage-dashboard">
        {/* Welcome Hero Section */}
        <div className="welcome-hero-modern">
          <div className="welcome-content-modern">
            <h1 className="welcome-title-modern">
              {currentUser ? (
                <>
                  مرحباً <span className="highlight-name">{userDisplayName}</span>
                </>
              ) : (
                'مرحباً بك في زمر'
              )}
            </h1>
            <p className="welcome-description-modern">
              {currentUser ? (
                `ابدأ رحلتك في اكتشاف النوادي والفعاليات المثيرة في جامعتك`
              ) : (
                'منصة شاملة لاكتشاف النوادي والأنشطة الطلابية في جامعتك'
              )}
            </p>
            {!currentUser && (
              <div className="welcome-actions-modern">
                <Link to="/account-type" className="btn-primary-modern">
                  انضم إلينا الآن
                </Link>
                <Link to="/login" className="btn-secondary-modern">
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {currentUser && (
          <div className="stats-grid-modern">
            <div className="stat-card-modern">
              <div className="stat-icon-modern">📅</div>
              <div className="stat-content-modern">
                <div className="stat-value-modern">{stats.totalEvents}</div>
                <div className="stat-label-modern">فعالية قادمة</div>
              </div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-icon-modern">✅</div>
              <div className="stat-content-modern">
                <div className="stat-value-modern">{stats.myRegistrations}</div>
                <div className="stat-label-modern">تسجيل نشط</div>
              </div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-icon-modern">🏛️</div>
              <div className="stat-content-modern">
                <div className="stat-value-modern">{stats.myClubs}</div>
                <div className="stat-label-modern">نادي منضم</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-modern">
          <h2 className="section-title-modern">ابدأ الآن</h2>
          <div className="actions-grid-modern">
            <Link to="/events" className="action-card-modern">
              <div className="action-icon-modern">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="action-title-modern">استكشف الفعاليات</h3>
              <p className="action-description-modern">
                تصفح الفعاليات القادمة وانضم إلى ما يثير اهتمامك
              </p>
              <div className="action-arrow-modern">→</div>
            </Link>
            <Link to="/my-clubs" className="action-card-modern">
              <div className="action-icon-modern">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="action-title-modern">أنديتك</h3>
              <p className="action-description-modern">
                إدارة النوادي التي انضممت إليها أو أنشأتها
              </p>
              <div className="action-arrow-modern">→</div>
            </Link>
            {userData?.role === 'organizer' && (
              <Link to="/create-club" className="action-card-modern">
                <div className="action-icon-modern">➕</div>
                <h3 className="action-title-modern">إنشاء نادي</h3>
                <p className="action-description-modern">
                  أنشئ نادي جديد وابدأ في تنظيم الفعاليات
                </p>
                <div className="action-arrow-modern">→</div>
              </Link>
            )}
            <Link to="/profile" className="action-card-modern">
              <div className="action-icon-modern">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 1 1-1.499.044 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.5-.045 9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"></path>
                </svg>
              </div>
              <h3 className="action-title-modern">الملف الشخصي</h3>
              <p className="action-description-modern">
                عدّل معلوماتك الشخصية وإعداداتك
              </p>
              <div className="action-arrow-modern">→</div>
            </Link>
          </div>
        </div>

        {/* Upcoming Events Preview */}
        {currentUser && upcomingEvents.length > 0 && (
          <div className="upcoming-events-modern">
            <div className="section-header-modern">
              <h2 className="section-title-modern">الفعاليات القادمة</h2>
              <Link to="/events" className="view-all-link-modern">
                عرض الكل →
              </Link>
            </div>
            <div className="events-preview-grid-modern">
              {upcomingEvents.map((event, index) => (
                <Link 
                  key={event.id} 
                  to={`/event/${event.id}`}
                  className="event-preview-card-modern"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="event-preview-image-modern">
                    <img 
                      src={event.image || event.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=150&fit=crop'} 
                      alt={event.title || event.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="event-preview-content-modern">
                    <span className={`event-preview-category-modern ${event.category || event.clubType || 'cultural'}`}>
                      {event.clubName || event.club || 'نادي'}
                    </span>
                    <h3 className="event-preview-title-modern">
                      {event.title || event.name || 'فعالية'}
                    </h3>
                    <div className="event-preview-meta-modern">
                      <span>📅 {event.eventDate ? new Date(event.eventDate).toLocaleDateString('ar-SA') : 'قريباً'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="features-section-modern">
          <h2 className="section-title-modern">لماذا زمر؟</h2>
          <div className="features-grid-modern">
            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="feature-title-modern">اكتشف الأنشطة</h3>
              <p className="feature-text-modern">
                تصفح مئات الفعاليات والأنشطة المتنوعة من مختلف النوادي
              </p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="feature-title-modern">انضم للنوادي</h3>
              <p className="feature-text-modern">
                انضم إلى النوادي التي تهمك وكن جزءاً من مجتمع نشط
              </p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"></path>
                </svg>
              </div>
              <h3 className="feature-title-modern">سهل الاستخدام</h3>
              <p className="feature-text-modern">
                واجهة بسيطة وسهلة الاستخدام لجميع الطلاب
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
