import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from './Layout';
import './UserProfile.css';

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    const fetchUser = async () => {
      setStatus({ loading: true, error: '' });
      try {
        const q = query(
          collection(db, 'users'),
          where('username', '==', (username || '').toLowerCase()),
          limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          setUser(null);
          setStatus({ loading: false, error: 'المستخدم غير موجود' });
          return;
        }
        const d = snap.docs[0];
        setUser({ uid: d.id, ...d.data() });
        setStatus({ loading: false, error: '' });
      } catch (e) {
        console.error(e);
        setStatus({ loading: false, error: 'فشل تحميل الملف الشخصي' });
      }
    };
    fetchUser();
  }, [username]);

  if (status.loading) {
    return (
      <Layout>
        <div className="user-profile-page">
          <div className="user-profile-loading">
            <div className="loading-spinner">⏳</div>
            <p>جاري تحميل الملف الشخصي...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status.error || !user) {
    return (
      <Layout>
        <div className="user-profile-page">
          <div className="user-profile-error">
            <div className="error-icon">❌</div>
            <p>{status.error || 'المستخدم غير موجود'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const academicBadge = user.academicYear ? `السنة ${user.academicYear}` : 'طالب';
  const isActive = user.status ? String(user.status).toLowerCase() === 'active' : true;
  const subtitle = [
    user.major || 'علوم الحاسب',
    user.university || 'جامعة الملك سعود'
  ].join(' | ');

  return (
    <Layout>
      <div className="user-profile-page">
        {/* Profile Header Card */}
        <div className="user-profile-header-card">
          <div className="user-profile-cover"></div>
          <div className="user-profile-header-content">
            <div className="user-profile-avatar">
              {(user.fullName || user.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="user-profile-info">
              <h1 className="user-profile-name">{user.fullName || '-'}</h1>
              {user.username && (
                <p className="user-profile-username">@{user.username}</p>
              )}
              {user.email && (
                <p className="user-profile-email">{user.email}</p>
              )}
              <p className="user-profile-subtitle">{subtitle}</p>
              <div className="user-profile-badges">
                <span className="user-profile-badge user-profile-badge-primary">{academicBadge}</span>
                <span className={`user-profile-badge ${isActive ? 'user-profile-badge-success' : 'user-profile-badge-error'}`}>
                  {isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="user-profile-content">
          <div className="user-profile-grid">
            {/* Left Column */}
            <div className="user-profile-column">
              {/* About */}
              <div className="user-profile-card">
                <h2 className="user-profile-card-title">نبذة</h2>
                <p className="user-profile-card-text">{user.bio || 'لا توجد نبذة حالياً.'}</p>
              </div>

              {/* Education */}
              <div className="user-profile-card">
                <h2 className="user-profile-card-title">التعليم</h2>
                <div className="user-profile-education">
                  <div className="user-profile-education-item">
                    <strong>{user.major || 'علوم الحاسب'}</strong>
                  </div>
                  <div className="user-profile-education-item">
                    {user.university || 'جامعة الملك سعود'}
                  </div>
                  {user.academicYear && (
                    <div className="user-profile-education-item">
                      السنة {user.academicYear}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="user-profile-card">
                <h2 className="user-profile-card-title">معلومات التواصل</h2>
                <ul className="user-profile-contact-list">
                  {user.email && <li>📧 {user.email}</li>}
                  {user.phone && <li>📞 {user.phone}</li>}
                  {user.city && <li>📍 {user.city}</li>}
                  {user.linkedin && (
                    <li>
                      <a href={user.linkedin} target="_blank" rel="noreferrer" className="user-profile-link">
                        LinkedIn
                      </a>
                    </li>
                  )}
                  {user.github && (
                    <li>
                      <a href={user.github} target="_blank" rel="noreferrer" className="user-profile-link">
                        GitHub
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="user-profile-column">
              {/* Club Memberships */}
              <div className="user-profile-card">
                <h2 className="user-profile-card-title">العضويات في الأندية</h2>
                {user.clubs && user.clubs.length > 0 ? (
                  <div className="user-profile-clubs">
                    {user.clubs.map((c, i) => (
                      <div key={i} className="user-profile-club-item">
                        <div className="user-profile-club-info">
                          <span className="user-profile-club-icon">👥</span>
                          <div>
                            <div className="user-profile-club-name">{c.name}</div>
                            {c.role && <div className="user-profile-club-role">{c.role}</div>}
                          </div>
                        </div>
                        <span className="user-profile-club-status">{c.status || 'نشط'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="user-profile-empty">لا توجد أندية حتى الآن.</p>
                )}
              </div>

              {/* Achievements */}
              <div className="user-profile-card">
                <h2 className="user-profile-card-title">الإنجازات</h2>
                {user.achievements && user.achievements.length > 0 ? (
                  <ul className="user-profile-achievements">
                    {user.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="user-profile-empty">لا توجد إنجازات حالياً.</p>
                )}
              </div>

              {/* Skills */}
              <div className="user-profile-card">
                <h2 className="user-profile-card-title">المهارات</h2>
                {user.skills && user.skills.length > 0 ? (
                  <div className="user-profile-chips">
                    {user.skills.map((s, i) => (
                      <span key={i} className="user-profile-chip">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="user-profile-empty">لا توجد مهارات مضافة.</p>
                )}
              </div>

              {/* Interests */}
              <div className="user-profile-card">
                <h2 className="user-profile-card-title">الاهتمامات</h2>
                {user.interests && user.interests.length > 0 ? (
                  <div className="user-profile-chips">
                    {user.interests.map((s, i) => (
                      <span key={i} className="user-profile-chip">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="user-profile-empty">لا توجد اهتمامات مضافة.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
