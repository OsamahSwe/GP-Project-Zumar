import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Fetch events from Firestore
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category (cultural, sports, technical, scientific)
 * @param {string} options.sortBy - Sort by field (latest, closest, popular)
 * @param {number} options.limitCount - Maximum number of events to fetch
 * @returns {Promise<Array>} Array of event objects
 */
export async function fetchEvents({ category = null, sortBy = 'latest', limitCount = 50 } = {}) {
  try {
    let eventsQuery = query(collection(db, 'events'));

    // Filter by category if provided
    if (category && category !== 'all') {
      eventsQuery = query(eventsQuery, where('category', '==', category));
    }

    // Sort by different criteria
    if (sortBy === 'latest') {
      eventsQuery = query(eventsQuery, orderBy('createdAt', 'desc'));
    } else if (sortBy === 'closest') {
      eventsQuery = query(eventsQuery, orderBy('eventDate', 'asc'));
    } else if (sortBy === 'popular') {
      eventsQuery = query(eventsQuery, orderBy('registeredCount', 'desc'));
    }

    // Limit results
    if (limitCount) {
      eventsQuery = query(eventsQuery, limit(limitCount));
    }

    const snapshot = await getDocs(eventsQuery);
    const events = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to readable date
        eventDate: data.eventDate?.toDate ? data.eventDate.toDate() : data.eventDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      });
    });

    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Fetch a single event by ID
 * @param {string} eventId - Event document ID
 * @returns {Promise<Object|null>} Event object or null if not found
 */
export async function fetchEventById(eventId) {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    
    if (eventDoc.exists()) {
      const data = eventDoc.data();
      return {
        id: eventDoc.id,
        ...data,
        eventDate: data.eventDate?.toDate ? data.eventDate.toDate() : data.eventDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

/**
 * Format event date for display
 * @param {Date} date - Event date
 * @returns {string} Formatted date string in Arabic
 */
export function formatEventDate(date) {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/**
 * Format event time for display
 * @param {Date} startDate - Event start date/time
 * @param {Date} endDate - Event end date/time
 * @returns {string} Formatted time range
 */
export function formatEventTime(startDate, endDate) {
  if (!startDate) return '';
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const startHours = start.getHours();
  const startMinutes = start.getMinutes();
  const startPeriod = startHours >= 12 ? 'مساءً' : 'صباحاً';
  const startHour12 = startHours > 12 ? startHours - 12 : startHours === 0 ? 12 : startHours;
  
  if (endDate) {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const endHours = end.getHours();
    const endMinutes = end.getMinutes();
    const endPeriod = endHours >= 12 ? 'مساءً' : 'صباحاً';
    const endHour12 = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
    
    return `${startHour12}:${String(startMinutes).padStart(2, '0')} - ${endHour12}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
  }
  
  return `${startHour12}:${String(startMinutes).padStart(2, '0')} ${startPeriod}`;
}

