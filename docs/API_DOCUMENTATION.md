# REST API SPECIFICATION & REFERENCE
# Habesha Hotel Management System (SHMS)
**Base URL:** `/api`  
**Protocol:** HTTPS / HTTP 1.1  
**Authentication Scheme:** Bearer Token (JWT) in Authorization Header or `shms_token` Cookie  
**Data Exchange Format:** `application/json`  

---

# 1. Authentication & Security Endpoints

# 1.1 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@habeshahotel.com",
    "password": "Admin123!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "user": {
      "id": 2,
      "email": "admin@habeshahotel.com",
      "role": "admin",
      "full_name": "Selam Tesfaye"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  { "error": "Invalid email or password" }
  ```

# 1.2 User Registration (Guest)
 **Endpoint:** `POST /api/auth/register`
 **Access:** Public
 **Request Body:**
  ```json
  {
    "email": "guest@example.com",
    "password": "Password123!",
    "full_name": "Abebe Bikila",
    "phone": "+251 91 123 4567"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "user": { "id": 15, "email": "guest@example.com", "role": "customer", "full_name": "Abebe Bikila" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

# 1.3 Get Current Authenticated Session
 **Endpoint:** `GET /api/auth/me`
 **Access:** Authenticated (Any Role)
 **Success Response (200 OK):** Returns logged-in user profile, role, avatar URL, and permissions.

# 1.4 User Logout
 **Endpoint:** `POST /api/auth/logout`
 **Access:** Public / Authenticated
 **Success Response (200 OK):** Clears authentication cookie.

---

# 2. Rooms & Inventory Endpoints

# 2.1 Get All Room Types
 **Endpoint:** `GET /api/rooms/types`
 **Access:** Public
 **Success Response (200 OK):** Array of room types with descriptions, capacities, bed types, size, base prices in ETB, and photo galleries.

### 2.2 Search Available Rooms (Dynamic Temporal Query)
 **Endpoint:** `GET /api/rooms/available`
 **Access:** Public
 **Query Parameters:**
   `check_in` (string, required): Format `YYYY-MM-DD`
   `check_out` (string, required): Format `YYYY-MM-DD`
   `guests` (number, optional): Minimum required capacity
 **Success Response (200 OK):** Array of room types that have at least one clean, non-conflicting physical room available during the specified interval.

# 2.3 Get All Physical Rooms
 **Endpoint:** `GET /api/rooms`
 **Access:** Public / Authenticated
 **Success Response (200 OK):** Full list of all 18+ physical rooms with room numbers, floor numbers, reservation statuses, operational cleanliness states, and nightly prices.

# 2.4 Update Room Status
 **Endpoint:** `PATCH /api/rooms/:id/status`
 **Access:** Authenticated (`superadmin`, `admin`, `manager`, `receptionist`, `housekeeper`, `maintenance`)
 **Request Body:**
  ```json
  {
    "status": "dirty",
    "operational_status": "needs_cleaning"
  }
  ```
 **Success Response (200 OK):** `{ "message": "Room status updated successfully" }`

---

# 3. Reservations & Front Desk Endpoints

# 3.1 Create Reservation
 **Endpoint:** `POST /api/bookings`
 **Access:** Public / Optional Authenticate
 **Request Body:**
  ```json
  {
    "room_type_id": 1,
    "check_in_date": "2026-11-15",
    "check_out_date": "2026-11-18",
    "adults_count": 2,
    "children_count": 0,
    "guest": {
      "full_name": "Dr. Olivia Chen",
      "email": "olivia.chen@gmail.com",
      "phone": "+251 92 890 1234",
      "country": "Ethiopia",
      "id_document_number": "EP-9810234"
    },
    "services": [1, 5],
    "payment_method": "telebirr"
  }
  ```
 **Success Response (201 Created):**
  ```json
  {
    "booking": {
      "id": 12,
      "booking_reference": "AG-2026-9041",
      "room_id": 102,
      "total_amount": 15456.00,
      "status": "confirmed"
    },
    "invoice": {
      "invoice_number": "INV-2026-0012",
      "subtotal": 13800.00,
      "tax_amount": 1656.00,
      "total_amount": 15456.00
    }
  }
  ```

# 3.2 Front-Desk Check-in Guest
- **Endpoint:** `POST /api/bookings/:id/check-in`
- **Access:** Authenticated (`superadmin`, `admin`, `manager`, `receptionist`)
- **Success Response (200 OK):** Updates booking to `checked_in`, sets room to `occupied`, records staff audit event.

# 3.3 Front-Desk Check-out Guest
- **Endpoint:** `POST /api/bookings/:id/check-out`
- **Access:** Authenticated (`superadmin`, `admin`, `manager`, `receptionist`)
- **Success Response (200 OK):** Updates booking to `checked_out`, sets room to `dirty`, and automatically creates an urgent turnover task for Housekeeping.

---

# 4. Housekeeping & Maintenance Endpoints

# 4.1 Get Housekeeping Task Queue
 **Endpoint:** `GET /api/housekeeping/tasks`
 **Access:** Authenticated (`superadmin`, `admin`, `manager`, `housekeeper`)
 **Query Parameters:** `status`, `priority`
 **Success Response (200 OK):** List of cleaning tasks sorted by urgency with room number, instructions, and assigned employee.

# 4.2 Update Task Status
 **Endpoint:** `PATCH /api/housekeeping/tasks/:id/status`
 **Access:** Authenticated (`superadmin`, `admin`, `manager`, `housekeeper`)
 **Request Body:** `{ "status": "completed" }`
 **Success Response (200 OK):** Restores room operational status to `ready`.

# 4.3 Log Maintenance Work Order
 **Endpoint:** `POST /api/maintenance`
 **Access:** Authenticated (Any Staff Role)
 **Request Body:**
  ```json
  {
    "room_id": 105,
    "issue_title": "Bathroom shower leak",
    "description": "Continuous leak from overhead mixer valve",
    "priority": "high",
    "estimated_cost": 1500.00
  }
  ```
 **Success Response (201 Created):** Sets room operational status to `under_repair` and creates maintenance ticket.

---

# 5. Billing, Invoices & Financial Endpoints

# 5.1 Get Invoices List
- **Endpoint:** `GET /api/invoices`
- **Access:** Authenticated (`superadmin`, `admin`, `manager`, `accountant`)
- **Query Parameters:** `search`, `status` (`paid`, `partially_paid`, `unpaid`), `limit`, `page`
- **Success Response (200 OK):** Returns invoices with customer name, booking reference, total amount, paid amount, and remaining balance.

# 5.2 Record Payment
- **Endpoint:** `POST /api/payments`
- **Access:** Authenticated (`superadmin`, `admin`, `manager`, `receptionist`, `accountant`)
- **Request Body:**
  ```json
  {
    "booking_id": 12,
    "amount": 15456.00,
    "payment_method": "telebirr",
    "notes": "Telebirr transaction confirmation #TB-902148"
  }
  ```
- **Success Response (201 Created):** Updates invoice paid amount and payment status (`paid`).

# 5.3 Get Expenses & Financial Summary
 **Endpoint:** `GET /api/expenses/summary`
 **Access:** Authenticated (`superadmin`, `admin`, `manager`, `accountant`)
 **Success Response (200 OK):** Returns total revenue, total operational expenses, settled payments, and net profit balance.

---

# 6. User Management & Security Audit Endpoints

# 6.1 Get Users Directory
 **Endpoint:** `GET /api/users`
 **Access:** Authenticated (`superadmin`, `admin`)
 **Query Parameters:** `search`, `role`, `is_active`, `page`, `limit`
 **Success Response (200 OK):**
  ```json
  {
    "users": [ ... ],
    "total": 14,
    "page": 1,
    "pageSize": 50
  }
  ```

# 6.2 Get Immutable Audit Logs
- **Endpoint:** `GET /api/audit-logs`
- **Access:** Authenticated (`superadmin`, `admin`)
- **Query Parameters:** `action`, `role`, `search`, `start_date`, `end_date`, `limit`
- **Success Response (200 OK):** Array of forensic audit log records with user name, role, action, entity type, details, status, IP address, and creation timestamp.

