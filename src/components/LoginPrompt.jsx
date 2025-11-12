import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './LoginPrompt.css';

export default function LoginPrompt() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    // Redirect to homepage or previous page
    navigate('/');
  };

  if (!showModal) return null;

  return (
    <div className="login-prompt-overlay" onClick={handleClose}>
      <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-prompt-close" onClick={handleClose}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="login-prompt-content">
          <div className="login-prompt-icon">🔒</div>
          <h2 className="login-prompt-title">تسجيل الدخول مطلوب</h2>
          <p className="login-prompt-message">
            يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة
          </p>
          
          <div className="login-prompt-actions">
            <Link 
              to="/login" 
              state={{ from: location.pathname }}
              className="login-prompt-btn login-prompt-btn-primary"
            >
              تسجيل الدخول
            </Link>
            <Link 
              to="/account-type" 
              state={{ from: location.pathname }}
              className="login-prompt-btn login-prompt-btn-secondary"
            >
              إنشاء حساب
            </Link>
          </div>
          
          <button 
            className="login-prompt-skip"
            onClick={handleClose}
          >
            متابعة كضيف
          </button>
        </div>
      </div>
    </div>
  );
}

