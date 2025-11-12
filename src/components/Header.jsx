import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { searchUserSuggestions } from '../utils/search';
import './Header.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/u/${searchQuery.trim().toLowerCase()}`);
      setSearchQuery('');
      setOpen(false);
      setSuggestions([]);
      setHighlightIndex(-1);
    }
  };

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setOpen(false);
      setHighlightIndex(-1);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchUserSuggestions(searchQuery.trim(), 8);
        setSuggestions(results);
        setOpen(results.length > 0);
        setHighlightIndex(results.length ? 0 : -1);
      } catch {
        setSuggestions([]);
        setOpen(false);
        setHighlightIndex(-1);
      }
    }, 220);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!dropdownRef.current) return;
      if (
        dropdownRef.current.contains(e.target) ||
        (inputRef.current && inputRef.current.contains(e.target))
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const onKeyDown = (e) => {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        const sel = suggestions[highlightIndex];
        navigate(`/u/${(sel.username || '').toLowerCase()}`);
        setOpen(false);
        setSuggestions([]);
        setSearchQuery('');
        setHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-text">زمر</span>
        </Link>

        {/* Search Bar */}
        <form className="header-search" onSubmit={handleSearch} ref={dropdownRef}>
          <div className="search-wrapper">
            <button type="button" className="search-icon-btn">
              <svg width={17} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <input
              type="text"
              className="search-input"
              placeholder="ابحث عن مستخدم أو نادي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setOpen(!!suggestions.length)}
              onKeyDown={onKeyDown}
              ref={inputRef}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-reset"
                onClick={() => {
                  setSearchQuery('');
                  setOpen(false);
                  setSuggestions([]);
                  setHighlightIndex(-1);
                  if (inputRef.current) inputRef.current.focus();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {open && suggestions.length > 0 && (
            <div className="search-dropdown-header">
              {suggestions.map((s, idx) => (
                <button
                  type="button"
                  key={s.uid}
                  className={`search-item-header ${idx === highlightIndex ? 'active' : ''}`}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => {
                    navigate(`/u/${(s.username || '').toLowerCase()}`);
                    setOpen(false);
                    setSuggestions([]);
                    setSearchQuery('');
                    setHighlightIndex(-1);
                  }}
                >
                  <span className="search-avatar-header">
                    {(s.fullName?.[0] || s.username?.[0] || '?').toUpperCase()}
                  </span>
                  <span className="search-text-header">
                    <div className="search-name-header">{s.fullName || '—'}</div>
                    <div className="search-username-header">@{s.username}</div>
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* User Actions */}
        <div className="header-actions">
          {currentUser ? (
            <>
              <Link to="/profile" className="header-action-btn">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <button onClick={handleLogout} className="header-action-btn" title="تسجيل الخروج">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link">تسجيل الدخول</Link>
              <Link to="/account-type" className="header-btn-primary">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

