import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getFirebaseErrorMessage } from '../../utils/errorHandling';
import { checkUsernameAvailability } from '../../utils/auth';
import { checkClubRequestEmailAvailability } from '../../utils/clubRequests';
import './Auth.css';

export default function Signup() {
  const location = useLocation();
  const accountType = location.state?.accountType || 'student';
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [clubName, setClubName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [clubNameError, setClubNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ available: null, message: '', checking: false });
  const [emailStatus, setEmailStatus] = useState({ available: null, message: '', checking: false });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateEmailFormat = (email) => {
    if (!email || email.trim().length === 0) {
      return 'البريد الإلكتروني مطلوب';
    }
    
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      return 'يرجى إدخال بريد إلكتروني صحيح';
    }
    if (trimmedEmail.length > 254) {
      return 'البريد الإلكتروني طويل جداً';
    }
    
    return '';
  };

  const validateEmail = (email) => {
    const formatErr = validateEmailFormat(email);
    if (formatErr) return formatErr;
    
    // For organizer accounts, only show error if emailStatus has been checked and is unavailable
    // Don't show error if status is null (not checked yet) or checking
    if (accountType === 'organizer' && emailStatus.available === false && emailStatus.message) {
      return emailStatus.message;
    }
    
    return '';
  };

  // Real-time username availability check
  useEffect(() => {
    const checkUsername = async () => {
      if (username && username.trim()) {
        const trimmedUsername = username.trim();
        const usernameFormatErr = validateUsernameFormat(trimmedUsername);
        
        if (usernameFormatErr) {
          setUsernameStatus({ available: false, message: usernameFormatErr, checking: false });
          setUsernameError(usernameFormatErr);
          return;
        }
        
        // Format is valid, check availability
        try {
          const result = await checkUsernameAvailability(trimmedUsername);
          setUsernameStatus(result);
          // Update usernameError with the result
          if (result.available === false && result.message) {
            setUsernameError(result.message);
          } else if (result.available === true) {
            setUsernameError(''); // Clear error if available
          }
        } catch (error) {
          console.error('Username validation error:', error);
          const errorMsg = 'خطأ في التحقق من اسم المستخدم';
          setUsernameStatus({ available: false, message: errorMsg, checking: false });
          setUsernameError(errorMsg);
        }
      } else {
        setUsernameStatus({ available: null, message: '', checking: false });
        setUsernameError('');
      }
    };

    const timeoutId = setTimeout(checkUsername, 300);
    return () => clearTimeout(timeoutId);
  }, [username]);

  // Real-time email validation for club accounts
  useEffect(() => {
    const checkEmail = async () => {
      if (accountType === 'organizer' && email && email.trim()) {
        const trimmedEmail = email.trim();
        const emailFormatErr = validateEmailFormat(trimmedEmail);
        
        if (emailFormatErr) {
          // Format error - clear status so format error shows instead
          setEmailStatus({ available: null, message: '', checking: false });
          setEmailError(emailFormatErr);
          return;
        }

        // Format is valid, check availability
        try {
          const result = await checkClubRequestEmailAvailability(trimmedEmail);
          setEmailStatus(result);
          // Update emailError with the result - this is the source of truth
          if (result.available === false && result.message) {
            setEmailError(result.message);
          } else if (result.available === true) {
            setEmailError(''); // Clear error if available
          }
        } catch (error) {
          console.error('Email validation error:', error);
          const errorMsg = 'خطأ في التحقق من البريد الإلكتروني';
          setEmailStatus({ available: false, message: errorMsg, checking: false });
          setEmailError(errorMsg);
        }
      } else if (accountType === 'organizer' && !email.trim()) {
        // Empty email - clear status
        setEmailStatus({ available: null, message: '', checking: false });
        setEmailError('');
      } else {
        setEmailStatus({ available: null, message: '', checking: false });
      }
    };

    const timeoutId = setTimeout(checkEmail, 300);
    return () => clearTimeout(timeoutId);
  }, [email, accountType]);

  const validateUsernameFormat = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!username || username.trim().length === 0) {
      return 'اسم المستخدم مطلوب';
    }
    if (username.length < 3) {
      return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }
    if (username.length > 20) {
      return 'اسم المستخدم يجب ألا يتجاوز 20 حرفاً';
    }
    if (!usernameRegex.test(username)) {
      return 'اسم المستخدم يمكن أن يحتوي فقط على أحرف وأرقام وشرطة سفلية';
    }
    return '';
  };

  const validateUsername = (username) => {
    const formatErr = validateUsernameFormat(username);
    if (formatErr) return formatErr;
    
    // Check username status if available
    if (usernameStatus.available === false && usernameStatus.message) {
      return usernameStatus.message;
    }
    
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'كلمة المرور مطلوبة';
    if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (password.length > 128) return 'كلمة المرور طويلة جداً';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase) return 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
    if (!hasLowerCase) return 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل';
    if (!hasNumbers) return 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
    
    return '';
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return 'يرجى تأكيد كلمة المرور';
    if (password !== confirmPassword) return 'كلمات المرور غير متطابقة';
    return '';
  };

  const validateClubName = (clubName) => {
    if (accountType !== 'organizer') return '';
    if (!clubName) return 'اسم النادي مطلوب';
    if (clubName.length < 3) return 'اسم النادي يجب أن يكون 3 أحرف على الأقل';
    if (clubName.length > 50) return 'اسم النادي يجب ألا يتجاوز 50 حرفاً';
    return '';
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const usernameErr = validateUsername(username);
    const clubNameErr = validateClubName(clubName);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword);

    setEmailError(emailErr);
    setUsernameError(usernameErr);
    setClubNameError(clubNameErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    // For organizer accounts, also check email status
    if (accountType === 'organizer' && emailStatus.available === false) {
      setEmailError(emailStatus.message);
      return;
    }

    // Check username status
    if (usernameStatus.available === false && usernameStatus.message) {
      setUsernameError(usernameStatus.message);
      return;
    }

    if (emailErr || usernameErr || clubNameErr || passwordErr || confirmPasswordErr) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      const result = await signup(email, password, username, accountType, clubName);
      
      // If admin or organizer signup, redirect to pending request page
      if (accountType === 'admin' || accountType === 'organizer') {
        navigate('/pending-request', { state: { requestType: accountType } });
      } else {
        setSuccess('تم إنشاء الحساب بنجاح! مرحباً بك');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
      console.error('Signup error:', error);
    }

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <Link to="/account-type" className="auth-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            العودة لاختيار نوع الحساب
          </Link>

          <div className="auth-header">
            <h1 className="auth-title">
              إنشاء حساب {accountType === 'student' ? 'طالب' : accountType === 'organizer' ? 'نادي' : 'مدير'}
            </h1>
            <p className="auth-subtitle">
              {accountType === 'student' 
                ? 'أدخل بياناتك لإنشاء حساب طالب واكتشاف النوادي'
                : accountType === 'organizer'
                ? 'أدخل بياناتك لإنشاء حساب نادي وإدارة النوادي'
                : 'أدخل بياناتك لطلب إنشاء حساب مدير (يتطلب الموافقة)'
              }
            </p>
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
              <label className="auth-label">البريد الإلكتروني</label>
              <input
                type="email"
                className={`auth-input ${
                  emailError 
                    ? 'auth-input-error' 
                    : accountType === 'organizer' && emailStatus.available === true 
                      ? 'auth-input-success' 
                      : ''
                }`}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setEmail(newEmail);
                  // Only validate format immediately, availability will be checked async in useEffect
                  const formatErr = validateEmailFormat(newEmail);
                  if (formatErr) {
                    setEmailError(formatErr);
                  } else {
                    // Format is valid, clear error and let useEffect handle availability check
                    setEmailError('');
                  }
                }}
                required
              />
              {accountType === 'organizer' && emailStatus.available === true && !emailError && (
                <div className="auth-success-text">
                  ✅ {emailStatus.message}
                </div>
              )}
              {emailError && (
                <div className="auth-error-text">{emailError}</div>
              )}
            </div>

            <div className="auth-form-group">
              <label className="auth-label">اسم المستخدم</label>
              <input
                type="text"
                className={`auth-input ${
                  usernameError 
                    ? 'auth-input-error' 
                    : usernameStatus.available === true 
                      ? 'auth-input-success' 
                      : ''
                }`}
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => {
                  const newUsername = e.target.value;
                  setUsername(newUsername);
                  // Only validate format immediately, availability will be checked async in useEffect
                  const formatErr = validateUsernameFormat(newUsername);
                  if (formatErr) {
                    setUsernameError(formatErr);
                  } else {
                    // Format is valid, clear error and let useEffect handle availability check
                    setUsernameError('');
                  }
                }}
                required
              />
              {usernameStatus.available === true && !usernameError && (
                <div className="auth-success-text">
                  ✅ {usernameStatus.message}
                </div>
              )}
              {usernameError && (
                <div className="auth-error-text">{usernameError}</div>
              )}
            </div>

            {accountType === 'organizer' && (
              <div className="auth-form-group">
                <label className="auth-label">اسم النادي</label>
                <input
                  type="text"
                  className={`auth-input ${clubNameError ? 'auth-input-error' : ''}`}
                  placeholder="أدخل اسم النادي"
                  value={clubName}
                  onChange={(e) => {
                    setClubName(e.target.value);
                    setClubNameError(validateClubName(e.target.value));
                  }}
                  required
                />
                {clubNameError && (
                  <div className="auth-error-text">{clubNameError}</div>
                )}
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-label">كلمة المرور</label>
              <input
                type="password"
                className={`auth-input ${passwordError ? 'auth-input-error' : ''}`}
                placeholder="كلمة المرور"
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

            <div className="auth-form-group">
              <label className="auth-label">تأكيد كلمة المرور</label>
              <input
                type="password"
                className={`auth-input ${confirmPasswordError ? 'auth-input-error' : ''}`}
                placeholder="أعد إدخال كلمة المرور"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError(validateConfirmPassword(e.target.value));
                }}
                required
              />
              {confirmPasswordError && (
                <div className="auth-error-text">{confirmPasswordError}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button auth-button-primary"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">لديك حساب بالفعل؟</p>
            <Link to="/login" className="auth-button auth-button-secondary">
              تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="auth-visual-section">
          <div className="auth-visual-content">
            <div className="auth-visual-icon">🎉</div>
            <h2 className="auth-visual-title">ابدأ رحلتك</h2>
            <p className="auth-visual-text">
              انضم إلى مجتمع النوادي الجامعية وابدأ في اكتشاف الأنشطة والفعاليات المثيرة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
