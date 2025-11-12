import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function findUserByUsernameOrEmail(identifier) {
  try {
    // First try to find by email
    const emailQuery = query(collection(db, 'users'), where('email', '==', identifier));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      const d = emailSnapshot.docs[0];
      return { uid: d.id, ...d.data() };
    }
    
    // Then try to find by username (case-insensitive)
    const usernameQuery = query(collection(db, 'users'), where('username', '==', identifier.toLowerCase()));
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
     const d = usernameSnapshot.docs[0];
     return { uid: d.id, ...d.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

// Check if there's an approved admin request
export async function findApprovedAdminRequest(identifier) {
  try {
    // Check by email
    const emailQuery = query(
      collection(db, 'adminRequests'), 
      where('email', '==', identifier),
      where('status', '==', 'approved')
    );
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      const d = emailSnapshot.docs[0];
      return { requestId: d.id, ...d.data() };
    }
    
    // Check by username
    const usernameQuery = query(
      collection(db, 'adminRequests'),
      where('username', '==', identifier.toLowerCase()),
      where('status', '==', 'approved')
    );
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
      const d = usernameSnapshot.docs[0];
      return { requestId: d.id, ...d.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding admin request:', error);
    return null;
  }
}

// Check if there's an approved club request
export async function findApprovedClubRequest(identifier) {
  try {
    // Check by email
    const emailQuery = query(
      collection(db, 'clubRequests'), 
      where('email', '==', identifier),
      where('status', '==', 'approved')
    );
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      const d = emailSnapshot.docs[0];
      return { requestId: d.id, ...d.data() };
    }
    
    // Check by username
    const usernameQuery = query(
      collection(db, 'clubRequests'),
      where('username', '==', identifier.toLowerCase()),
      where('status', '==', 'approved')
    );
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
      const d = usernameSnapshot.docs[0];
      return { requestId: d.id, ...d.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding club request:', error);
    return null;
  }
}

export async function checkUsernameAvailability(username) {
  try {
    if (!username || username.length < 3) {
      return { available: false, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل', checking: false };
    }
    
    const lowerUsername = username.toLowerCase();
    
    // Check in users collection
    const usernameQuery = query(collection(db, 'users'), where('username', '==', lowerUsername));
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
      return { available: false, message: 'اسم المستخدم مستخدم بالفعل', checking: false };
    }
    
    // Check in clubRequests collection
    const clubRequestsQuery = query(collection(db, 'clubRequests'), where('username', '==', lowerUsername));
    const clubRequestsSnapshot = await getDocs(clubRequestsQuery);
    
    if (!clubRequestsSnapshot.empty) {
      const requestData = clubRequestsSnapshot.docs[0].data();
      if (requestData.status === 'pending') {
        return { available: false, message: 'اسم المستخدم لديه طلب معلق', checking: false };
      } else if (requestData.status === 'approved') {
        return { available: false, message: 'اسم المستخدم مستخدم بالفعل', checking: false };
      }
      // Rejected requests can use the username again
    }
    
    // Check in adminRequests collection
    const adminRequestsQuery = query(collection(db, 'adminRequests'), where('username', '==', lowerUsername));
    const adminRequestsSnapshot = await getDocs(adminRequestsQuery);
    
    if (!adminRequestsSnapshot.empty) {
      const requestData = adminRequestsSnapshot.docs[0].data();
      if (requestData.status === 'pending') {
        return { available: false, message: 'اسم المستخدم لديه طلب معلق', checking: false };
      } else if (requestData.status === 'approved') {
        return { available: false, message: 'اسم المستخدم مستخدم بالفعل', checking: false };
      }
      // Rejected requests can use the username again
    }
    
    // Username is available
    return { available: true, message: 'اسم المستخدم متاح', checking: false };
  } catch (error) {
    console.error('Error checking username availability:', error);
    return { available: false, message: 'خطأ في التحقق من اسم المستخدم', checking: false };
  }
}






