import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchPendingClubRequests } from '../utils/clubRequests';
import Header from './Header';
import AuthPrompt from './AuthPrompt';
import AdminRequestsSidebar from './AdminRequestsSidebar';
import './Layout.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [requestsSidebarOpen, setRequestsSidebarOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  // Get user display name and role
  const userDisplayName = userData?.fullName || userData?.username || 'مستخدم';
  
  // Get user role based on account type and major
  const getUserRole = () => {
    if (userData?.role === 'organizer') {
      return 'منظم نادي';
    }
    if (userData?.role === 'admin') {
      return 'مدير';
    }
    // For students, show their major if available
    if (userData?.major) {
      return `طالب ${userData.major}`;
    }
    // Default fallback
    return 'طالب';
  };
  
  const userRole = getUserRole();

  const isActive = (path) => location.pathname === path;

  const handleProtectedLink = (e, path) => {
    if (!currentUser) {
      e.preventDefault();
      setShowAuthPrompt(true);
    } else {
      setSidebarOpen(false);
      navigate(path);
    }
  };

  // Load pending requests count for admins
  useEffect(() => {
    const loadPendingRequests = async () => {
      if (userData?.role === 'admin') {
        try {
          const requests = await fetchPendingClubRequests();
          setPendingRequestsCount(requests.length);
        } catch (error) {
          console.error('Error loading pending requests:', error);
        }
      }
    };

    if (userData) {
      loadPendingRequests();
      
      // Refresh every 30 seconds
      const interval = setInterval(loadPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [userData?.role, userData]);

  const handleClubRequestsClick = (e) => {
    e.preventDefault();
    if (userData?.role === 'admin') {
      setSidebarOpen(false);
      setRequestsSidebarOpen(true);
    }
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <Header />

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">زمر</div>
        
        <nav className="sidebar-nav">
          <Link 
            to="/" 
            className={`nav-item ${isActive('/') ? 'active' : ''}`} 
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-item-icon">🏠</span>
            <span>الرئيسية</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`} 
            onClick={(e) => handleProtectedLink(e, '/profile')}
          >
            <span className="nav-item-icon">👤</span>
            <span>الملف الشخصي</span>
          </Link>
          <Link 
            to="/events" 
            className={`nav-item ${isActive('/events') ? 'active' : ''}`} 
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-item-icon">📅</span>
            <span>الفعاليات</span>
          </Link>
          <Link 
            to="/my-clubs" 
            className={`nav-item ${isActive('/my-clubs') ? 'active' : ''}`}
            onClick={(e) => handleProtectedLink(e, '/my-clubs')}
          >
            <span className="nav-item-icon">👥</span>
            <span>أنديتك</span>
          </Link>
          {userData?.role === 'admin' && (
            <a 
              href="#" 
              className={`nav-item ${requestsSidebarOpen ? 'active' : ''}`}
              onClick={handleClubRequestsClick}
            >
              <span className="nav-item-icon">🔔</span>
              <span>طلبات النوادي</span>
              {pendingRequestsCount > 0 && (
                <span className="nav-item-badge">{pendingRequestsCount}</span>
              )}
            </a>
          )}
          <Link 
            to="/settings" 
            className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={(e) => handleProtectedLink(e, '/settings')}
          >
            <span className="nav-item-icon">⚙️</span>
            <span>الإعدادات</span>
          </Link>
        </nav>

        {/* User Profile Section */}
        {currentUser ? (
          <div className="sidebar-user">
            <div className="user-avatar">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{userDisplayName}</span>
              <span className="user-role">{userRole}</span>
            </div>
          </div>
        ) : (
          <div className="sidebar-guest">
            <div className="guest-message">
              <p>سجل الدخول للوصول إلى جميع الميزات</p>
            </div>
            <div className="guest-actions">
              <Link 
                to="/login" 
                className="guest-btn guest-btn-primary"
                onClick={() => setSidebarOpen(false)}
              >
                تسجيل الدخول
              </Link>
              <Link 
                to="/account-type" 
                className="guest-btn guest-btn-secondary"
                onClick={() => setSidebarOpen(false)}
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="app-main">
        {children}
      </main>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <AuthPrompt 
          message="يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة"
          onClose={() => setShowAuthPrompt(false)}
        />
      )}

      {/* Admin Requests Sidebar */}
      {userData?.role === 'admin' && (
        <AdminRequestsSidebar 
          isOpen={requestsSidebarOpen} 
          onClose={() => setRequestsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

