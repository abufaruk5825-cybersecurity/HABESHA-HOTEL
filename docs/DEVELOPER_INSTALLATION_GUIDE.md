# DEVELOPER & INSTALLATION GUIDE
## Habesha Hotel Management System (SHMS)
**Target Audience:** Software Developers, DevOps Engineers, System Administrators  

---

# 1. System Requirements & Prerequisites

Ensure the following tools are installed on your host machine or server:
 **Node.js**: v20.x or v22.x LTS (tested on Node v24.12.0)
 **Package Manager**: `npm` (v10+)
 **Database Engine**: MySQL Server 8.0+ or MariaDB 10.6+
 **Git**: (Optional, for version control)

---

# 2. Step-by-Step Installation

# Step 1: Clone or Navigate to Project Directory
```bash
cd HABESHA-HOTEL
```

# Step 2: Install Node.js Dependencies
Install all required frontend and backend dependencies defined in `package.json`:
```bash
npm install
```

# Step 3: Configure Environment Variables
Create or verify the `.env` file in the project root:
```env
# Server Port
PORT=3000

# Database Connection (MySQL 8.0)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=habesha_hotel_db

# Security & Sessions
JWT_SECRET=habesha_hotel_jwt_super_secret_key_2026_shms

# Environment Mode (development | production)
NODE_ENV=development
```

# Step 4: Initialize and Verify Database
Ensure your local MySQL service is running on port 3306.
Execute the automated database connectivity and migration test script:
```bash
npm run test:db
```
*Output Expected:*
```
=== SHMS MySQL Database Check ===
Host: localhost:3306  User: root
✅ Database 'habesha_hotel_db' exists
✅ All 27 tables present
🏨 All checks passed — SHMS MySQL database is healthy!
```

---

# 3. Running the Application

### Development Mode (with Vite HMR)
Start the unified fullstack development server:
```bash
npm run dev
```
- **Local URL:** `http://localhost:3000`
- **Network URL:** `http://127.0.0.1:3000`

# Static Code Analysis & Linting
Run TypeScript type checking across the entire project:
```bash
npm run lint
```
*(Executes `tsc --noEmit` - should complete with 0 errors)*

# Production Build
Compile the client Single Page Application into minified production assets:
```bash
npm run build
```
*(Generates optimized bundles inside `dist/`)*
# Production Launch
To run the application in production mode:
```bash
npm run start
```

---

# 4. Default Seeded Credentials

The database comes pre-seeded with complete credentials for all 8 operational roles:

| Role | Email | Password | Full Name |
|---|---|---|---|
| **Super Admin** | `superadmin@habeshahotel.com` | `SuperAdmin123!` | Dawit Hailemariam |
| **Admin** | `admin@habeshahotel.com` | `Admin123!` | Selam Tesfaye |
| **Manager** | `manager@habeshahotel.com` | `Manager123!` | Bilal Ahmed |
| **Receptionist** | `reception@habeshahotel.com` | `Reception123!` | Firdews Mohammed |
| **Accountant** | `accountant@habeshahotel.com` | `Accountant123!` | Mahlet Kebede |
| **Housekeeper** | `housekeeping@habeshahotel.com` | `Clean123!` | Hiwot Tadesse |
| **Maintenance** | `maintenance@habeshahotel.com` | `Maintenance123!` | Sumeya Ahmed |
| **Guest / Customer** | `guest@habeshahotel.com` | `Guest123!` | Murad Kassim |

---

# 5. Troubleshooting & Maintenance

# 1. `ER_ACCESS_DENIED_ERROR` on Server Startup
 **Cause**: MySQL password in `.env` does not match your MySQL root password.
 **Solution**: Open `.env` and update `DB_PASSWORD` to match your local MySQL configuration.

# 2. Port 3000 Already in Use
 **Cause**: Another node process is currently occupying port 3000.
 **Solution**: In PowerShell, find and kill the process:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
  ```
  Or change `PORT=3001` in `.env`.

# 3. Database Migration or Schema Changes
 Database schema definitions are stored in `server/db/schema.sql`.
 Ethiopian seed data and default users are maintained in `server/db/seeds/seed.ts`.

