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
| **Database Documentation** | [`docs/DATABASE_DOCUMENTATION.md`](./docs/DATABASE_DOCUMENTATION.md) | 27 normalized relational tables (3NF), data dictionary, ERD, foreign key cascades, and indexes. |
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

## 4. Normalized 27-Table MySQL Database Schema

1. `roles` — System access roles
2. `permissions` — Granular system capabilities
3. `role_permissions` — Associative RBAC mapping
4. `users` — User credentials and authentication profiles
5. `departments` — Hotel administrative and operational departments
6. `employees` — Staff employment records, positions, and salaries
7. `customers` — Guest identity, passport/ID numbers, and contact details
8. `room_types` — Specifications, capacities, bed types, and galleries
9. `rooms` — Physical room inventory with operational and cleanliness states
10. `amenities` — Hotel amenities catalog
11. `room_amenities` — Room-amenity associative mapping
12. `bookings` — Master reservation ledger
13. `booking_rooms` — Multi-room booking allocations
14. `booking_guests` — Occupant names under single reservations
15. `payments` — Transaction records with Telebirr, CBE Birr, Card, and Cash methods
16. `invoices` — Official tax folios with 12% hospitality tax
17. `invoice_items` — Itemized room tariffs, dining, and spa line items
18. `hotel_services` — Extra services and authentic Ethiopian dining menu
19. `service_orders` — In-room dining and service orders
20. `housekeeping_tasks` — Cleaning turnover priority queue
21. `maintenance_requests` — Engineering work orders and defect tracking
22. `reviews` — Verified guest ratings (1-5 stars) and testimonials
23. `notifications` — Real-time in-app user notifications
24. `complaints` — Service recovery tickets and management resolution notes
25. `audit_logs` — Immutable forensic security audit trail
26. `hotel_settings` — Key-value system configuration (Taxes, policies, contacts)
27. `expenses` — Operational expense tracking ledger for accountants

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
DB_NAME=habesha_hotel_db
JWT_SECRET=habesha_hotel_jwt_super_secret_key_2026_shms
NODE_ENV=development
```
