import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * Fetch all pending club requests
 * @returns {Promise<Array>} Array of club request objects
 */
export async function fetchPendingClubRequests() {
  try {
    const requestsRef = collection(db, 'clubRequests');
    // Remove orderBy to avoid Firestore index requirement
    // We'll sort manually instead
    const q = query(
      requestsRef,
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    
    const requests = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      });
    });
    
    // Sort manually by createdAt (descending - newest first)
    requests.sort((a, b) => {
      const aTime = a.createdAt?.getTime ? a.createdAt.getTime() : (a.createdAt || 0);
      const bTime = b.createdAt?.getTime ? b.createdAt.getTime() : (b.createdAt || 0);
      return bTime - aTime; // Descending order
    });
    
    return requests;
  } catch (error) {
    console.error('Error fetching club requests:', error);
    return [];
  }
}

/**
 * Approve a club request
 * @param {string} requestId - The request document ID
 * @param {string} approvedBy - Admin user ID who approved
 * @returns {Promise<Object>} Created user credential
 */
export async function approveClubRequest(requestId, approvedBy) {
  try {
    const requestRef = doc(db, 'clubRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      requestData.email,
      requestData.password
    );
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: requestData.email,
      username: requestData.username,
      role: 'organizer',
      approved: true,
      adminRequested: false,
      createdAt: serverTimestamp(),
    });
    
    // Create club document
    const clubRef = doc(collection(db, 'clubs'));
    await setDoc(clubRef, {
      name: requestData.clubName,
      organizerId: userCredential.user.uid,
      organizerUsername: requestData.username,
      organizerEmail: requestData.email,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: approvedBy,
      userId: userCredential.user.uid,
      clubId: clubRef.id,
    });
    
    return { userCredential, clubId: clubRef.id };
  } catch (error) {
    console.error('Error approving club request:', error);
    throw error;
  }
}

/**
 * Reject a club request
 * @param {string} requestId - The request document ID
 * @param {string} rejectedBy - Admin user ID who rejected
 * @param {string} reason - Optional rejection reason
 */
export async function rejectClubRequest(requestId, rejectedBy, reason = '') {
  try {
    const requestRef = doc(db, 'clubRequests', requestId);
    
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: rejectedBy,
      rejectionReason: reason,
    });
  } catch (error) {
    console.error('Error rejecting club request:', error);
    throw error;
  }
}

/**
 * Check if email already exists in club requests (pending or approved)
 * @param {string} email - Email to check
 * @returns {Promise<Object>} Object with available status and message
 */
export async function checkClubRequestEmailAvailability(email) {
  try {
    if (!email || email.trim().length === 0) {
      return { available: null, message: '', checking: false };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { available: null, message: '', checking: false };
    }

    // Check if email exists in clubRequests (any status)
    const requestsRef = collection(db, 'clubRequests');
    const emailQuery = query(requestsRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      // Check the status of the request
      const requestData = emailSnapshot.docs[0].data();
      if (requestData.status === 'pending') {
        return {
          available: false,
          message: 'هذا البريد الإلكتروني لديه طلب معلق. يرجى انتظار الموافقة',
          checking: false
        };
      } else if (requestData.status === 'approved') {
        return {
          available: false,
          message: 'هذا البريد الإلكتروني تم الموافقة عليه مسبقاً',
          checking: false
        };
      } else {
        // Rejected - can be used again
        return {
          available: true,
          message: 'البريد الإلكتروني متاح',
          checking: false
        };
      }
    }

    // Email not found in club requests - check if it exists in users collection
    const { findUserByUsernameOrEmail } = await import('./auth');
    const existingUser = await findUserByUsernameOrEmail(email);
    
    if (existingUser) {
      return {
        available: false,
        message: 'هذا البريد الإلكتروني مسجل بالفعل',
        checking: false
      };
    }

    return {
      available: true,
      message: 'البريد الإلكتروني متاح',
      checking: false
    };
  } catch (error) {
    console.error('Error checking email availability:', error);
    return {
      available: false,
      message: 'خطأ في التحقق من البريد الإلكتروني',
      checking: false
    };
  }
}

