import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPendingClubRequests, approveClubRequest, rejectClubRequest } from '../utils/clubRequests';
import './AdminRequestsSidebar.css';

export default function AdminRequestsSidebar({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    if (isOpen && currentUser) {
      loadRequests();
    }
  }, [isOpen, currentUser]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const pendingRequests = await fetchPendingClubRequests();
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!currentUser) return;
    
    setProcessing(prev => ({ ...prev, [requestId]: 'approving' }));
    try {
      await approveClubRequest(requestId, currentUser.uid);
      // Reload requests
      await loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('حدث خطأ في الموافقة على الطلب');
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleReject = async (requestId) => {
    if (!currentUser) return;
    
    const reason = prompt('أدخل سبب الرفض (اختياري):');
    if (reason === null) return; // User cancelled
    
    setProcessing(prev => ({ ...prev, [requestId]: 'rejecting' }));
    try {
      await rejectClubRequest(requestId, currentUser.uid, reason || '');
      // Reload requests
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('حدث خطأ في رفض الطلب');
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-requests-sidebar-overlay" onClick={onClose}>
      <div className="admin-requests-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="admin-requests-header">
          <h2 className="admin-requests-title">طلبات النوادي المعلقة</h2>
          <button className="admin-requests-close" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="admin-requests-content">
          {loading ? (
            <div className="admin-requests-loading">
              <div className="loading-spinner">⏳</div>
              <p>جاري تحميل الطلبات...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="admin-requests-empty">
              <div className="empty-icon">✅</div>
              <p>لا توجد طلبات معلقة</p>
            </div>
          ) : (
            <div className="admin-requests-list">
              {requests.map((request) => (
                <div key={request.id} className="admin-request-card">
                  <div className="request-header">
                    <div className="request-icon">👥</div>
                    <div className="request-info">
                      <h3 className="request-club-name">{request.clubName}</h3>
                      <p className="request-organizer">منظم: @{request.username}</p>
                      <p className="request-email">{request.email}</p>
                    </div>
                  </div>
                  
                  <div className="request-date">
                    📅 {request.createdAt ? new Date(request.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </div>

                  <div className="request-actions">
                    <button
                      className="request-btn request-btn-approve"
                      onClick={() => handleApprove(request.id)}
                      disabled={processing[request.id]}
                    >
                      {processing[request.id] === 'approving' ? 'جاري الموافقة...' : '✅ موافق'}
                    </button>
                    <button
                      className="request-btn request-btn-reject"
                      onClick={() => handleReject(request.id)}
                      disabled={processing[request.id]}
                    >
                      {processing[request.id] === 'rejecting' ? 'جاري الرفض...' : '❌ رفض'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

