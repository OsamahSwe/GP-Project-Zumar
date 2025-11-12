import { collection, getDocs, limit, orderBy, query, startAt, endAt } from 'firebase/firestore';
import { db } from '../config/firebase';

// Search users by username or fullName prefix (case-insensitive for username)
export async function searchUserSuggestions(term, max = 8) {
  const q = (term || '').trim();
  if (!q) return [];

  const lower = q.toLowerCase();
  const end = lower + '\uf8ff';

  // Username is stored lowercase in your profile save
  const usernameQuery = query(
    collection(db, 'users'),
    orderBy('username'),
    startAt(lower),
    endAt(end),
    limit(Math.max(4, Math.floor(max / 2)))
  );

  // Full name search (best-effort; assumes Arabic/Latin names stored as-is)
  // Firestore is case-sensitive; we use prefix match as-is for now
  const fullNameQuery = query(
    collection(db, 'users'),
    orderBy('fullName'),
    startAt(q),
    endAt(q + '\uf8ff'),
    limit(Math.max(4, Math.ceil(max / 2)))
  );

  const [userSnap, nameSnap] = await Promise.all([
    getDocs(usernameQuery).catch(() => ({ empty: true, docs: [] })),
    getDocs(fullNameQuery).catch(() => ({ empty: true, docs: [] })),
  ]);

  const byUsername = userSnap.empty
    ? []
    : userSnap.docs.map(d => ({ uid: d.id, ...d.data(), _score: 2 }));
  const byFullName = nameSnap.empty
    ? []
    : nameSnap.docs.map(d => ({ uid: d.id, ...d.data(), _score: 1 }));

  const merged = [...byUsername, ...byFullName];
  const seen = new Set();
  const unique = [];
  for (const u of merged) {
    if (seen.has(u.uid)) continue;
    seen.add(u.uid);
    unique.push(u);
  }

  // Sort: username matches first, then by fullName then username alphabetically
  unique.sort((a, b) => (b._score - a._score) || ((a.fullName || '').localeCompare(b.fullName || '')) || ((a.username || '').localeCompare(b.username || '')));

  return unique.slice(0, max).map(({ _score, ...rest }) => rest);
}




