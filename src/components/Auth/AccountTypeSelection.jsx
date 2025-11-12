import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function AccountTypeSelection() {
  const [selectedType, setSelectedType] = useState('student');
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/signup', { state: { accountType: selectedType } });
  };

  return (
    <div className="account-type-page">
      <div className="account-type-container">
        <Link to="/" className="auth-back-link" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          العودة للرئيسية
        </Link>

        <div className="account-type-header">
          <h1 className="account-type-title">اختر نوع الحساب</h1>
          <p className="account-type-subtitle">
            اختر نوع الحساب المناسب لك للبدء في رحلتك مع نوادي الجامعة
          </p>
        </div>

        <div className="account-type-grid">
          {/* Student Account */}
          <div 
            className={`account-type-card ${selectedType === 'student' ? 'selected' : ''}`}
            onClick={() => setSelectedType('student')}
          >
            <span className="account-type-icon">🎓</span>
            <h3 className="account-type-card-title">طالب</h3>
            <p className="account-type-card-description">
              للطلاب الذين يريدون الانضمام إلى النوادي والمشاركة في الفعاليات
            </p>
            <ul className="account-type-features">
              <li className="account-type-feature">استكشف النوادي والفعاليات</li>
              <li className="account-type-feature">سجل في الفعاليات</li>
              <li className="account-type-feature">تابع النوادي المفضلة</li>
            </ul>
          </div>

          {/* Organizer Account */}
          <div 
            className={`account-type-card ${selectedType === 'organizer' ? 'selected' : ''}`}
            onClick={() => setSelectedType('organizer')}
          >
            <span className="account-type-icon">👥</span>
            <h3 className="account-type-card-title">منظم نادي</h3>
            <p className="account-type-card-description">
              لمنظمي النوادي الذين يريدون إدارة النوادي وإنشاء الفعاليات
            </p>
            <ul className="account-type-features">
              <li className="account-type-feature">أنشئ وأدر النوادي</li>
              <li className="account-type-feature">أنشئ الفعاليات</li>
              <li className="account-type-feature">أدر الأعضاء والتسجيلات</li>
            </ul>
          </div>

          {/* Admin Account */}
          <div 
            className={`account-type-card ${selectedType === 'admin' ? 'selected' : ''}`}
            onClick={() => setSelectedType('admin')}
          >
            <span className="account-type-icon">👨‍💼</span>
            <h3 className="account-type-card-title">مدير</h3>
            <p className="account-type-card-description">
              للمديرين الذين يريدون إدارة النظام والموافقة على الطلبات
            </p>
            <ul className="account-type-features">
              <li className="account-type-feature">أدر النظام بالكامل</li>
              <li className="account-type-feature">وافق على طلبات النوادي</li>
              <li className="account-type-feature">أدر الفئات والتقارير</li>
            </ul>
          </div>
        </div>

        <div className="account-type-actions">
          <button 
            onClick={handleContinue}
            className="auth-button auth-button-primary"
            style={{ maxWidth: '300px', margin: '0 auto' }}
          >
            المتابعة
          </button>
        </div>
      </div>
    </div>
  );
}
