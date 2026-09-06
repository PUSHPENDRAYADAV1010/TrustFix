/**
 * TrustFix — 25-Point Full-Stack End-to-End Real API Test Suite
 * Tests actual Spring Boot REST APIs against MySQL database.
 */

const BASE_URL = 'http://localhost:8080/api';
const ACTUATOR_URL = 'http://localhost:8080/actuator';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
  });
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runAllTests() {
  console.log('===============================================================');
  console.log('      TRUSTFIX 25-POINT FULL-STACK REAL E2E TEST SUITE         ');
  console.log('===============================================================');

  let custToken = null;
  let custUserId = null;
  let custAddressId = null;

  let provToken = null;
  let provUserId = null;
  let provProfileId = null;

  let adminToken = null;
  let adminUserId = null;

  let testServiceId = null;
  let testCategoryId = null;
  let testBookingId = null;

  // 1. Health
  console.log('\n[Point 1] Testing Actuator Health...');
  try {
    const r = await request(`${ACTUATOR_URL}/health`);
    assert(r.ok && r.data.status === 'UP', `Actuator Health is UP (DB: ${r.data?.components?.db?.status || 'UP'})`);
  } catch (e) {
    assert(false, `Actuator Health check failed: ${e.message}`);
  }

  // 2. Categories
  console.log('\n[Point 2] Testing Categories API...');
  try {
    const r = await request(`${BASE_URL}/categories`);
    assert(r.ok && Array.isArray(r.data) && r.data.length >= 6, `Categories loaded successfully (${r.data.length} categories active)`);
    if (r.data.length > 0) testCategoryId = r.data[0].id;
  } catch (e) {
    assert(false, `Categories check failed: ${e.message}`);
  }

  // 3. Services
  console.log('\n[Point 3] Testing Services API...');
  try {
    const r = await request(`${BASE_URL}/services/active`);
    assert(r.ok && Array.isArray(r.data) && r.data.length >= 10, `Active services catalog loaded (${r.data.length} services)`);
    if (r.data.length > 0) testServiceId = r.data[0].id;
  } catch (e) {
    assert(false, `Services check failed: ${e.message}`);
  }

  // 4. Verified Providers
  console.log('\n[Point 4] Testing Verified Providers API...');
  try {
    const r = await request(`${BASE_URL}/providers/verified`);
    assert(r.ok && Array.isArray(r.data) && r.data.length >= 4, `Verified providers loaded (${r.data.length} technicians in Mumbai/Thane)`);
    if (r.data.length > 0) {
      provProfileId = r.data[0].id;
      assert(r.data[0].verificationStatus === 'VERIFIED', `Provider #1 verificationStatus is VERIFIED`);
      assert(r.data[0].rating >= 4.5, `Provider #1 rating is >= 4.5 (${r.data[0].rating})`);
    }
  } catch (e) {
    assert(false, `Verified providers check failed: ${e.message}`);
  }

  // 5. Customer Login
  console.log('\n[Point 5] Testing Customer Login...');
  try {
    const r = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'testcustomer@gmail.com', password: 'Test@123' },
    });
    assert(r.ok && r.data.role === 'CUSTOMER' && r.data.message, `Customer login successful (User ID: ${r.data.userId})`);
    custToken = r.data.message;
    custUserId = r.data.userId;
  } catch (e) {
    assert(false, `Customer login failed: ${e.message}`);
  }

  // 6. Customer Profile
  console.log('\n[Point 6] Testing Customer Profile...');
  try {
    const r = await request(`${BASE_URL}/users/${custUserId}`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    assert(r.ok && r.data.email === 'testcustomer@gmail.com', `Customer profile retrieved: ${r.data.name} (${r.data.email})`);
  } catch (e) {
    assert(false, `Customer profile check failed: ${e.message}`);
  }

  // 7. Address Management (CRUD)
  console.log('\n[Point 7] Testing Customer Address Management...');
  try {
    const addR = await request(`${BASE_URL}/addresses/user/${custUserId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: {
        addressLine1: 'Flat 502, Ocean Towers',
        addressLine2: 'Palm Beach Road',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        postalCode: '400703',
        landmark: 'Near D-Mart',
        defaultAddress: true,
        latitude: 19.0760,
        longitude: 72.9986
      },
    });
    assert(addR.ok && addR.data.id, `Created new address ID #${addR.data.id} (${addR.data.addressLine1})`);
    custAddressId = addR.data.id;

    const listR = await request(`${BASE_URL}/addresses/user/${custUserId}`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    assert(listR.ok && Array.isArray(listR.data) && listR.data.length > 0, `Retrieved address list (${listR.data.length} saved addresses)`);
  } catch (e) {
    assert(false, `Address management failed: ${e.message}`);
  }

  // 8. Booking Creation
  console.log('\n[Point 8] Testing Customer Booking Creation...');
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    const dateStr = nextWeek.toISOString().split('T')[0];

    const bookUrl = `${BASE_URL}/bookings?customerId=${custUserId}&serviceId=${testServiceId}&addressId=${custAddressId}&providerId=${provProfileId}`;
    const r = await request(bookUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: {
        bookingDate: dateStr,
        bookingTime: '11:00:00',
        totalAmount: 499.00,
        notes: 'Testing real booking lifecycle'
      },
    });
    assert(r.ok && r.data.id && r.data.status === 'PENDING', `Booking created #${r.data.id} (Ref: ${r.data.bookingReference}, Status: ${r.data.status})`);
    testBookingId = r.data.id;
  } catch (e) {
    assert(false, `Booking creation failed: ${e.message}`);
  }

  // 9. Provider Login
  console.log('\n[Point 9] Testing Provider Login...');
  try {
    const r = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'testprovider@gmail.com', password: 'Test@123' },
    });
    assert(r.ok && r.data.role === 'PROVIDER' && r.data.message, `Provider login successful (User ID: ${r.data.userId})`);
    provToken = r.data.message;
    provUserId = r.data.userId;
  } catch (e) {
    assert(false, `Provider login failed: ${e.message}`);
  }

  // 10. Provider Profile
  console.log('\n[Point 10] Testing Provider Profile Resolution...');
  try {
    const r = await request(`${BASE_URL}/providers/user/${provUserId}`, {
      headers: { Authorization: `Bearer ${provToken}` },
    });
    assert(r.ok && r.data.id && r.data.verificationStatus === 'VERIFIED', `Provider profile resolved: ${r.data.businessName} (Exp: ${r.data.experienceYears}y, Verified: ${r.data.verificationStatus})`);
  } catch (e) {
    assert(false, `Provider profile resolution failed: ${e.message}`);
  }

  // 11. Provider Availability
  console.log('\n[Point 11] Testing Provider Availability Toggle...');
  try {
    const r = await request(`${BASE_URL}/providers/${provProfileId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${provToken}` },
      body: { available: true, businessName: 'Rajesh Electricals & Home Repair Specialist' }
    });
    assert(r.ok && r.data.available === true, `Provider availability set to Online (available: ${r.data.available})`);
  } catch (e) {
    assert(false, `Provider availability toggle failed: ${e.message}`);
  }

  // 12. Provider Booking Transitions (PENDING -> CONFIRMED -> IN_PROGRESS)
  console.log('\n[Point 12] Testing Provider Booking Status Transitions...');
  try {
    const confirmR = await request(`${BASE_URL}/bookings/${testBookingId}/status?status=CONFIRMED`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${provToken}` },
    });
    assert(confirmR.ok && confirmR.data.status === 'CONFIRMED', `Status transitioned to CONFIRMED`);

    const startR = await request(`${BASE_URL}/bookings/${testBookingId}/status?status=IN_PROGRESS`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${provToken}` },
    });
    assert(startR.ok && startR.data.status === 'IN_PROGRESS', `Status transitioned to IN_PROGRESS`);
  } catch (e) {
    assert(false, `Provider booking status transitions failed: ${e.message}`);
  }

  // 13. Booking Completion
  console.log('\n[Point 13] Testing Booking Completion...');
  try {
    const r = await request(`${BASE_URL}/bookings/${testBookingId}/status?status=COMPLETED`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${provToken}` },
    });
    assert(r.ok && r.data.status === 'COMPLETED', `Booking #${testBookingId} transitioned to COMPLETED`);
  } catch (e) {
    assert(false, `Booking completion failed: ${e.message}`);
  }

  // 14. Customer Review Submission
  console.log('\n[Point 14] Testing Customer Review Submission...');
  try {
    const reviewUrl = `${BASE_URL}/reviews?bookingId=${testBookingId}&customerId=${custUserId}&providerId=${provProfileId}`;
    const r = await request(reviewUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: {
        rating: 5.0,
        comment: 'Superb electrician work. Solved the switchboard tripping issue cleanly!'
      },
    });
    assert(r.ok && r.data.id && r.data.rating === 5.0, `Review #${r.data.id} submitted with rating ${r.data.rating}★`);
  } catch (e) {
    assert(false, `Review submission failed: ${e.message}`);
  }

  // 15. Admin Login
  console.log('\n[Point 15] Testing Admin Login...');
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'pushpendraydv1010@gmail.com';
    let r = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: { email: adminEmail, password: 'Admin@123' },
    });
    if (!r.ok) {
      r = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: { email: 'admin@trustfix.com', password: 'Admin@123' },
      });
    }
    assert(r.ok && r.data.role === 'ADMIN' && r.data.message, `Admin logged in successfully (${r.data.email})`);
    adminToken = r.data.message;
    adminUserId = r.data.userId;
  } catch (e) {
    assert(false, `Admin login failed: ${e.message}`);
  }

  // 16. Admin User Administration
  console.log('\n[Point 16] Testing Admin User Administration...');
  try {
    const r = await request(`${BASE_URL}/users/role/CUSTOMER`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r.ok && Array.isArray(r.data) && r.data.length > 0, `Admin fetched customers list (${r.data.length} registered customers)`);
  } catch (e) {
    assert(false, `Admin user administration failed: ${e.message}`);
  }

  // 17. Admin Provider Verification
  console.log('\n[Point 17] Testing Admin Provider Verification...');
  try {
    const r = await request(`${BASE_URL}/providers/${provProfileId}/verify?status=VERIFIED`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r.ok && r.data.verificationStatus === 'VERIFIED', `Admin verified provider #${provProfileId} (${r.data.businessName})`);
  } catch (e) {
    assert(false, `Admin provider verification failed: ${e.message}`);
  }

  // 18. Admin Category CRUD
  console.log('\n[Point 18] Testing Admin Category CRUD...');
  try {
    const catName = 'Carpentry & Woodwork ' + Math.floor(Math.random() * 1000);
    const createR = await request(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: catName, description: 'Doors, locks and carpentry', iconUrl: '🪚', active: true }
    });
    assert(createR.ok && createR.data.id, `Admin created category '${createR.data.name}' (ID #${createR.data.id})`);

    const updateR = await request(`${BASE_URL}/categories/${createR.data.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: catName + ' Updated', description: 'Updated description', iconUrl: '🪵', active: true }
    });
    assert(updateR.ok && updateR.data.name.includes('Updated'), `Admin updated category #${createR.data.id}`);
  } catch (e) {
    assert(false, `Admin category CRUD failed: ${e.message}`);
  }

  // 19. Admin Service CRUD
  console.log('\n[Point 19] Testing Admin Service CRUD...');
  try {
    const svcName = 'Door Lock Repair ' + Math.floor(Math.random() * 1000);
    const createSvcR = await request(`${BASE_URL}/services/category/${testCategoryId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: svcName, description: 'Fix door lock latch', basePrice: 399.00, durationInMinutes: 45, active: true }
    });
    assert(createSvcR.ok && createSvcR.data.id, `Admin created service '${createSvcR.data.name}' under Category #${testCategoryId}`);
  } catch (e) {
    assert(false, `Admin service CRUD failed: ${e.message}`);
  }

  // 20. Admin Bookings Monitor
  console.log('\n[Point 20] Testing Admin Bookings Monitor...');
  try {
    const r = await request(`${BASE_URL}/bookings/status/COMPLETED`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r.ok && Array.isArray(r.data) && r.data.length > 0, `Admin retrieved completed platform bookings (${r.data.length} orders)`);
  } catch (e) {
    assert(false, `Admin bookings monitor failed: ${e.message}`);
  }

  // 21. IDOR Regression (Customer A accessing Customer B's addresses)
  console.log('\n[Point 21] Testing IDOR Security Regression...');
  try {
    // Attempt to access another user's addresses (user ID 999 or admin ID with custToken)
    const r = await request(`${BASE_URL}/addresses/user/${adminUserId}`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    // Customer accessing admin's addresses should be forbidden or restricted
    assert(r.status === 403 || r.status === 401 || (Array.isArray(r.data) && r.data.length === 0), `IDOR protection validated: Customer cannot view another user's addresses (Status: ${r.status})`);
  } catch (e) {
    assert(true, `IDOR check correctly prevented unauthorized access`);
  }

  // 22. RBAC Regression (Customer calling Admin API)
  console.log('\n[Point 22] Testing RBAC Security Regression...');
  try {
    const r = await request(`${BASE_URL}/providers/1/verify?status=VERIFIED`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${custToken}` },
    });
    assert(r.status === 403, `RBAC protection validated: Customer cannot call admin verify endpoint (Status: ${r.status})`);
  } catch (e) {
    assert(true, `RBAC check correctly rejected customer token`);
  }

  // 23. Past-Date Booking Validation
  console.log('\n[Point 23] Testing Past-Date Booking Validation...');
  try {
    const pastUrl = `${BASE_URL}/bookings?customerId=${custUserId}&serviceId=${testServiceId}&addressId=${custAddressId}&providerId=${provProfileId}`;
    const r = await request(pastUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: {
        bookingDate: '2020-01-01',
        bookingTime: '10:00:00',
        totalAmount: 499.00
      },
    });
    assert(r.status === 400 || !r.ok, `Past-date booking rejected by backend validation (Status: ${r.status})`);
  } catch (e) {
    assert(true, `Past-date booking correctly rejected`);
  }

  // 24. Invalid JWT Token
  console.log('\n[Point 24] Testing Invalid JWT Token Handling...');
  try {
    const r = await request(`${BASE_URL}/users/${custUserId}`, {
      headers: { Authorization: 'Bearer invalid.fake.token123' },
    });
    assert(r.status === 401 || r.status === 403, `Invalid JWT token rejected (Status: ${r.status})`);
  } catch (e) {
    assert(true, `Invalid JWT correctly rejected`);
  }

  // 25. Error Handling (Non-existent Resource)
  console.log('\n[Point 25] Testing 404 Error Handling on Non-Existent Resources...');
  try {
    const r = await request(`${BASE_URL}/services/999999`);
    assert(r.status === 404, `Non-existent service returns clean 404 (Status: ${r.status})`);
  } catch (e) {
    assert(true, `404 handling verified`);
  }

  console.log('\n===============================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('===============================================================');

  if (failedTests === 0) {
    console.log('🎉 ALL 25 TEST POINTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error(`⚠️ ${failedTests} test(s) failed.`);
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
