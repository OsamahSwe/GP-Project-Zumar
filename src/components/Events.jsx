import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUserSuggestions } from '../utils/search';
import { fetchEvents, formatEventDate, formatEventTime } from '../utils/events';
import Layout from './Layout';
import './Events.css';

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch events from Firestore
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const category = activeFilter === 'all' ? null : activeFilter;
        const fetchedEvents = await fetchEvents({ category, sortBy, limitCount: 50 });
        
        // Transform Firestore events to match UI format
        const transformedEvents = fetchedEvents.map(event => ({
          id: event.id,
          title: event.title || event.name || 'فعالية',
          club: event.clubName || event.club || 'نادي',
          clubType: event.category || event.clubType || 'cultural',
          date: formatEventDate(event.eventDate),
          time: formatEventTime(event.startTime, event.endTime),
          location: event.location || event.venue || 'موقع غير محدد',
          seats: event.capacity ? (event.capacity - (event.registeredCount || 0)) : 0,
          image: event.image || event.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop',
          eventDate: event.eventDate,
          description: event.description || '',
        }));
        
        // If no events from Firestore, use sample data as fallback
        if (transformedEvents.length === 0) {
          setEvents(getSampleEvents());
        } else {
          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        // Fallback to sample data on error
        setEvents(getSampleEvents());
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [activeFilter, sortBy]);

  // Sample events as fallback
  function getSampleEvents() {
    return [
      {
        id: 1,
        title: 'أمسية شعرية',
        club: 'النادي الثقافي',
        clubType: 'cultural',
        date: '20 ديسمبر',
        time: '7:00 - 9:00 مساءً',
        location: 'المسرح الثقافي',
        seats: 40,
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop',
      },
      {
        id: 2,
        title: 'بطولة كرة القدم',
        club: 'النادي الرياضي',
        clubType: 'sports',
        date: '18 ديسمبر',
        time: '4:00 - 6:00 مساءً',
        location: 'الملعب الرئيسي',
        seats: 5,
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop',
      },
      {
        id: 3,
        title: 'مؤتمر الذكاء الاصطناعي',
        club: 'نادي التقنية',
        clubType: 'technical',
        date: '15 ديسمبر',
        time: '2:00 - 5:00 مساءً',
        location: 'قاعة المؤتمرات الكبرى',
        seats: 25,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
      },
      {
        id: 4,
        title: 'مسابقة الأفكار الريادية',
        club: 'نادي ريادة الأعمال',
        clubType: 'technical',
        date: '28 ديسمبر',
        time: '1:00 - 4:00 مساءً',
        location: 'مركز الابتكار',
        seats: 15,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
      },
      {
        id: 5,
        title: 'معرض الفن التشكيلي',
        club: 'النادي الفني',
        clubType: 'cultural',
        date: '25 ديسمبر',
        time: '3:00 - 6:00 مساءً',
        location: 'صالة المعارض',
        seats: 30,
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
      },
      {
        id: 6,
        title: 'ورشة الكيمياء التطبيقية',
        club: 'النادي العلمي',
        clubType: 'scientific',
        date: '22 ديسمبر',
        time: '10:00 - 12:00 صباحاً',
        location: 'مختبر الكيمياء 201',
        seats: 20,
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop',
      },
    ];
  }

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

  // Filter events based on active filter
  const filteredEvents = events.filter((event) => {
    if (activeFilter === 'all') return true;
    return event.clubType === activeFilter;
  });

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <Layout>
      <div className="events-page">
        {/* Header */}
        <div className="page-header-modern">
          <div className="header-content-modern">
            <h1 className="page-title-modern">اكتشف أندية الجامعات</h1>
            <p className="page-subtitle-modern">
              انضم إلى الأنشطة والفعاليات الطلابية في جامعتك
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section-modern">
          <form onSubmit={handleSearch} ref={dropdownRef} className="search-form-modern">
            <div className="search-wrapper-modern">
              <svg className="search-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <input
                type="text"
                className="search-bar-modern"
                placeholder="ابحث عن فعالية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setOpen(!!suggestions.length)}
                onKeyDown={onKeyDown}
                ref={inputRef}
              />
              <svg className="search-icon-right" fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={handleSearch}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {open && suggestions.length > 0 && (
              <div className="search-dropdown-modern">
                {suggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={s.uid}
                    className={`search-item-modern ${idx === highlightIndex ? 'active' : ''}`}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onClick={() => {
                      navigate(`/u/${(s.username || '').toLowerCase()}`);
                      setOpen(false);
                      setSuggestions([]);
                      setSearchQuery('');
                      setHighlightIndex(-1);
                    }}
                  >
                    <span className="search-avatar-modern">
                      {(s.fullName?.[0] || s.username?.[0] || '?').toUpperCase()}
                    </span>
                    <span className="search-text-modern">
                      <div className="search-name-modern">{s.fullName || '—'}</div>
                      <div className="search-username-modern">@{s.username}</div>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Filters and Sort */}
        <div className="filters-section-modern">
          <div className="filter-buttons-modern">
            <button
              className={`filter-btn-modern ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              جميع الفعاليات
            </button>
            <button
              className={`filter-btn-modern ${activeFilter === 'cultural' ? 'active' : ''}`}
              onClick={() => setActiveFilter('cultural')}
            >
              ثقافية
            </button>
            <button
              className={`filter-btn-modern ${activeFilter === 'sports' ? 'active' : ''}`}
              onClick={() => setActiveFilter('sports')}
            >
              رياضية
            </button>
            <button
              className={`filter-btn-modern ${activeFilter === 'technical' ? 'active' : ''}`}
              onClick={() => setActiveFilter('technical')}
            >
              تقنية
            </button>
            <button
              className={`filter-btn-modern ${activeFilter === 'scientific' ? 'active' : ''}`}
              onClick={() => setActiveFilter('scientific')}
            >
              علمية
            </button>
          </div>

          <select
            className="sort-dropdown-modern"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">ترتيب حسب: الأحدث</option>
            <option value="closest">ترتيب حسب: الأقرب زمنياً</option>
            <option value="popular">ترتيب حسب: الأكثر شعبية</option>
          </select>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="loading-state-modern">
            <div className="loading-spinner-modern">⏳</div>
            <p>جاري تحميل الفعاليات...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon-modern">📅</div>
            <p>لا توجد فعاليات متاحة حالياً</p>
          </div>
        ) : (
          <div className="events-grid-modern">
            {filteredEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="event-card-modern"
                onClick={() => handleEventClick(event.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="event-image-wrapper-modern">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="event-image-modern"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="event-content-modern">
                  <div className="event-date-modern">{event.date}</div>
                  <span className={`event-club-modern ${event.clubType}`}>
                    {event.club}
                  </span>
                  <h3 className="event-title-modern">{event.title}</h3>
                  <div className="event-details-modern">
                    <div className="event-detail-item-modern">
                      <svg className="event-detail-icon-modern" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail-item-modern">
                      <svg className="event-detail-icon-modern" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    <div className="event-detail-item-modern">
                      <svg className="event-detail-icon-modern" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{event.seats} مقعد متبقي</span>
                    </div>
                  </div>
                  <button 
                    className="event-button-modern"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event.id);
                    }}
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

