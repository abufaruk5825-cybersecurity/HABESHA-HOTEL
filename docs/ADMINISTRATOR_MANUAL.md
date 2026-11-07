# ADMINISTRATOR & SUPER ADMIN MANUAL
# Habesha Hotel Management System (SHMS)

**Audience:** Hotel General Administrators & Enterprise Super Administrators  
**Access Tier:** Elevated Privilege Administrative Portals  

---

# 1. Role Distinctions & Security Hierarchy

- **Administrator (`admin`)**: Manages physical hotel operations for a branch: room inventory, night pricing, reservation adjustments, staff accounts, general hotel settings, and financial folios.
- **Super Administrator (`superadmin`)**: Highest platform authority. Governs multiple hotel branches, assigns/revokes granular permissions in the RBAC matrix, provisions or deletes administrator accounts, and reviews immutable forensic audit logs.

---

# 2. Administrator Operations Guide (`/admin`)

# 2.1 Room Inventory Management

1. Log in with admin credentials (`admin@habeshahotel.com`).
2. Navigate to the **Rooms Management** section.
3. **Add New Room**: Click **+ Add Room**. Enter the room number, select room type, floor number, nightly price in ETB, and operational status. Click **Save Room**.
4. **Edit Room Configuration**: Click **Edit** on any room card to adjust night rates, floor allocations, or operational notes.
5. **Set Maintenance Override**: Manually mark rooms as `out_of_service` or `maintenance` during scheduled refurbishments.

# 2.2 Global Hotel Settings & Policies

1. Navigate to **Hotel Settings**.
2. Configure core operational parameters:
    **Hotel Brand Name**: Change displayed brand across website and invoices.
    **Tax Rate (%)**: Adjust the standard hospitality tax rate (default: `12.0%`).
    **Standard Check-in / Checkout Time**: Set default check-in (`14:00`) and check-out (`11:00`) hours.
    **Contact Information**: Update hotel telephone number, email, and Bole address.
    **Currency Formatting**: Default currency symbol (`ETB`).
3. Click **Save Settings**. The system updates settings in `hotel_settings` and logs the change to the audit trail.

---

# 3. Super Administrator Governance Guide (`/superadmin`)

# 3.1 User Account Management

1. Log in with superadmin credentials (`superadmin@habeshahotel.com`).
2. Navigate to **User Management** (Administrators tab).
3. **View Accounts**: Review all 14+ registered accounts across all roles with status badges (Active: Green, Inactive: Rose).
4. **Search & Filter**: Search by name, email, or telephone. Filter by Role or Department.
5. **Create New User**: Click **+ Create User**:
    Enter Full Name, Email, Phone Number.
    Select Role: `admin`, `manager`, `receptionist`, `accountant`, `housekeeper`, `maintenance`, or `customer`.
   Set Initial Password (minimum 6 characters).
    Assign Department and Employee Code.
     Click **Create Account**.
6. **Activate / Deactivate**: Click the toggle switch on any account to immediately disable or enable access. Disabled users cannot log in.
7. **Delete User**: Super Administrators can permanently remove user accounts. (Admins cannot delete Super Admin accounts).

# 3.2 Role-Based Access Control (RBAC) Matrix
1. Navigate to **Security & Settings** -> **Permissions Matrix**.
2. Review the permission matrix linking roles to capabilities (e.g. `rooms.create`, `bookings.check_in`, `payments.record`, `audit.view`).
3. Super Admins can dynamically grant or revoke specific operational permissions per role, immediately enforced across all API endpoints.

# 3.3 Immutable Forensic Audit Logs
1. Navigate to **Audit Logs**.
2. The audit ledger provides a full, tamper-proof forensic trace of all administrative logins, room status adjustments, payments, and system mutations.
3. Each audit entry displays:
      **Date & Time**: Exact timestamp in East Africa Time (`+03:00`).
      **User / Account**: Full name and email of the actor.
       **Role**: Role at the time of execution.
       **Action**: Event code (e.g., `USER_LOGIN`, `GUEST_CHECK_IN`, `ROOM_STATUS_CHANGE`, `PAYMENT_RECORD`, `SETTINGS_UPDATE`).
       **Affected Entity**: Target table and entity ID (e.g. `bookings #12`).
       **Details**: Full human-readable context.
       **Status**: `success` or `failed`.
       **IP Address**: Client IPv4/IPv6 origin.
4. **Filtering**: Filter by Role, Action, Date Range, or free-text search.
5. **Exporting**: Click **Export CSV** to download the complete audit trail for compliance and security auditing.

# 3.4 Multi-Branch Management
1. Navigate to **Hotel Branches**.
2. View connected properties (e.g., *Habesha Hotel - Bole Airport Luxury Tower*, *Habesha Boutique Suites - Kazanchis*).
3. Super Admins can add new hotel branches, assign branch administrators, and monitor cross-branch occupancy rates.

