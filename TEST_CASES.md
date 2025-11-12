# Club Request System - Test Cases

## Test Case 1: Organizer Signup with Club Name
**Objective:** Verify that organizer can sign up with club name and request is created

**Steps:**
1. Go to `/account-type`
2. Select "منظم نادي" (Organizer)
3. Click "المتابعة" (Continue)
4. Fill in the signup form:
   - Email: `organizer@test.com`
   - Username: `testorganizer`
   - Club Name: `نادي الاختبار`
   - Password: `Test123`
   - Confirm Password: `Test123`
5. Click "إنشاء الحساب" (Create Account)

**Expected Results:**
- ✅ Redirects to `/pending-request` page
- ✅ Shows success message: "تم إرسال طلب إنشاء نادي بنجاح"
- ✅ No Firebase Auth account created
- ✅ Document created in `clubRequests` collection with:
  - `email`: `organizer@test.com`
  - `username`: `testorganizer`
  - `clubName`: `نادي الاختبار`
  - `status`: `pending`
  - `password`: stored (for account creation)

---

## Test Case 2: Club Name Validation
**Objective:** Verify club name validation works

**Steps:**
1. Go to organizer signup
2. Try to submit without club name
3. Try club name with less than 3 characters
4. Try club name with more than 50 characters

**Expected Results:**
- ✅ Error message: "اسم النادي مطلوب" (if empty)
- ✅ Error message: "اسم النادي يجب أن يكون 3 أحرف على الأقل" (if < 3 chars)
- ✅ Error message: "اسم النادي يجب ألا يتجاوز 50 حرفاً" (if > 50 chars)
- ✅ Form doesn't submit

---

## Test Case 3: Admin Sees Pending Requests
**Objective:** Verify admin sees notification badge with pending requests count

**Steps:**
1. Login as admin
2. Go to homepage
3. Check for notification badge

**Expected Results:**
- ✅ Red notification badge appears on top-left (if requests exist)
- ✅ Shows count: "X طلب جديد"
- ✅ Badge is clickable
- ✅ Badge shows correct count matching `clubRequests` with `status: 'pending'`

---

## Test Case 4: Admin Opens Requests Sidebar
**Objective:** Verify admin can open and view requests sidebar

**Steps:**
1. Login as admin
2. Click on notification badge (or if no badge, manually trigger sidebar)
3. Sidebar should open

**Expected Results:**
- ✅ Sidebar slides in from right
- ✅ Shows "طلبات النوادي المعلقة" (Pending Club Requests) title
- ✅ Lists all pending requests
- ✅ Each request shows:
  - Club name
  - Organizer username (@username)
  - Organizer email
  - Request date
  - Approve button
  - Reject button

---

## Test Case 5: Admin Approves Club Request
**Objective:** Verify admin can approve a club request

**Steps:**
1. Login as admin
2. Open requests sidebar
3. Click "✅ موافق" (Approve) on a request
4. Wait for processing

**Expected Results:**
- ✅ Button shows "جاري الموافقة..." (Processing...)
- ✅ Firebase Auth account created with organizer email/password
- ✅ User document created in `users` collection with:
  - `role`: `organizer`
  - `approved`: `true`
  - `email`, `username` from request
- ✅ Club document created in `clubs` collection with:
  - `name`: club name from request
  - `organizerId`: user UID
  - `status`: `active`
- ✅ Request status updated to `approved`
- ✅ Request removed from pending list
- ✅ Notification count decreases

---

## Test Case 6: Admin Rejects Club Request
**Objective:** Verify admin can reject a club request

**Steps:**
1. Login as admin
2. Open requests sidebar
3. Click "❌ رفض" (Reject) on a request
4. Enter rejection reason (or leave empty)
5. Confirm

**Expected Results:**
- ✅ Prompt appears asking for rejection reason
- ✅ Button shows "جاري الرفض..." (Processing...)
- ✅ Request status updated to `rejected`
- ✅ `rejectedBy` field set to admin UID
- ✅ `rejectionReason` saved (if provided)
- ✅ Request removed from pending list
- ✅ Notification count decreases
- ✅ No Firebase Auth account created
- ✅ No user/club documents created

---

## Test Case 7: Organizer Login After Approval
**Objective:** Verify organizer can login after admin approves request

**Steps:**
1. Admin approves a club request (from Test Case 5)
2. Logout admin
3. Go to login page
4. Login with organizer credentials:
   - Email/Username: from approved request
   - Password: from request
5. Submit

**Expected Results:**
- ✅ Login succeeds
- ✅ User document exists in `users` collection
- ✅ User can access homepage
- ✅ User role is `organizer`
- ✅ Success message: "تم تفعيل الحساب وتسجيل الدخول بنجاح"

---

## Test Case 8: Organizer Login Before Approval
**Objective:** Verify organizer cannot login before approval

**Steps:**
1. Create organizer signup request (status: pending)
2. Try to login with organizer credentials
3. Submit

**Expected Results:**
- ✅ Error message: "لا يوجد حساب بهذا البريد الإلكتروني أو اسم المستخدم"
- ✅ Cannot login
- ✅ No Firebase Auth account exists yet

---

## Test Case 9: Duplicate Club Request Prevention
**Objective:** Verify duplicate requests are prevented

**Steps:**
1. Create organizer signup with email `test@test.com`
2. Try to create another organizer signup with same email
3. Submit

**Expected Results:**
- ✅ Error message: "A club request with this email already exists. Please wait for approval."
- ✅ Second request not created
- ✅ Only one request exists in `clubRequests`

---

## Test Case 10: Empty Requests List
**Objective:** Verify empty state when no pending requests

**Steps:**
1. Login as admin
2. Ensure no pending requests exist
3. Open requests sidebar

**Expected Results:**
- ✅ Sidebar opens
- ✅ Shows empty state: "لا توجد طلبات معلقة" (No pending requests)
- ✅ No notification badge shown (or badge shows 0)

---

## Test Case 11: Request Auto-Refresh
**Objective:** Verify requests list refreshes automatically

**Steps:**
1. Login as admin
2. Open requests sidebar
3. Note the requests count
4. In another browser/tab, create a new organizer signup
5. Wait 30 seconds
6. Check sidebar

**Expected Results:**
- ✅ Sidebar automatically refreshes every 30 seconds
- ✅ New request appears in list
- ✅ Notification count updates

---

## Test Case 12: Multiple Admins Approving Same Request
**Objective:** Verify system handles concurrent approvals

**Steps:**
1. Create a club request
2. Login as Admin 1
3. Login as Admin 2 (different browser)
4. Both try to approve same request simultaneously

**Expected Results:**
- ✅ First admin to click succeeds
- ✅ Second admin gets error (request already approved/not found)
- ✅ Only one account created
- ✅ Request status is `approved`

---

## Test Case 13: Sidebar Responsive Design
**Objective:** Verify sidebar works on mobile

**Steps:**
1. Login as admin on mobile device (or resize browser)
2. Open requests sidebar

**Expected Results:**
- ✅ Sidebar takes full width on mobile
- ✅ Cards are readable
- ✅ Buttons are clickable
- ✅ Close button works

---

## Test Case 14: Pending Request Page for Organizer
**Objective:** Verify organizer sees pending request page after signup

**Steps:**
1. Complete organizer signup
2. Check redirect

**Expected Results:**
- ✅ Redirects to `/pending-request`
- ✅ Shows organizer-specific message
- ✅ Icon: 👥
- ✅ Title: "طلب إنشاء نادي"
- ✅ Message: "تم إرسال طلب إنشاء نادي بنجاح"

---

## Test Case 15: Club Name Field Only for Organizers
**Objective:** Verify club name field only appears for organizers

**Steps:**
1. Go to student signup
2. Check form fields
3. Go to organizer signup
4. Check form fields

**Expected Results:**
- ✅ Student signup: No club name field
- ✅ Organizer signup: Club name field appears
- ✅ Admin signup: No club name field

---

## Test Case 16: Request Details Accuracy
**Objective:** Verify request contains correct information

**Steps:**
1. Create organizer signup with specific data
2. Check `clubRequests` document in Firebase

**Expected Results:**
- ✅ All fields match input:
  - `email`: matches signup email
  - `username`: lowercase, matches signup username
  - `clubName`: matches input (trimmed)
  - `password`: matches signup password
  - `status`: `pending`
  - `createdAt`: valid timestamp

---

## Test Case 17: Notification Badge Visibility
**Objective:** Verify badge only shows for admins

**Steps:**
1. Login as student - check homepage
2. Login as organizer - check homepage
3. Login as admin - check homepage

**Expected Results:**
- ✅ Student: No notification badge
- ✅ Organizer: No notification badge
- ✅ Admin: Notification badge appears (if requests exist)

---

## Test Case 18: Sidebar Close Functionality
**Objective:** Verify sidebar can be closed

**Steps:**
1. Login as admin
2. Open sidebar
3. Click close button (X)
4. Click outside sidebar (overlay)

**Expected Results:**
- ✅ Close button closes sidebar
- ✅ Clicking overlay closes sidebar
- ✅ Sidebar slides out smoothly

---

## Test Case 19: Error Handling - Network Failure
**Objective:** Verify error handling when network fails

**Steps:**
1. Login as admin
2. Disconnect internet
3. Try to approve a request

**Expected Results:**
- ✅ Error message shown: "Network error" or similar
- ✅ Request status unchanged
- ✅ No partial data created

---

## Test Case 20: Request Status Updates
**Objective:** Verify request status updates correctly

**Steps:**
1. Create organizer signup
2. Check request status in Firebase (should be `pending`)
3. Admin approves
4. Check request status (should be `approved`)
5. Check `approvedBy`, `approvedAt` fields

**Expected Results:**
- ✅ Initial status: `pending`
- ✅ After approval: `approved`
- ✅ `approvedBy`: admin UID
- ✅ `approvedAt`: valid timestamp
- ✅ `userId`: created user UID
- ✅ `clubId`: created club document ID

---

## Quick Test Checklist

- [ ] Organizer signup creates request
- [ ] Club name field validation works
- [ ] Admin sees notification badge
- [ ] Admin can open sidebar
- [ ] Admin can approve request
- [ ] Admin can reject request
- [ ] Organizer can login after approval
- [ ] Organizer cannot login before approval
- [ ] Duplicate requests prevented
- [ ] Empty state shows correctly
- [ ] Sidebar responsive on mobile
- [ ] Pending request page shows for organizer
- [ ] Club name field only for organizers
- [ ] Request data is accurate
- [ ] Badge only for admins
- [ ] Sidebar closes properly
- [ ] Error handling works
- [ ] Status updates correctly

---

## Notes

- All test cases assume Firebase is properly configured
- Test with real Firebase project (not emulator)
- Clear test data between test runs if needed
- Use different emails for each test to avoid conflicts

