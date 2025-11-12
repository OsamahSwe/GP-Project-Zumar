import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPrompt from './LoginPrompt';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Cairo, sans-serif'
      }}>
        <div>جاري التحميل...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPrompt />;
  }

  return children;
}

