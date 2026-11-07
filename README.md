# HABESHA-HOTEL - Smart Hotel Management System (SHMS)

Enterprise-grade, fullstack Smart Hotel Management System featuring a luxury public guest booking portal and five dedicated role-based operational dashboards for Administrators, Hotel Managers, Receptionists, Housekeeping Staff, and Guests.



## 1. Project Overview

**HABESHA-HOTEL SHMS** is a real-world, production-oriented hotel hospitality platform designed for modern boutique and luxury hotel chains. It delivers end-to-end automation of hotel operations—from public availability search, dynamic room pricing, and double-booking prevention to front-desk check-in, keycard management, urgent housekeeping turnovers, maintenance ticketing, and financial folios.

 **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
 **Backend**: Node.js, Express.js RESTful API, TypeScript (`tsx`)
 **Database**: Relational Database Engine (`better-sqlite3` with ACID transactions, Write-Ahead Logging, and foreign key enforcement)
 **Authentication**: JWT (JSON Web Tokens) with secure HTTP-only cookies and Bearer Authorization headers
 **Architecture**: Decoupled MVC / Controller-Service-Repository architecture with Audit Logging and Role-Based Access Control (RBAC)



## 2. Key Features by Role

### A. Public Guest Portal & Hotel Website
 **Availability Search Engine**: Real-time room availability calculation taking into account conflicting date overlaps, room operational readiness, and guest capacity.
 **Accommodations Showcase**: Room type catalog spanning Standard Rooms, Deluxe Kings, Executive Club Quarters, and Presidential Suites with high-resolution imagery and specifications.
 **Multi-Step Booking Flow**:
  1. Live date range & room selection with automatic tax calculation.
  2. Signature luxury add-ons (Breakfast Buffet, Mercedes Airport Chauffeur, Swedish Spa, In-Room Candlelit Dining).
  3. Guest legal credentials and special preferences.
  4. Instant booking confirmation reference (`AG-YYYY-XXXX`) and printable invoice folio.
 **Hotel Amenities & Gastronomy**: Showcases Michelin-inspired dining, thermal baths, diplomatic boardrooms, and 24/7 concierge.
 **Verified Patron Reviews**: Real guest reviews with 5-star ratings and verified stay badges, plus interactive review submission.
 **Concierge Desk**: Interactive inquiry form and interactive FAQ accordion.

### B. Administrator Dashboard (`/admin`)
 **Executive Analytics**: Real-time KPIs calculated from the database—Settled Revenue, Outstanding Balances, Average Daily Rate (ADR), Revenue Per Available Room (RevPAR), Occupancy %, and Active Stays.
 **Room Management**: Add rooms, update floor assignments, configure night prices, and override operational statuses.
 **Reservation Ledger**: Complete booking audit with filters by status, guest search, date ranges, and folio inspection.
 **Financial Folios & Payments**: Track cash, card, and wire transfer payments; inspect invoices and download printable receipts.
 **User & Staff Directory**: Create staff credentials, manage roles, departments, salaries, and account activation states.
 **Global Settings & Policies**: Live adjustment of hotel brand name, tax rate (%), currency symbol, cancellation policies, and standard check-in/out hours.
 **Business Data Export**: Instant one-click CSV export for all bookings, payments, and room states.

### C. Hotel Manager Dashboard (`/manager`)
 **Daily Operations Pulse**: Real-time monitor for clean rooms, in-house guests, dirty rooms, maintenance faults, and guest requests.
 **Room Readiness Board**: Visual matrix separating booking reservation state from physical operational readiness.
 **Housekeeping Coordination**: Schedule and assign room turns to housekeeping specialists with urgency flags.
 **Maintenance & Engineering**: Log damaged fixtures, assign technicians, track repair costs, resolve faults, and release rooms safely back into service.
 **Guest Inquiries & Recovery**: Review guest complaints, assign responsible departments, and record resolution notes.

### D. Receptionist Dashboard (`/reception`)
 **Today's Expected Arrivals**: 1-click guest check-in (validates room cleanliness, marks booking `checked_in`, sets room to `occupied`, logs receptionist).
 **Today's Expected Departures**: 1-click checkout (tallies final charges, prints receipt, sets booking `checked_out`, sets room to `dirty`, and automatically dispatches an urgent Housekeeping clean task).
 **Walk-In Registration Desk**: Rapidly register unbooked walk-in travelers, assign an available clean room, collect deposit, and issue keycards immediately.
 **Interactive 18-Room Board**: Live visual matrix across all 5 hotel floors with colored status badges (Available, Occupied, Reserved, Dirty, Maintenance).
 **Payment Collection**: Record partial or full payments in Cash, Card, or Wire Transfer.

### E. Housekeeping Dashboard (`/housekeeping`)
 **Cleaning Priority Queue**: Prioritizes urgent checkout rooms to prepare for incoming same-day arrivals.
 **Status Workflow**: Instant toggles (`Start Cleaning` -> `Mark Clean & Ready`).
 **Defect Reporting**: Direct 1-click maintenance reporting from any room (e.g. AC faults, plumbing leaks).
 **Sanitation Matrix**: Floor-by-floor view of clean vs. dirty rooms.

### F. Guest Portal (`/customer`)
 **Active Reservations**: View upcoming stay details, room numbers, and dates.
 **In-Room Dining & Amenities Order**: Request breakfast, champagne, or spa appointments directly to the active room.
 **Printable Invoices & Receipts**: Download and print itemized official tax folios.
 **Reservation Cancellation**: Self-service cancellation following the hotel's 48-hour free cancellation policy.
 **Concierge Requests**: Request hypoallergenic bedding, late check-out, or transit assistance.


## 3. Relational Database Design (26 Tables)

The database schema is fully normalized with foreign keys, checks, timestamps, and indexes:

1. `users` — System accounts, passwords (bcrypt), roles, avatars
2. `roles` — Role definitions (admin, manager, receptionist, housekeeper, customer)
3. `permissions` — System permission codes
4. `role_permissions` — Many-to-many role to permission matrix
5. `employees` — Staff profiles, employee codes, departments, positions, salaries
6. `departments` — Operational hotel departments (Executive, Front Desk, Housekeeping, Engineering, Food & Beverage)
7. `customers` — Guest contact profiles, preferences, identification documents
8. `room_types` — Room categories, descriptions, base prices, capacity, bed types, dimensions
9. `rooms` — Physical room inventory (Room number, floor, status, operational status, night rate)
10. `amenities` — Catalog of in-room and hotel amenities
11. `room_amenities` — Many-to-many room to amenity mapping
12. `bookings` — Reservations, dates, actual check-in/out, guests count, financial totals, status
13. `booking_rooms` — Assigned rooms per booking
14. `booking_guests` — Primary and secondary guest rosters
15. `payments` — Audited transaction records (Cash, Card, Bank Transfer, Online)
16. `invoices` — Official tax folios, subtotals, tax rates, balance due
17. `invoice_items` — Line items (Room nights, dining, spa, taxes, discounts)
18. `hotel_services` — Catalog of hotel experiences and amenities
19. `service_orders` — In-room orders linked to guest bookings
20. `housekeeping_tasks` — Cleaning assignments, priority levels, task types, statuses
21. `maintenance_requests` — Defect tickets, technician assignments, repair costs
22. `reviews` — Verified guest feedback and star ratings
23. `notifications` — Role-based operational alerts and notifications
24. `complaints` — Service recovery tickets and resolution notes
25. `audit_logs` — Immutable security audit trail
26. `hotel_settings` — Key-value system configuration (Taxes, policies, contacts)



## 4. Default Demonstration Accounts

The system includes pre-seeded demonstration accounts with instant 1-click switching from the top navigation bar:

   Role                  Name              Email                   Default Password 

 **Administrator**      Sarah Jenkins   `admin@habeshahotel.com`          `Admin123!` 
 **Hotel Manager**      David Miller     `manager@habeshahotel.com`        `Manager123!` 
 **Receptionist**       Elena Rostova    `reception@habeshahotel.com`      `Reception123!` 
 **Housekeeper**        Carlos Rivera    `housekeeping@habeshahotel.com`    `Clean123!` 
 **Guest / Customer**   Alexander Wright  `guest@habeshahotel.com`          `Guest123!` 

*You can also register any new customer account or log in via the "Sign In" modal.*



## 5. Development & Running Commands

```bash
# Install dependencies
npm install

# Start Express fullstack server with Vite middleware on port 3000
npm run dev

# Validate TypeScript type safety
npm run lint

# Build for production
npm run build

# Start production server
npm start
```


## 6. Environment Variables

Defined in `.env.example`:

env
PORT=3000
JWT_SECRET=habesha_hotel_jwt_super_secret_key_2026_shms
DATABASE_FILE=shms.db
NODE_ENV=development


