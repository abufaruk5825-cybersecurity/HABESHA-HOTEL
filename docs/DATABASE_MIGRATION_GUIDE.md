# HABESHA HOTEL MANAGEMENT SYSTEM (SHMS)
# Database Migration & Data Safety Guide

This guide describes the safe deployment, verification, and migration protocols for the **HABESHA-HOTEL Smart Hotel Management System (SHMS)** database.

---

## 1. Safety Principles & Data Protection Rules

1. **Never Drop Existing Tables in Production:**  
   All schema definition scripts utilize `CREATE TABLE IF NOT EXISTS` and non-destructive column additions.
2. **Atomic Schema Upgrades:**  
   Schema updates run inside MySQL transactions where supported, or statement-by-statement with explicit error trapping for idempotency.
3. **Backup Before Every Migration:**  
   Always export a full logical SQL dump before running migrations on live installations.

---

## 2. Pre-Migration Database Backup

Before executing schema updates or database migrations, perform a full backup of the `shms` database:

### Using `mysqldump` (Command Line):
```bash
# Windows PowerShell / CMD
mysqldump -u root -p --routines --triggers --single-transaction shms > "backup_shms_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
```
*Enter your MySQL root password (as configured in `.env`).*

### Using MySQL Workbench:
1. Open **MySQL Workbench** and connect to your database.
2. From the top menu, navigate to **Server** → **Data Export**.
3. Select the **`shms`** schema.
4. Check **Include Create Schema**, select **Export to Self-Contained File**, and click **Start Export**.

---

## 3. Running Database Migrations

### Method 1: Automatic Migration on Server Startup (Zero-Config)
The application is pre-configured to execute database migrations and seed synchronizations automatically upon boot:
```bash
npm run dev
# or
npm start
```
**What happens under the hood:**
1. `server/src/server.ts` invokes `seedDatabase()` from `server/db/seeds/seed.ts`.
2. `initDatabase()` reads `server/db/schema.sql` and applies any missing tables, indexes, or constraints without disturbing existing data.
3. `syncEthiopianDefaults()` executes non-destructive `INSERT IGNORE` and `UPDATE` statements to synchronize currency, roles, payment methods, shifts, and inventory items.

---

### Method 2: Manual Migration via MySQL CLI
If performing a manual database migration or setting up a clean server:
```bash
# 1. Log in to MySQL
mysql -u root -p

# 2. Select database
USE shms;

# 3. Import updated schema
SOURCE server/db/schema.sql;

# 4. Verify table count (should return 37 tables)
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'shms';
```

---

## 4. Post-Migration Verification

Run the project's automated database test suite to verify table counts, foreign keys, and sample records:
```bash
npm run test:db
```

### Expected Output Summary:
```text
=== SHMS MySQL Database Check ===
Host: localhost:3306  User: root

✅ Connected to MySQL 8.0.x
✅ Database "shms" already exists
✅ Schema executed successfully (37 tables verified)

--- Row counts (All 37 Tables) ---
  ✅ roles                      8 rows
  ✅ permissions                25 rows
  ✅ role_permissions           60 rows
  ✅ users                      8 rows
  ✅ departments                6 rows
  ✅ employees                  6 rows
  ✅ customers                  4 rows
  ✅ room_types                 8 rows
  ✅ rooms                      18 rows
  ✅ amenities                  12 rows
  ✅ room_amenities             36 rows
  ✅ room_status_history        1 rows
  ✅ bookings                   5 rows
  ✅ booking_rooms              5 rows
  ✅ booking_guests             5 rows
  ✅ booking_status_history     1 rows
  ✅ payment_methods            5 rows
  ✅ payments                   5 rows
  ✅ refunds                    1 rows
  ✅ invoices                   5 rows
  ✅ invoice_items              15 rows
  ✅ expenses                   5 rows
  ✅ discounts                  3 rows
  ✅ hotel_services             11 rows
  ✅ service_orders             6 rows
  ✅ housekeeping_tasks         4 rows
  ✅ maintenance_requests       3 rows
  ✅ shifts                     3 rows
  ✅ staff_schedules            5 rows
  ✅ staff_attendance           5 rows
  ✅ inventory                  9 rows
  ✅ inventory_transactions     9 rows
  ✅ reviews                    5 rows
  ✅ complaints                 3 rows
  ✅ notifications              8 rows
  ✅ audit_logs                 12 rows
  ✅ hotel_settings             14 rows
```

---

## 5. Rollback Procedure

If a migration encounters an unrecoverable host error, restore the database from the pre-migration backup:
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS shms; CREATE DATABASE shms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Restore from backup file
mysql -u root -p shms < backup_shms_YYYYMMDD_HHMMSS.sql
```
Restart the application with `npm run dev` to resume normal operation.

