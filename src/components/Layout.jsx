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
            <span className="nav-item-icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 1024 1024"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 0 0-44.4 0L77.5 505a63.9 63.9 0 0 0-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0 0 18.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z"></path>
              </svg>
            </span>
            <span>الرئيسية</span>
          </Link>
          <Link 
            to="/events" 
            className={`nav-item ${isActive('/events') ? 'active' : ''}`} 
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-item-icon">
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
            </span>
            <span>البحث عن الفعاليات</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`} 
            onClick={(e) => handleProtectedLink(e, '/profile')}
          >
            <span className="nav-item-icon">
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
            </span>
            <span>الملف الشخصي</span>
          </Link>
          <Link 
            to="/my-clubs" 
            className={`nav-item ${isActive('/my-clubs') ? 'active' : ''}`}
            onClick={(e) => handleProtectedLink(e, '/my-clubs')}
          >
            <span className="nav-item-icon">
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
            </span>
            <span>أنديتك</span>
          </Link>
          {userData?.role === 'admin' && (
            <a 
              href="#" 
              className={`nav-item ${requestsSidebarOpen ? 'active' : ''}`}
              onClick={handleClubRequestsClick}
            >
              <span className="nav-item-icon">
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </span>
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
            <span className="nav-item-icon">
              <svg
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                stroke="currentColor"
              >
                <path
                  d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z"
                ></path>
                <path
                  d="m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z"
                ></path>
              </svg>
            </span>
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

