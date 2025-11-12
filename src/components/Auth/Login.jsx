import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { findUserByUsernameOrEmail, findApprovedAdminRequest, findApprovedClubRequest } from '../../utils/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '../../utils/errorHandling';
import './Auth.css';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateIdentifier = (identifier) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!identifier) return 'البريد الإلكتروني أو اسم المستخدم مطلوب';
    if (identifier.length > 254) return 'البريد الإلكتروني أو اسم المستخدم طويل جداً';
    if (identifier.includes('@') && !emailRegex.test(identifier)) {
      return 'يرجى إدخال بريد إلكتروني صحيح';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'كلمة المرور مطلوبة';
    return '';
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const identifierErr = validateIdentifier(identifier);
    const passwordErr = validatePassword(password);

    setIdentifierError(identifierErr);
    setPasswordError(passwordErr);

    if (identifierErr || passwordErr) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Try to find user by username or email
      let userData = await findUserByUsernameOrEmail(identifier);
      
      if (userData) {
        // User exists, try to login
        await login(userData.email, password);
        setSuccess('تم تسجيل الدخول بنجاح! مرحباً بك');
        setTimeout(() => {
          const from = new URLSearchParams(window.location.search).get('from') || '/';
          navigate(from);
        }, 1500);
      } else {
        // User not found, check for approved admin request
        const adminRequest = await findApprovedAdminRequest(identifier);
        
        if (adminRequest) {
          // Admin request is approved, create account and login
          try {
            // Try to create Firebase Auth account
            const userCredential = await createUserWithEmailAndPassword(auth, adminRequest.email, password);
            
            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: adminRequest.email,
              username: adminRequest.username,
              role: 'admin',
              approved: true,
              adminRequested: true,
              createdAt: serverTimestamp(),
            });
            
            setSuccess('تم تفعيل الحساب وتسجيل الدخول بنجاح! مرحباً بك');
            setTimeout(() => {
              const from = new URLSearchParams(window.location.search).get('from') || '/';
              navigate(from);
            }, 1500);
          } catch (authError) {
            // If account already exists in Firebase Auth, try to login
            if (authError.code === 'auth/email-already-in-use') {
              await login(adminRequest.email, password);
              
              // Check if user document exists, if not create it
              const userData = await findUserByUsernameOrEmail(adminRequest.email);
              if (!userData) {
                // Get current user after login
                const currentUser = auth.currentUser;
                if (currentUser) {
                  await setDoc(doc(db, 'users', currentUser.uid), {
                    email: adminRequest.email,
                    username: adminRequest.username,
                    role: 'admin',
                    approved: true,
                    adminRequested: true,
                    createdAt: serverTimestamp(),
                  });
                }
              }
              
              setSuccess('تم تسجيل الدخول بنجاح! مرحباً بك');
              setTimeout(() => {
                const from = new URLSearchParams(window.location.search).get('from') || '/';
                navigate(from);
              }, 1500);
            } else {
              throw authError;
            }
          }
        } else {
          // Check for approved club request
          const clubRequest = await findApprovedClubRequest(identifier);
          
          if (clubRequest) {
            // Club request is approved, create account and login
            try {
              // Try to create Firebase Auth account
              const userCredential = await createUserWithEmailAndPassword(auth, clubRequest.email, password);
              
              // Create user document in Firestore
              await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: clubRequest.email,
                username: clubRequest.username,
                role: 'organizer',
                approved: true,
                adminRequested: false,
                createdAt: serverTimestamp(),
              });
              
              setSuccess('تم تفعيل الحساب وتسجيل الدخول بنجاح! مرحباً بك');
              setTimeout(() => {
                const from = new URLSearchParams(window.location.search).get('from') || '/';
                navigate(from);
              }, 1500);
            } catch (authError) {
              // If account already exists in Firebase Auth, try to login
              if (authError.code === 'auth/email-already-in-use') {
                await login(clubRequest.email, password);
                
                // Check if user document exists, if not create it
                const userData = await findUserByUsernameOrEmail(clubRequest.email);
                if (!userData) {
                  // Get current user after login
                  const currentUser = auth.currentUser;
                  if (currentUser) {
                    await setDoc(doc(db, 'users', currentUser.uid), {
                      email: clubRequest.email,
                      username: clubRequest.username,
                      role: 'organizer',
                      approved: true,
                      adminRequested: false,
                      createdAt: serverTimestamp(),
                    });
                  }
                }
                
                setSuccess('تم تسجيل الدخول بنجاح! مرحباً بك');
                setTimeout(() => {
                  const from = new URLSearchParams(window.location.search).get('from') || '/';
                  navigate(from);
                }, 1500);
              } else {
                throw authError;
              }
            }
          } else {
            setError('لا يوجد حساب بهذا البريد الإلكتروني أو اسم المستخدم');
          }
        }
      }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
      console.error('Login error:', error);
    }

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <Link to="/" className="auth-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            العودة للرئيسية
          </Link>

          <div className="auth-header">
            <h1 className="auth-title">تسجيل الدخول</h1>
            <p className="auth-subtitle">أهلاً بعودتك! سجل الدخول للمتابعة</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-message auth-message-error">
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-message auth-message-success">
              ✅ {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">البريد الإلكتروني أو اسم المستخدم</label>
              <input
                type="text"
                className={`auth-input ${identifierError ? 'auth-input-error' : ''}`}
                placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setIdentifierError(validateIdentifier(e.target.value));
                }}
                required
              />
              {identifierError && (
                <div className="auth-error-text">{identifierError}</div>
              )}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">كلمة المرور</label>
              <input
                type="password"
                className={`auth-input ${passwordError ? 'auth-input-error' : ''}`}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(validatePassword(e.target.value));
                }}
                required
              />
              {passwordError && (
                <div className="auth-error-text">{passwordError}</div>
              )}
            </div>

            <div className="auth-form-options">
              <Link to="/password-reset" className="auth-link">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button auth-button-primary"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">ليس لديك حساب؟</p>
            <Link to="/account-type" className="auth-button auth-button-secondary">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-visual-icon">👋</div>
            <h2 className="auth-visual-title">أهلاً بعودتك!</h2>
            <p className="auth-visual-text">
              نحن سعداء جداً لوجودك هنا. من الرائع رؤيتك مرة أخرى.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
