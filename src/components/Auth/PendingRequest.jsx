import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './Auth.css';

export default function PendingRequest() {
  const location = useLocation();
  const requestType = location.state?.requestType || 'admin'; // 'admin' or 'organizer'
  
  const getRequestInfo = () => {
    if (requestType === 'admin') {
      return {
        title: 'طلب إنشاء حساب مدير',
        message: 'تم إرسال طلب إنشاء حساب مدير بنجاح',
        description: 'سيتم مراجعة طلبك من قبل المديرين الحاليين. سيتم إشعارك عند الموافقة على طلبك.',
        icon: '👨‍💼'
      };
    } else if (requestType === 'organizer') {
      return {
        title: 'طلب إنشاء نادي',
        message: 'تم إرسال طلب إنشاء نادي بنجاح',
        description: 'سيتم مراجعة طلبك من قبل المديرين. سيتم إشعارك عند الموافقة على طلبك.',
        icon: '👥'
      };
    } else {
      return {
        title: 'طلب معلق',
        message: 'تم إرسال طلبك بنجاح',
        description: 'سيتم مراجعة طلبك. سيتم إشعارك عند الموافقة.',
        icon: '⏳'
      };
    }
  };

  const info = getRequestInfo();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Link to="/" className="auth-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            العودة للرئيسية
          </Link>

          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
              {info.icon}
            </div>
            
            <h1 className="auth-title" style={{ marginBottom: '1rem' }}>
              {info.title}
            </h1>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '2px solid #86efac',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                color: '#166534', 
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                ✅ {info.message}
              </div>
              <p style={{ 
                color: '#166534', 
                fontSize: '1rem',
                lineHeight: '1.7'
              }}>
                {info.description}
              </p>
            </div>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #93c5fd',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'right'
            }}>
              <h3 style={{ 
                color: '#1e40af', 
                fontSize: '1.125rem',
                fontWeight: '700',
                marginBottom: '0.75rem'
              }}>
                ما التالي؟
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                color: '#1e40af'
              }}>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⏳</span>
                  <span>انتظر مراجعة طلبك من قبل المديرين</span>
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📧</span>
                  <span>سيتم إشعارك عبر البريد الإلكتروني عند الموافقة</span>
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔐</span>
                  <span>بعد الموافقة، يمكنك تسجيل الدخول باستخدام بياناتك</span>
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="auth-button auth-button-primary" style={{ maxWidth: '200px' }}>
                العودة للرئيسية
              </Link>
              <Link to="/login" className="auth-button auth-button-secondary" style={{ maxWidth: '200px' }}>
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

