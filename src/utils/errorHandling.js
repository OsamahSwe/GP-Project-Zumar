// Firebase error message mapping utility
export function getFirebaseErrorMessage(error) {
  // Handle custom errors first
  if (error.message === 'USERNAME_EXISTS') {
    return 'This username is already taken. Please choose a different one.';
  }
  
  if (error.message === 'ADMIN_REQUEST_EXISTS') {
    return 'A request with this email already exists. Please wait for approval.';
  }
  
  if (error.message === 'CLUB_REQUEST_EXISTS') {
    return 'A club request with this email already exists. Please wait for approval.';
  }
  
  if (error.message === 'CLUB_NAME_REQUIRED') {
    return 'Club name is required and must be at least 3 characters.';
  }

  // Handle Firebase Auth error codes
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Try logging in instead.';
    
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    
    case 'auth/user-not-found':
      return 'No account found with this email or username.';
    
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email/username and password.';
    
    // Default fallback
    default:
      return 'An error occurred. Please try again.';
  }
}






