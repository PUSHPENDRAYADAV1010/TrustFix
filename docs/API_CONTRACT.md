# TrustFix Backend — Complete REST API Contract Specification

This document provides the authoritative API contract for the TrustFix Spring Boot Backend (`http://localhost:8085`). All request and response structures are mapped directly to verified DTOs.

---

## Table of Contents
1. [Authentication API (`/api/auth`)](#1-authentication-api-apiauth)
2. [User API (`/api/users`)](#2-user-api-apiusers)
3. [Provider Profile API (`/api/providers`)](#3-provider-profile-api-apiproviders)
4. [Category API (`/api/categories`)](#4-category-api-apicategories)
5. [Service Catalog API (`/api/services`)](#5-service-catalog-api-apiservices)
6. [Provider Service API (`/api/provider-services`)](#6-provider-service-api-apiprovider-services)
7. [Address API (`/api/addresses`)](#7-address-api-apiaddresses)
8. [Booking API (`/api/bookings`)](#8-booking-api-apibookings)
9. [Review API (`/api/reviews`)](#9-review-api-apireviews)
10. [Error Responses](#10-error-responses)

---

## 1. Authentication API (`/api/auth`)

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Authentication**: `PUBLIC`
- **Request Body**:
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "CUSTOMER"
}
```
- **Success Response** (`201 Created`):
```json
{
  "id": 1,
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "role": "CUSTOMER",
  "active": true,
  "createdAt": "2026-08-28T01:00:00",
  "updatedAt": "2026-08-28T01:00:00"
}
```

### 1.2 Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Authentication**: `PUBLIC`
- **Request Body**:
```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```
- **Success Response** (`200 OK`):
```json
{
  "message": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "role": "CUSTOMER"
}
```

---

## 2. User API (`/api/users`)

### 2.1 Get User by ID
- **Method**: `GET`
- **Path**: `/api/users/{id}`
- **Authentication**: `AUTHENTICATED`
- **Success Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "role": "CUSTOMER",
  "active": true,
  "createdAt": "2026-08-28T01:00:00",
  "updatedAt": "2026-08-28T01:00:00"
}
```

### 2.2 Update User
- **Method**: `PUT`
- **Path**: `/api/users/{id}`
- **Authentication**: `AUTHENTICATED`
- **Request Body**:
```json
{
  "name": "Rahul S. Sharma",
  "email": "rahul@example.com",
  "phone": "9876543211",
  "role": "CUSTOMER",
  "active": true
}
```
- **Success Response** (`200 OK`): `UserResponse`

### 2.3 Delete / Deactivate User
- **Method**: `DELETE`
- **Path**: `/api/users/{id}`
- **Authentication**: `AUTHENTICATED (OWNER or ADMIN)`
- **Success Response** (`204 No Content`): Empty response body. Non-admin self-deletion deactivates account (`active = false`), preserving referential integrity of booking/review history. Admins can permanently delete accounts with no dependents.

---

## 3. Provider Profile API (`/api/providers`)

### 3.1 Create Provider Profile
- **Method**: `POST`
- **Path**: `/api/providers/user/{userId}`
- **Authentication**: `AUTHENTICATED (PROVIDER)`
- **Request Body**:
```json
{
  "businessName": "Bob Plumbing Solutions",
  "bio": "Expert plumbing services with 5+ years experience",
  "experienceYears": 5,
  "documentUrl": "https://example.com/docs/license.pdf"
}
```
- **Success Response** (`201 Created`):
```json
{
  "id": 1,
  "userId": 2,
  "userName": "Provider Bob",
  "userEmail": "bob@example.com",
  "userPhone": "9999988888",
  "businessName": "Bob Plumbing Solutions",
  "bio": "Expert plumbing services with 5+ years experience",
  "experienceYears": 5,
  "verificationStatus": "PENDING",
  "documentUrl": "https://example.com/docs/license.pdf",
  "rating": 0.0,
  "reviewCount": 0,
  "available": true,
  "createdAt": "2026-08-28T01:00:00",
  "updatedAt": "2026-08-28T01:00:00"
}
```

### 3.2 List Verified Providers
- **Method**: `GET`
- **Path**: `/api/providers/verified`
- **Authentication**: `PUBLIC`
- **Success Response** (`200 OK`): Array of `ProviderProfileResponse`

### 3.3 Find Nearby Providers (Map Discovery)
- **Method**: `GET`
- **Path**: `/api/providers/nearby?lat=19.0760&lng=72.8777&radiusKm=25&serviceId=1`
- **Authentication**: `PUBLIC`
- **Query Parameters**:
  - `lat` (`Double`, required): Customer latitude
  - `lng` (`Double`, required): Customer longitude
  - `radiusKm` (`Double`, optional, default `25.0`): Search radius limit in kilometers
  - `serviceId` (`Long`, optional): Filter providers offering a specific service ID
- **Success Response** (`200 OK`):
```json
[
  {
    "providerId": 1,
    "businessName": "Bob Plumbing Solutions",
    "rating": 4.8,
    "reviewCount": 24,
    "latitude": 19.2183,
    "longitude": 72.9781,
    "serviceRadiusKm": 25.0,
    "distanceKm": 18.35,
    "available": true
  }
]
```

---


## 4. Category API (`/api/categories`)

### 4.1 List Active Categories
- **Method**: `GET`
- **Path**: `/api/categories/active`
- **Authentication**: `PUBLIC`
- **Success Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "name": "Plumbing",
    "description": "All home plumbing repair and installation services",
    "iconUrl": "https://example.com/icons/plumbing.png",
    "active": true,
    "createdAt": "2026-08-28T01:00:00",
    "updatedAt": "2026-08-28T01:00:00"
  }
]
```

---

## 5. Service Catalog API (`/api/services`)

### 5.1 List Active Services
- **Method**: `GET`
- **Path**: `/api/services/active`
- **Authentication**: `PUBLIC`
- **Success Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "name": "Tap Repair & Replacement",
    "description": "Fix leaking or broken water taps",
    "basePrice": 299.00,
    "durationInMinutes": 45,
    "categoryId": 1,
    "categoryName": "Plumbing",
    "imageUrl": "https://example.com/images/tap.jpg",
    "active": true,
    "createdAt": "2026-08-28T01:00:00",
    "updatedAt": "2026-08-28T01:00:00"
  }
]
```

---

## 6. Provider Service API (`/api/provider-services`)

### 6.1 List Providers Offering a Service
- **Method**: `GET`
- **Path**: `/api/provider-services/service/{serviceId}`
- **Authentication**: `PUBLIC`
- **Success Response** (`200 OK`): Array of `ProviderServiceResponse`

---

## 7. Address API (`/api/addresses`)

### 7.1 Add Address
- **Method**: `POST`
- **Path**: `/api/addresses/user/{userId}`
- **Authentication**: `AUTHENTICATED`
- **Request Body**:
```json
{
  "addressLine1": "Flat 302, Sunrise Heights",
  "addressLine2": "MG Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "postalCode": "560001",
  "country": "India",
  "landmark": "Near Metro Station",
  "defaultAddress": true
}
```
- **Success Response** (`201 Created`): `AddressResponse`

---

## 8. Booking API (`/api/bookings`)

### 8.1 Create Booking
- **Method**: `POST`
- **Path**: `/api/bookings?customerId=1&serviceId=1&addressId=1&providerId=1`
- **Authentication**: `AUTHENTICATED (CUSTOMER)`
- **Request Body**:
```json
{
  "bookingDate": "2026-09-01",
  "bookingTime": "14:00:00",
  "totalAmount": 299.00,
  "notes": "Please bring extra washer tools"
}
```
- **Success Response** (`201 Created`):
```json
{
  "id": 1,
  "bookingReference": "TF-A1B2C3D4",
  "customerId": 1,
  "customerName": "Rahul Sharma",
  "customerEmail": "rahul@example.com",
  "customerPhone": "9876543210",
  "providerId": 1,
  "providerBusinessName": "Bob Plumbing Solutions",
  "serviceId": 1,
  "serviceName": "Tap Repair & Replacement",
  "addressId": 1,
  "addressLine1": "Flat 302, Sunrise Heights",
  "city": "Bengaluru",
  "postalCode": "560001",
  "bookingDate": "2026-09-01",
  "bookingTime": "14:00:00",
  "status": "PENDING",
  "totalAmount": 299.00,
  "notes": "Please bring extra washer tools",
  "cancellationReason": null,
  "createdAt": "2026-08-28T01:00:00",
  "updatedAt": "2026-08-28T01:00:00"
}
```

### 8.2 Update Booking Status
- **Method**: `PUT`
- **Path**: `/api/bookings/{id}/status?status={status}&reason={reason}`
- **Authentication**: `AUTHENTICATED` (Assigned Provider, Customer for cancel, or Admin)
- **Query Parameters**:
  - `status` (`BookingStatus`, required): `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
  - `reason` (`String`, optional): Cancellation reason (max 500 characters)
- **Success Response** (`200 OK`): `BookingResponse`

### 8.3 Cancel Booking (Dedicated Endpoint)
- **Method**: `PUT`
- **Path**: `/api/bookings/{id}/cancel`
- **Authentication**: `AUTHENTICATED (CUSTOMER, ASSIGNED PROVIDER, or ADMIN)`
- **Request Body**:
```json
{
  "reason": "Rescheduled to next week due to personal travel"
}
```
- **Success Response** (`200 OK`): `BookingResponse` with `status: "CANCELLED"` and populated `cancellationReason`.
- **Validation**: Enforces status must be `PENDING` or `CONFIRMED` to cancel. Rejects cancellation of `IN_PROGRESS` or `COMPLETED` bookings. Rejects cancellation reasons longer than 500 characters.

### 8.4 Get Customer Bookings
- **Method**: `GET`
- **Path**: `/api/bookings/customer/{customerId}`
- **Authentication**: `AUTHENTICATED (OWNER or ADMIN)`
- **Success Response** (`200 OK`): Array of `BookingResponse`, sorted descending by creation date (`createdAt DESC`).

---

## 9. Review API (`/api/reviews`)

### 9.1 Submit Review
- **Method**: `POST`
- **Path**: `/api/reviews/booking/{bookingId}`
- **Authentication**: `AUTHENTICATED (CUSTOMER)`
- **Request Body**:
```json
{
  "rating": 5,
  "comment": "Excellent service, very punctual!"
}
```
- **Success Response** (`201 Created`): `ReviewResponse`

---

## 10. Error Responses

Standard Error Format:
```json
{
  "timestamp": "2026-08-28T01:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found with ID: 99"
}
```
Validation Error Format (`400 Bad Request`):
```json
{
  "timestamp": "2026-08-28T01:00:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "email": "Email must be a valid email address"
  }
}
```
