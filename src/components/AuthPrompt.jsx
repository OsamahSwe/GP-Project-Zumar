import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPrompt.css';

export default function AuthPrompt({ message, onClose }) {
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  if (!showModal) return null;

  return (
    <div className="auth-prompt-overlay" onClick={handleClose}>
      <div className="auth-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-prompt-close" onClick={handleClose}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="auth-prompt-content">
          <div className="auth-prompt-icon">🔒</div>
          <h2 className="auth-prompt-title">تسجيل الدخول مطلوب</h2>
          <p className="auth-prompt-message">
            {message || 'يجب عليك تسجيل الدخول للوصول إلى هذه الميزة'}
          </p>
          
          <div className="auth-prompt-actions">
            <Link 
              to="/login"
              className="auth-prompt-btn auth-prompt-btn-primary"
              onClick={handleClose}
            >
              تسجيل الدخول
            </Link>
            <Link 
              to="/account-type"
              className="auth-prompt-btn auth-prompt-btn-secondary"
              onClick={handleClose}
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

