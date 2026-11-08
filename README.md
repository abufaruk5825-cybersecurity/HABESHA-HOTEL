# HABESHA-HOTEL - Smart Hotel Management System (SHMS)

Enterprise-grade, fullstack Smart Hotel Management System featuring a luxury public guest booking portal and eight dedicated role-based operational dashboards for Super Administrators, Administrators, Hotel Managers, Receptionists, Accountants, Housekeeping Staff, Maintenance Technicians, and Guests.

---

## 1. Project Overview

**HABESHA-HOTEL SHMS** is a real-world, production-oriented hotel hospitality platform engineered specifically for Habesha Hotel located in Bole Sub-City, Africa Avenue, Addis Ababa, Ethiopia. It delivers end-to-end automation of hotel operations—from online room availability searching, dynamic room pricing, and double-booking prevention to front-desk check-in, keycard management, urgent housekeeping turnovers, maintenance ticketing, and financial folios.

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express.js RESTful API, TypeScript runtime (`tsx`)
- **Database**: Relational Database Engine (MySQL 8.0 with connection pooling, ACID transactions, and foreign key enforcement)
- **Authentication**: JWT (JSON Web Tokens) with secure HTTP-only cookies and Bearer Authorization headers
- **Architecture**: Decoupled MVC / Controller-Service-Repository architecture with automated Audit Logging and Role-Based Access Control (RBAC)
- **Internationalization (i18n)**: Instantaneous, bidirectional translation between English and Amharic (አማርኛ)

---

## 2. Comprehensive Documentation Suite

Complete, professional, university-grade documentation is located in the [**`docs/`**](./docs/) directory:

| Document | File Path | Scope & Focus |
|---|---|---|
| **Complete Project Report** | [`docs/PROJECT_REPORT.md`](./docs/PROJECT_REPORT.md) | Six-chapter formal thesis: Introduction, System Analysis, System Design, Implementation, Testing & Test Cases, Conclusion & Recommendations. |
| **Software Requirements Specification** | [`docs/SRS.md`](./docs/SRS.md) | Complete functional and non-functional requirements, user class matrices, and hardware/software specifications. |
| **Software Design Document** | [`docs/SDD.md`](./docs/SDD.md) | Three-tier architecture, component decomposition, database transactions, and scoped theme isolation. |
| **Database Documentation** | [`docs/DATABASE_DOCUMENTATION.md`](./docs/DATABASE_DOCUMENTATION.md) | 37 normalized relational tables (3NF), data dictionary, ERD, foreign key cascades, and indexes. |
| **Database Table Reference** | [`docs/DATABASE_TABLE_REFERENCE.md`](./docs/DATABASE_TABLE_REFERENCE.md) | Master table & column reference specification for all 37 tables with visual cards and cascade rules. |
| **Entity Relationship Diagram** | [`docs/ER_DIAGRAM.md`](./docs/ER_DIAGRAM.md) | High-resolution visual ERD diagram and relation mapping for all 37 database tables. |
| **REST API Reference** | [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) | Complete endpoint catalog, methods, headers, request bodies, query parameters, and JSON responses. |
| **User Manual** | [`docs/USER_MANUAL.md`](./docs/USER_MANUAL.md) | Step-by-step operational workflows for Guests, Receptionists, Housekeeping, Maintenance, Accountants, and Managers. |
| **Administrator & Super Admin Manual** | [`docs/ADMINISTRATOR_MANUAL.md`](./docs/ADMINISTRATOR_MANUAL.md) | User account lifecycle, RBAC permissions matrix, branch governance, global settings, and immutable audit logs. |
| **Developer & Setup Guide** | [`docs/DEVELOPER_INSTALLATION_GUIDE.md`](./docs/DEVELOPER_INSTALLATION_GUIDE.md) | Prerequisites, environment setup, MySQL configuration, testing, and troubleshooting. |

---

## 3. Operational Roles & Pre-Seeded Accounts

The system includes pre-seeded accounts representing all eight operational roles:

| Role | Name | Email | Password |
|---|---|---|---|
| **Super Administrator** | Dawit Hailemariam | `superadmin@habeshahotel.com` | `SuperAdmin123!` |
| **Administrator** | Selam Tesfaye | `admin@habeshahotel.com` | `Admin123!` |
| **Hotel Manager** | Bilal Ahmed | `manager@habeshahotel.com` | `Manager123!` |
| **Receptionist** | Firdews Mohammed | `reception@habeshahotel.com` | `Reception123!` |
| **Accountant** | Mahlet Kebede | `accountant@habeshahotel.com` | `Accountant123!` |
| **Housekeeper** | Hiwot Tadesse | `housekeeping@habeshahotel.com` | `Clean123!` |
| **Maintenance** | Sumeya Ahmed | `maintenance@habeshahotel.com` | `Maintenance123!` |
| **Guest / Customer** | Murad Kassim | `guest@habeshahotel.com` | `Guest123!` |

---

## 4. Normalized 37-Table MySQL Database Schema

The database consists of **37 normalized relational tables (3NF)** organized into eight interconnected operational subsystems:

### Module 1: Core Security & Access Control (RBAC)
1. `roles` — System authorization tiers (7 distinct roles: superadmin, admin, manager, receptionist, accountant, housekeeper, customer)
2. `permissions` — Granular system capabilities and action permissions
3. `role_permissions` — Associative RBAC mapping between roles and permissions
4. `users` — User credentials, Bcrypt password hashes, and profile metadata

### Module 2: Staff & Human Resources Operations
5. `departments` — Hotel administrative and operational departments
6. `employees` — Staff employment profiles, positions, compensation, and hire dates
7. `shifts` — Operational working shifts (Morning, Evening, Night)
8. `staff_schedules` — Employee weekly shift rosters and department assignments
9. `staff_attendance` — Biometric/clock-in timesheet records and attendance logs

### Module 3: Guest Management
10. `customers` — Registered guest profiles, national ID/passport numbers, and preferences

### Module 4: Rooms & Amenities Management
11. `room_types` — Specifications, capacities, base pricing in ETB, and photo galleries
12. `rooms` — Physical room inventory with operational conditions and cleaning states
13. `amenities` — Available room features and hotel facilities catalog
14. `room_amenities` — Associative mapping between room types and amenities
15. `room_status_history` — Audit trail for room condition and availability transitions

### Module 5: Reservations Subsystem
16. `bookings` — Master reservation ledger with ETB currency standard
17. `booking_rooms` — Multi-room booking allocations and nightly room rates
18. `booking_guests` — Manifest of staying guest occupants under reservations
19. `booking_status_history` — Reservation lifecycle state progression log

### Module 6: Finance, Billing & Accounting
20. `payment_methods` — Supported payment channels (Telebirr, CBE Birr, Bank Wire, Card, Cash)
21. `payments` — Transaction records with multi-channel payment integration
22. `refunds` — Cancellation and customer refund ledger
23. `invoices` — Official tax folios with 12% hospitality tax & line-item totals
24. `invoice_items` — Itemized room tariffs, dining, and spa line items
25. `expenses` — Operational expense tracking ledger for accountants
26. `discounts` — Promotional discount vouchers and seasonal incentive codes

### Module 7: Hotel Operations & Services
27. `hotel_services` — Extra services catalog and authentic Ethiopian dining menu
28. `service_orders` — In-room dining orders and guest service requests
29. `housekeeping_tasks` — Room cleaning turnover priority queue and inspection logs
30. `maintenance_requests` — Facility repair work orders and engineering defect tracking
31. `inventory` — Hotel consumables catalog (linens, toiletries, F&B supplies, parts)
32. `inventory_transactions` — Stock audit trail (purchases, usage, write-offs, adjustments)

### Module 8: Guest Experience & System Governance
33. `reviews` — Verified guest ratings (1-5 stars) and testimonials
34. `complaints` — Service recovery tickets and management resolution notes
35. `notifications` — Real-time in-app user notifications and alerts
36. `audit_logs` — Immutable forensic security audit trail (68+ events logged)
37. `hotel_settings` — Dynamic hotel metadata and configuration (Taxes, contacts, social handles)

---

## 5. Development & Running Commands

```bash
# 1. Install dependencies
npm install

# 2. Check and verify MySQL database connectivity & tables
npm run test:db

# 3. Start fullstack Express development server with Vite middleware on port 3000
npm run dev

# 4. Verify TypeScript static type safety (0 errors)
npm run lint

# 5. Build optimized client bundle for production
npm run build

# 6. Start production server
npm start
```

---

## 6. Environment Variables

Configured in `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shms
JWT_SECRET=habesha_hotel_jwt_super_secret_key_2026_shms
NODE_ENV=development
```
