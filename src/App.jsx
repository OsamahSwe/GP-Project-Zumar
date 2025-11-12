import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Homepage from './components/Homepage';
import Events from './components/Events';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import AccountTypeSelection from './components/Auth/AccountTypeSelection';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import EventDetail from './components/EventDetail';
import ProtectedRoute from './components/ProtectedRoute';
import PendingRequest from './components/Auth/PendingRequest';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
        <Routes>
          {/* Public routes - accessible to guests */}
          <Route path="/" element={<Homepage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/event/:eventId" element={<EventDetail />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/account-type" element={<AccountTypeSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending-request" element={<PendingRequest />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;