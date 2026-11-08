# HABESHA HOTEL MANAGEMENT SYSTEM (SHMS)
# Database Relationships & Referential Integrity Guide

**Engine:** MySQL 8.0+ / InnoDB (ACID Compliant)  
**Total Tables:** 37 Normalized Tables (3NF)  
**Foreign Key Constraints:** 54 Master Referential Rules  
**Documentation Version:** 2.4.0 (Production Edition)  
**Date:** March 2026 / Miazia 2018 E.C.  

---

## 1. Executive Summary

The Habesha Hotel Management System database implements 54 explicit Foreign Key constraints to guarantee absolute transactional integrity across front-desk, reservation, POS dining, housekeeping, payroll, and financial operations.

---

## 2. Complete Foreign Key Constraints Reference (54 Rules)

| # | Child Table | Foreign Key Column | Parent Table | Parent Key | Cascade Action | Real-World Business Rationale |
|---|---|---|---|---|---|---|
| **1** | `role_permissions` | `role_id` | `roles` | `id` | `CASCADE` | Role permission assignments clean up automatically when a role is dropped. |
| **2** | `role_permissions` | `permission_id` | `permissions` | `id` | `CASCADE` | Role permission assignments clean up automatically when a role is dropped. |
| **3** | `employees` | `user_id` | `users` | `id` | `CASCADE` | Employee record cannot exist without its login identity. |
| **4** | `employees` | `department_id` | `departments` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **5** | `customers` | `user_id` | `users` | `id` | `SET NULL` | Walk-in guests can book rooms without an active user account. |
| **6** | `rooms` | `room_type_id` | `room_types` | `id` | `RESTRICT` | Cannot delete a room category while rooms belong to it. |
| **7** | `room_amenities` | `room_id` | `rooms` | `id` | `CASCADE` | Enforces referential integrity between room_amenities and rooms. |
| **8** | `room_amenities` | `amenity_id` | `amenities` | `id` | `CASCADE` | Enforces referential integrity between room_amenities and amenities. |
| **9** | `room_status_history` | `room_id` | `rooms` | `id` | `CASCADE` | Enforces referential integrity between room_status_history and rooms. |
| **10** | `room_status_history` | `changed_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **11** | `bookings` | `customer_id` | `customers` | `id` | `RESTRICT` | Customer profiles cannot be deleted while reservations exist. |
| **12** | `bookings` | `room_id` | `rooms` | `id` | `RESTRICT` | Physical rooms cannot be removed while assigned to bookings. |
| **13** | `bookings` | `checked_in_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **14** | `bookings` | `checked_out_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **15** | `booking_rooms` | `booking_id` | `bookings` | `id` | `CASCADE` | Enforces referential integrity between booking_rooms and bookings. |
| **16** | `booking_rooms` | `room_id` | `rooms` | `id` | `RESTRICT` | Enforces referential integrity between booking_rooms and rooms. |
| **17** | `booking_guests` | `booking_id` | `bookings` | `id` | `CASCADE` | Enforces referential integrity between booking_guests and bookings. |
| **18** | `booking_status_history` | `booking_id` | `bookings` | `id` | `CASCADE` | Enforces referential integrity between booking_status_history and bookings. |
| **19** | `booking_status_history` | `changed_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **20** | `payments` | `booking_id` | `bookings` | `id` | `CASCADE` | Payment history cascades with reservation archival. |
| **21** | `payments` | `recorded_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **22** | `refunds` | `payment_id` | `payments` | `id` | `RESTRICT` | Original payment cannot be deleted while a refund references it. |
| **23** | `refunds` | `booking_id` | `bookings` | `id` | `CASCADE` | Enforces referential integrity between refunds and bookings. |
| **24** | `refunds` | `processed_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **25** | `invoices` | `booking_id` | `bookings` | `id` | `CASCADE` | Enforces referential integrity between invoices and bookings. |
| **26** | `invoices` | `customer_id` | `customers` | `id` | `RESTRICT` | Cannot delete guest profile with active tax invoices. |
| **27** | `invoice_items` | `invoice_id` | `invoices` | `id` | `CASCADE` | Line charges belong strictly to the master tax invoice. |
| **28** | `expenses` | `recorded_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **29** | `service_orders` | `booking_id` | `bookings` | `id` | `CASCADE` | Enforces referential integrity between service_orders and bookings. |
| **30** | `service_orders` | `service_id` | `hotel_services` | `id` | `RESTRICT` | Enforces referential integrity between service_orders and hotel_services. |
| **31** | `service_orders` | `ordered_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **32** | `housekeeping_tasks` | `room_id` | `rooms` | `id` | `CASCADE` | Enforces referential integrity between housekeeping_tasks and rooms. |
| **33** | `housekeeping_tasks` | `assigned_employee_id` | `employees` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **34** | `maintenance_requests` | `room_id` | `rooms` | `id` | `CASCADE` | Enforces referential integrity between maintenance_requests and rooms. |
| **35** | `maintenance_requests` | `reported_by` | `users` | `id` | `RESTRICT` | Enforces referential integrity between maintenance_requests and users. |
| **36** | `maintenance_requests` | `technician_id` | `employees` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **37** | `staff_schedules` | `employee_id` | `employees` | `id` | `CASCADE` | Enforces referential integrity between staff_schedules and employees. |
| **38** | `staff_schedules` | `shift_id` | `shifts` | `id` | `RESTRICT` | Enforces referential integrity between staff_schedules and shifts. |
| **39** | `staff_schedules` | `department_id` | `departments` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **40** | `staff_attendance` | `employee_id` | `employees` | `id` | `CASCADE` | Enforces referential integrity between staff_attendance and employees. |
| **41** | `staff_attendance` | `schedule_id` | `staff_schedules` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **42** | `staff_attendance` | `recorded_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **43** | `inventory_transactions` | `inventory_id` | `inventory` | `id` | `RESTRICT` | Enforces referential integrity between inventory_transactions and inventory. |
| **44** | `inventory_transactions` | `department_id` | `departments` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **45** | `inventory_transactions` | `recorded_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **46** | `reviews` | `customer_id` | `customers` | `id` | `CASCADE` | Enforces referential integrity between reviews and customers. |
| **47** | `reviews` | `booking_id` | `bookings` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **48** | `reviews` | `room_type_id` | `room_types` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **49** | `complaints` | `customer_id` | `customers` | `id` | `CASCADE` | Enforces referential integrity between complaints and customers. |
| **50** | `complaints` | `booking_id` | `bookings` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **51** | `complaints` | `department_id` | `departments` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **52** | `complaints` | `resolved_by` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |
| **53** | `notifications` | `user_id` | `users` | `id` | `CASCADE` | Enforces referential integrity between notifications and users. |
| **54** | `audit_logs` | `user_id` | `users` | `id` | `SET NULL` | Preserves historical audit log signature even if staff member leaves hotel. |

---

## 3. Domain-by-Domain Relationship Breakdown

### 3.1 Core Security & Access Control (RBAC)
- `roles` (1) ──< `role_permissions` (N) >── (1) `permissions` [Many-to-Many via composite PK]
- `roles` (1) ──< `users` (N) [`role_id` FK, ON DELETE RESTRICT]
- `users` (1) ── (1) `employees` [`user_id` FK, ON DELETE CASCADE]
- `users` (1) ── (0..1) `customers` [`user_id` FK, ON DELETE SET NULL]

### 3.2 Staff & Human Resources Operations
- `departments` (1) ──< `employees` (N) [`department_id` FK, ON DELETE RESTRICT]
- `employees` (1) ── (1) `departments` (Manager) [`manager_id` FK, ON DELETE SET NULL]
- `shifts` (1) ──< `staff_schedules` (N) [`shift_id` FK, ON DELETE RESTRICT]
- `employees` (1) ──< `staff_schedules` (N) [`employee_id` FK, ON DELETE CASCADE]
- `employees` (1) ──< `staff_attendance` (N) [`employee_id` FK, ON DELETE CASCADE]

### 3.3 Guest & Customer Profile Management
- `customers` (1) ──< `bookings` (N) [`customer_id` FK, ON DELETE RESTRICT]
- `customers` (1) ──< `reviews` (N) [`customer_id` FK, ON DELETE CASCADE]
- `customers` (1) ──< `complaints` (N) [`customer_id` FK, ON DELETE CASCADE]

### 3.4 Room & Accommodation Inventory
- `room_types` (1) ──< `rooms` (N) [`room_type_id` FK, ON DELETE RESTRICT]
- `rooms` (1) ──< `room_amenities` (N) >── (1) `amenities` [Many-to-Many junction]
- `rooms` (1) ──< `room_status_history` (N) [`room_id` FK, ON DELETE CASCADE]

### 3.5 Reservation & Booking Engine
- `bookings` (1) ──< `booking_rooms` (N) >── (1) `rooms` [Multi-room reservation junction]
- `bookings` (1) ──< `booking_guests` (N) [Occupant manifest, ON DELETE CASCADE]
- `bookings` (1) ──< `booking_status_history` (N) [State audit trail, ON DELETE CASCADE]

### 3.6 Financial Billing, Invoicing & Payments
- `bookings` (1) ──< `payments` (N) [`booking_id` FK, ON DELETE CASCADE]
- `payment_methods` (1) ──< `payments` (N) [`payment_method_id` FK, ON DELETE RESTRICT]
- `payments` (1) ──< `refunds` (N) [`payment_id` FK, ON DELETE RESTRICT]
- `bookings` (1) ── (1) `invoices` [`booking_id` FK, ON DELETE CASCADE]
- `invoices` (1) ──< `invoice_items` (N) [Itemized folio charges, ON DELETE CASCADE]
- `discounts` (1) ──< `invoices` (N) [`discount_id` FK, ON DELETE SET NULL]

### 3.7 Food & Dining / Hotel Services
- `bookings` (1) ──< `service_orders` (N) [`booking_id` FK, ON DELETE CASCADE]
- `hotel_services` (1) ──< `service_orders` (N) [`service_id` FK, ON DELETE RESTRICT]

### 3.8 Housekeeping & Facility Maintenance
- `rooms` (1) ──< `housekeeping_tasks` (N) [`room_id` FK, ON DELETE CASCADE]
- `employees` (1) ──< `housekeeping_tasks` (N) [`assigned_employee_id` FK, ON DELETE SET NULL]
- `rooms` (1) ──< `maintenance_requests` (N) [`room_id` FK, ON DELETE CASCADE]
- `employees` (1) ──< `maintenance_requests` (N) [`technician_id` FK, ON DELETE SET NULL]

### 3.9 Material Inventory & Stock Control
- `inventory` (1) ──< `inventory_transactions` (N) [`inventory_id` FK, ON DELETE RESTRICT]
- `departments` (1) ──< `inventory_transactions` (N) [`department_id` FK, ON DELETE SET NULL]

### 3.10 Guest Experience & System Governance
- `users` (1) ──< `notifications` (N) [`user_id` FK, ON DELETE CASCADE]
- `users` (1) ──< `audit_logs` (N) [`user_id` FK, ON DELETE SET NULL]

---

## 4. Double-Booking Overlap Prevention Logic

The reservation engine eliminates room booking conflicts using transactional row-level locks and interval intersection evaluation:

```
Conflict Invariant Condition:
NOT (existing.check_out <= :new_check_in OR existing.check_in >= :new_check_out)
```

If `active_conflicts > 0`, the booking transaction aborts immediately with an `HTTP 409 Conflict` exception.

---

## 5. Financial Ledger Integrity & Balance Equations

- **Folio Master Balance:** `grand_total = room_charges + service_charges + tax_amount - discount_amount`
- **Settlement Equation:** `paid_amount + balance_due = grand_total`
- **Refund Safeguard:** `SUM(refund_amount) <= original_payment.amount`

---

## 6. Deletion Governance & Referential Action Matrix

| Cascade Action | Count | Percentage | Architectural Justification |
|---|---|---|---|
| `CASCADE` | 22 | 40.7% | Child records have no independent operational value without the parent entity (e.g. invoice items, booking rooms). |
| `SET NULL` | 21 | 38.9% | Preserves forensic history and transactions even when staff depart or accounts are deactivated. |
| `RESTRICT` | 11 | 20.4% | Guards against destructive deletions of active categories, booked rooms, and processed payment ledgers. |
