# USER MANUAL & OPERATING GUIDE
## Habesha Hotel Management System (SHMS)
**Audience:** All Hotel Operational Roles & Hotel Guests  
**Language Support:** English & Amharic (አማርኛ)  

---

## 1. General Interface Overview

The Habesha Hotel Management System provides two primary interfaces:
1. **Public Luxury Website**: Accessed at `http://localhost:3000/`. Displays room types, gastronomic menus, Ethiopian dining, services, staff, verified guest reviews, and direct booking dialogs.
2. **Management Portals**: Accessed by clicking **Login / Admin** in the navigation header or logging in directly.

### 1.1 Switching Language (English / Amharic)
Click the language toggle in the top-right header:
- **EN**: Displays the entire website in English.
- **አማርኛ**: Instantly translates all headings, descriptions, buttons, food items, prices, and forms into Amharic without refreshing the page.

### 1.2 Switching Dashboard Theme (Light Mode / Dark Mode)
Inside any management dashboard, look at the top navigation bar next to your profile:
- Click **Light**: Immediately switches the dashboard to a clean, crisp, executive light theme.
- Click **Dark**: Immediately restores the original luxury dark theme.
- *Note:* The public website always maintains its luxury dark hotel aesthetic regardless of dashboard theme toggling.

---

## 2. Guest (Customer) User Guide

### 2.1 Making a Room Reservation
1. Navigate to the homepage and locate the **Check Availability** bar in the Hero section.
2. Select your **Check-In Date**, **Check-Out Date**, and **Guests** count, then click **Check Availability**.
3. **Step 2 (Choose Room)**: Browse available rooms. Each card displays the bed configuration, maximum guests, room size, and nightly price in ETB. Click **Select** on your preferred room, then click **Continue to Services**.
4. **Step 3 (Food & Extras)**: Optionally add authentic Ethiopian culinary dishes (e.g. Clay Pot Shiro, Siga Tibs, Doro Wat) or hotel services (Airport Shuttle, Eucalyptus Steam Spa). Click **Continue to Guest Info**.
5. **Step 4 (Guest Details & Payment)**: Enter your Full Name, Email, Phone Number, Country, and Passport or ID Number. Select your preferred payment method (Telebirr, CBE Birr, Card, or Cash on Arrival). Click **Confirm Booking**.
6. View and print your official **Booking Confirmation Reference** (`AG-YYYY-XXXX`).

### 2.2 Accessing the Guest Portal
1. Click **Sign In / Portals** -> Log in with your email and password.
2. In the **Guest Dashboard**, you can:
   - View your upcoming stays and past reservation history.
   - Inspect itemized folios and download printable invoice receipts.
   - Order in-room dining and room service directly to your room.
   - Submit hotel reviews and 5-star ratings.
   - File service requests or customer recovery complaints.

---

## 3. Front-Desk Receptionist User Guide

### 3.1 Reviewing Daily Arrivals and Departures
1. Log in with receptionist credentials (`reception@habeshahotel.com`).
2. The default view displays:
   - **Today's Expected Arrivals**: List of guests arriving today with room number and booking reference.
   - **Today's Expected Departures**: List of guests vacating rooms today with remaining invoice balances.

### 3.2 Performing Guest Check-in
1. When a guest arrives, locate their reservation under **Today's Arrivals** or search their reference code (`AG-YYYY-XXXX`).
2. Verify their government passport or national ID against the customer record.
3. Verify that the room status is **Clean & Ready** (indicated by a green badge).
4. Click **Check In**. The system marks the booking `checked_in`, assigns the room to `occupied`, and creates an immutable security audit entry.
5. Issue the room keycard to the guest.

### 3.3 Performing Guest Checkout
1. Locate the departing guest under **Today's Departures** or the Room Grid.
2. Click **Check Out**. The system displays the final invoice folio.
3. If there is an outstanding balance, record the payment using **Cash**, **Telebirr**, or **Card**.
4. Click **Confirm Checkout**. The system:
   - Sets the booking status to `checked_out`.
   - Transitions the room status to `dirty`.
   - Automatically dispatches an urgent turnover task to the Housekeeping Dashboard.

### 3.4 Managing the 18-Room Visual Grid
1. Navigate to the **Room Status Board** tab.
2. View all 18 rooms across Floors 1 through 5 color-coded:
   - **Green**: Available & Ready.
   - **Amber**: Occupied by checked-in guest.
   - **Blue**: Reserved for incoming arrival.
   - **Orange**: Dirty (awaiting housekeeping).
   - **Rose**: Maintenance / Repair in progress.
3. Click any room card to view guest details, clean status, or record manual status overrides.

---

## 4. Housekeeping Staff User Guide

### 4.1 Viewing Cleaning Priority Queue
1. Log in with housekeeping credentials (`housekeeping@habeshahotel.com`).
2. The dashboard automatically prioritizes rooms:
   - **Urgent Priority**: Rooms vacated today with incoming guest arrivals.
   - **High Priority**: Standard checkout turnovers.
   - **Medium / Low Priority**: Stay-over refreshes and scheduled sanitization inspections.

### 4.2 Updating Turnover Status
1. When arriving at a room, click **Start Cleaning** (transitions task to `in_progress`).
2. Clean room, change bed linens, restock bathroom amenities, and sanitize surfaces.
3. Upon completion, click **Mark Clean & Ready**. The system automatically sets the task to `completed` and updates the physical room's operational status to `ready` on the Receptionist's board.

### 4.3 Reporting Maintenance Defects from Room
1. If you discover a damaged fixture (e.g., leaking faucet, air conditioner fault, damaged lock):
2. Click **Report Maintenance Issue**.
3. Select the Room Number, enter a description of the defect, select priority (`Low`, `Medium`, `High`, `Critical`), and click **Submit Ticket**.
4. The system automatically places the room into `under_repair` and dispatches the work order to the Maintenance department.

---

## 5. Maintenance & Engineering User Guide

### 5.1 Inspecting Work Orders
1. Log in with maintenance credentials (`maintenance@habeshahotel.com`).
2. Review the active repair queue categorized into: `Reported`, `In Progress`, and `Resolved`.
3. Critical tickets affecting room occupancy are flagged with urgent red banners.

### 5.2 Resolving Defects and Restoring Rooms
1. When beginning repair work, click **Start Work** (`status: in_progress`).
2. Perform necessary electrical, plumbing, or fixture repairs.
3. When finished, click **Resolve Ticket**.
4. Enter the **Actual Cost** of materials/labor in ETB and input **Resolution Notes**.
5. Click **Confirm Resolution**. The system marks the defect resolved and automatically releases the room back to operational status.

---

## 6. Accountant User Guide

### 6.1 Inspecting Guest Invoices & Folios
1. Log in with accountant credentials (`accountant@habeshahotel.com`).
2. Access the **Invoices & Folios** ledger.
3. Filter invoices by **Paid**, **Partially Paid**, or **Unpaid**.
4. Use the search bar to locate invoices by guest name, invoice number (`INV-2026-XXXX`), or booking reference.
5. Click any invoice row to view itemized room tariffs, 12% hospitality tax, and service charges.
6. Click **Print / Download PDF** to generate an official customer tax receipt.

### 6.2 Recording Payments & Tracking Expenses
1. For bank wire transfers or cash settlements, click **Record Payment** on any open invoice.
2. Enter the amount paid in ETB, select the payment rail (`telebirr`, `cbe_birr`, `bank_transfer`, `cash`), and record the reference code.
3. Under the **Expenses** tab, click **Log Expense** to record hotel operating costs:
   - Select Category: `Utilities` (Electric/Water), `Food & Beverage`, `Linen & Supplies`, or `Maintenance`.
   - Enter vendor name, payment method, amount in ETB, and reference number.
4. Review the **Financial Summary** card showing total revenue, total operational expenses, settled payments, and net profit balance.
5. Click **Export CSV** to download complete ledger spreadsheets for external audit.

---

## 7. Hotel Manager User Guide

### 7.1 Operational Supervision
1. Log in with manager credentials (`manager@habeshahotel.com`).
2. View the **Daily Hotel Operations Pulse**:
   - Total Rooms, Available Rooms, Occupied Rooms, and Occupancy Rate (%).
   - Today's Arrivals, Departures, and Active In-House Guests.
   - Pending Housekeeping Tasks & Unresolved Maintenance Tickets.
   - Active Guest Complaints requiring management recovery.

### 7.2 Resolving Guest Complaints
1. Navigate to the **Guest Complaints** tab.
2. Review guest complaints with priority flags (`Low`, `Medium`, `High`, `Critical`).
3. Click a complaint to review incident details and assigned department.
4. Input **Resolution Notes** (e.g. complimentary fruit basket, room upgrade, dinner voucher).
5. Click **Resolve Complaint**. The system archives the complaint and notifies the guest.

---

## 8. Direct Guest Communication & Official Channels

Guests and partners can communicate directly with hotel management via official digital channels:
- **Telegram Direct Channel**: [`@Abuzubeir1234`](https://t.me/Abuzubeir1234) — 24/7 instant messaging for urgent bookings, airport pickups, and direct concierge service.
- **Instagram Official Profile**: [`@seyaman5825`](https://instagram.com/seyaman5825) — Visual hotel showcase, VIP suite inquiries, and direct messaging (DM).
- **Reception Phone**: `+251 11 667 8000` (24/7 front desk hotline).
- **Hotel Email**: `reservations@habeshahotel.com`.
- **Location**: Bole Sub-City, Africa Avenue (Bole Road), Addis Ababa, Ethiopia (5 min from Bole Airport).


