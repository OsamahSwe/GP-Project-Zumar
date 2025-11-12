import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { checkUsernameAvailability } from '../utils/auth';
import Layout from './Layout';
import './Profile.css';

export default function Profile() {
  const { userData, refreshUserData, currentUser } = useAuth();
  const [success, setSuccess] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ available: null, message: '', checking: false });
  const [profileData, setProfileData] = useState({
    fullName: userData?.fullName || '',
    username: userData?.username || '',
    email: userData?.email || '',
    major: userData?.major || '',
    academicYear: userData?.academicYear || '',
    bio: userData?.bio || '',
    skills: userData?.skills || [],
    interests: userData?.interests || []
  });

  // Update profileData when userData changes
  useEffect(() => {
    if (userData) {
      setProfileData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        email: userData.email || '',
        major: userData.major || '',
        academicYear: userData.academicYear || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        interests: userData.interests || []
      });
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Always validate username when it changes
    if (field === 'username') {
      setUsernameError(validateUsername(value));
    }
  };

  // Username validation function
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be no more than 20 characters';
    if (!usernameRegex.test(username)) return 'Username can only contain letters, numbers, and underscores';
    
    // Check availability if username is different from current (case-insensitive)
    if (username.toLowerCase() !== userData?.username?.toLowerCase()) {
      if (usernameStatus.checking) return '';
      if (usernameStatus.available === false) return usernameStatus.message;
    }
    
    return '';
  };

  // Real-time username availability checking
  useEffect(() => {
    const checkUsername = async () => {
      // Check if username is different from current AND has valid length
      if (profileData.username.length >= 3 && 
          profileData.username.toLowerCase() !== userData?.username?.toLowerCase()) {
        setUsernameStatus(prev => ({ ...prev, checking: true }));
        try {
          const result = await checkUsernameAvailability(profileData.username.toLowerCase());
          setUsernameStatus(result);
        } catch (error) {
          setUsernameStatus({ available: false, message: 'Error checking username', checking: false });
        }
      } else if (profileData.username.length > 0 && profileData.username.length < 3) {
        setUsernameStatus({ available: false, message: 'Username must be at least 3 characters', checking: false });
      } else {
        setUsernameStatus({ available: null, message: '', checking: false });
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [profileData.username, userData?.username]);

  const handleSave = async () => {
    try {
      // Check if currentUser exists (it has the uid)
      if (!currentUser || !currentUser.uid) {
        setSuccess('خطأ: بيانات المستخدم غير متوفرة');
        return;
      }

      // Validate username if it changed (case-insensitive comparison)
      if (profileData.username.toLowerCase() !== userData?.username?.toLowerCase()) {
        const usernameErr = validateUsername(profileData.username);
        if (usernameErr) {
          setUsernameError(usernameErr);
          return;
        }
        if (usernameStatus.available === false) {
          setUsernameError('Username is not available');
          return;
        }
      }

      // Clean profileData to remove undefined values
      const cleanProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([key, value]) => value !== undefined && value !== null)
      );

      // Convert username to lowercase before saving
      if (cleanProfileData.username) {
        cleanProfileData.username = cleanProfileData.username.toLowerCase();
      }

      // Save to Firebase using currentUser.uid
      const userRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userRef, {
        ...cleanProfileData,
        updatedAt: new Date()
      });

      // Refresh user data
      await refreshUserData();

      setSuccess('تم حفظ التغييرات بنجاح!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSuccess('حدث خطأ في حفظ التغييرات. حاول مرة أخرى.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const addSkill = () => {
    const newSkill = prompt('أضف مهارة جديدة:');
    if (newSkill) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
  };

  const addInterest = () => {
    const newInterest = prompt('أضف اهتمام جديد:');
    if (newInterest) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest]
      }));
    }
  };

  const removeSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const removeInterest = (index) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  return (
    <Layout>
      <div className="profile-page-modern">
        {/* Page Header */}
        <div className="profile-header-modern">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar-modern">
                {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="profile-header-info">
                <h1 className="profile-title-modern">الملف الشخصي</h1>
                <p className="profile-subtitle-modern">إدارة معلوماتك الشخصية والإعدادات</p>
              </div>
            </div>
            <div className="profile-header-actions-top">
              <button 
                className="btn-modern btn-save-modern"
                onClick={handleSave}
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className={`success-message-modern ${success.includes('خطأ') ? 'error' : ''}`}>
            {success.includes('خطأ') ? '❌' : '✅'} {success}
          </div>
        )}

        {/* Username Error */}
        {usernameError && (
          <div className="error-message-modern">
            ⚠️ {usernameError}
          </div>
        )}

        {/* Username Status */}
        {usernameStatus.checking && (
          <div className="info-message-modern">
            ⏳ جاري التحقق من اسم المستخدم...
          </div>
        )}

        {/* Content Grid */}
        <div className="profile-content-modern">
          <div className="profile-grid-modern">
            {/* Left Column */}
            <div className="profile-column-modern">
              {/* Personal Info Card */}
              <div className="profile-card-modern">
                <div className="card-header-modern">
                  <h2 className="card-title-modern">المعلومات الشخصية</h2>
                </div>
                <div className="card-body-modern">
                  <div className="form-group-modern">
                    <label className="form-label-modern">الاسم الكامل</label>
                    <input 
                      className="form-input-modern" 
                      type="text" 
                      value={profileData.fullName} 
                      onChange={(e) => handleInputChange('fullName', e.target.value)} 
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div className="form-group-modern">
                    <label className="form-label-modern">اسم المستخدم</label>
                    <input 
                      className="form-input-modern" 
                      type="text" 
                      value={profileData.username} 
                      onChange={(e) => handleInputChange('username', e.target.value)} 
                      placeholder="اسم المستخدم"
                    />
                  </div>
                  <div className="form-group-modern">
                    <label className="form-label-modern">البريد الإلكتروني</label>
                    <input 
                      className="form-input-modern" 
                      type="email" 
                      value={profileData.email} 
                      disabled 
                      placeholder="البريد الإلكتروني"
                    />
                  </div>
                  <div className="form-group-modern">
                    <label className="form-label-modern">نبذة</label>
                    <textarea 
                      className="form-textarea-modern" 
                      value={profileData.bio} 
                      onChange={(e) => handleInputChange('bio', e.target.value)} 
                      placeholder="اكتب نبذة قصيرة عنك"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Education Card */}
              <div className="profile-card-modern">
                <div className="card-header-modern">
                  <h2 className="card-title-modern">التعليم</h2>
                </div>
                <div className="card-body-modern">
                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label className="form-label-modern">السنة الدراسية</label>
                      <select 
                        className="form-input-modern" 
                        value={profileData.academicYear} 
                        onChange={(e) => handleInputChange('academicYear', e.target.value)}
                      >
                        <option value="">اختر السنة</option>
                        <option value="الأولى">الأولى</option>
                        <option value="الثانية">الثانية</option>
                        <option value="الثالثة">الثالثة</option>
                        <option value="الرابعة">الرابعة</option>
                        <option value="الخامسة">الخامسة</option>
                      </select>
                    </div>
                    <div className="form-group-modern">
                      <label className="form-label-modern">التخصص</label>
                      <select 
                        className="form-input-modern" 
                        value={profileData.major} 
                        onChange={(e) => handleInputChange('major', e.target.value)}
                      >
                        <option value="">اختر التخصص</option>
                        <option value="هندسة الحاسوب">هندسة الحاسوب</option>
                        <option value="علوم الحاسوب">علوم الحاسوب</option>
                        <option value="تقنية المعلومات">تقنية المعلومات</option>
                        <option value="الهندسة الكهربائية">الهندسة الكهربائية</option>
                        <option value="الهندسة الميكانيكية">الهندسة الميكانيكية</option>
                        <option value="الهندسة المدنية">الهندسة المدنية</option>
                        <option value="الهندسة الكيميائية">الهندسة الكيميائية</option>
                        <option value="الهندسة الصناعية">الهندسة الصناعية</option>
                        <option value="هندسة الطيران">هندسة الطيران</option>
                        <option value="الهندسة المعمارية">الهندسة المعمارية</option>
                        <option value="هندسة البترول">هندسة البترول</option>
                        <option value="الطب">الطب</option>
                        <option value="طب الأسنان">طب الأسنان</option>
                        <option value="الصيدلة">الصيدلة</option>
                        <option value="التمريض">التمريض</option>
                        <option value="العلوم الصحية">العلوم الصحية</option>
                        <option value="إدارة الأعمال">إدارة الأعمال</option>
                        <option value="المحاسبة">المحاسبة</option>
                        <option value="الاقتصاد">الاقتصاد</option>
                        <option value="التمويل">التمويل</option>
                        <option value="التسويق">التسويق</option>
                        <option value="العلوم الإدارية">العلوم الإدارية</option>
                        <option value="القانون">القانون</option>
                        <option value="العلوم السياسية">العلوم السياسية</option>
                        <option value="العلاقات الدولية">العلاقات الدولية</option>
                        <option value="اللغة العربية">اللغة العربية</option>
                        <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                        <option value="الترجمة">الترجمة</option>
                        <option value="العلوم">العلوم</option>
                        <option value="الرياضيات">الرياضيات</option>
                        <option value="الفيزياء">الفيزياء</option>
                        <option value="الكيمياء">الكيمياء</option>
                        <option value="الأحياء">الأحياء</option>
                        <option value="التربية">التربية</option>
                        <option value="التربية الخاصة">التربية الخاصة</option>
                        <option value="علم النفس">علم النفس</option>
                        <option value="الخدمة الاجتماعية">الخدمة الاجتماعية</option>
                        <option value="الدراسات الإسلامية">الدراسات الإسلامية</option>
                        <option value="الشريعة">الشريعة</option>
                        <option value="أصول الدين">أصول الدين</option>
                        <option value="تخصص آخر">تخصص آخر</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="profile-column-modern">
              {/* Skills Card */}
              <div className="profile-card-modern">
                <div className="card-header-modern">
                  <h2 className="card-title-modern">المهارات</h2>
                </div>
                <div className="card-body-modern">
                  <div className="chips-container-modern">
                    {profileData.skills.map((skill, i) => (
                      <div key={i} className="chip-modern">
                        <span>{skill}</span>
                        <button 
                          className="chip-remove-modern"
                          onClick={() => removeSkill(i)}
                          aria-label="إزالة"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button className="chip-add-modern" onClick={addSkill}>
                      + إضافة مهارة
                    </button>
                  </div>
                </div>
              </div>

              {/* Interests Card */}
              <div className="profile-card-modern">
                <div className="card-header-modern">
                  <h2 className="card-title-modern">الاهتمامات</h2>
                </div>
                <div className="card-body-modern">
                  <div className="chips-container-modern">
                    {profileData.interests.map((int, i) => (
                      <div key={i} className="chip-modern">
                        <span>{int}</span>
                        <button 
                          className="chip-remove-modern"
                          onClick={() => removeInterest(i)}
                          aria-label="إزالة"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button className="chip-add-modern" onClick={addInterest}>
                      + إضافة اهتمام
                    </button>
                  </div>
                </div>
              </div>

              {/* Clubs Card */}
              <div className="profile-card-modern">
                <div className="card-header-modern">
                  <h2 className="card-title-modern">العضويات في الأندية</h2>
                </div>
                <div className="card-body-modern">
                  <div className="empty-state-modern">
                    <div className="empty-icon-modern">🏛️</div>
                    <p>إدارة الأندية ستتوفر قريباً.</p>
                  </div>
                </div>
              </div>

              {/* Achievements Card */}
              <div className="profile-card-modern">
                <div className="card-header-modern">
                  <h2 className="card-title-modern">الإنجازات</h2>
                </div>
                <div className="card-body-modern">
                  <div className="empty-state-modern">
                    <div className="empty-icon-modern">🏆</div>
                    <p>لا توجد إنجازات حالياً.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
