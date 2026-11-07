import bcrypt from 'bcryptjs';
import { pool, execute, query, queryOne, initDatabase } from '../database.ts';

export async function syncEthiopianDefaults() {
  try {
    // 1. Hotel Settings - Ethiopian Currency & Contact
    await execute("UPDATE hotel_settings SET value='Bole Sub-City, Africa Avenue (Bole Road), Addis Ababa, Ethiopia' WHERE `key`='hotel_address'");
    await execute("UPDATE hotel_settings SET value='+251 11 667 8000' WHERE `key`='hotel_phone'");
    await execute("UPDATE hotel_settings SET value='reservations@habeshahotel.com' WHERE `key`='hotel_email'");
    await execute("UPDATE hotel_settings SET value='ETB' WHERE `key`='currency_symbol'");
    await execute("UPDATE hotel_settings SET value='ETB' WHERE `key`='currency_code'");

    // Ensure users.role and payments.payment_method column types support new roles and methods
    try {
      await pool.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'customer'");
      await pool.query("ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'telebirr'");
      await pool.query("ALTER TABLE audit_logs ADD COLUMN status VARCHAR(50) DEFAULT 'success'");
    } catch (_) {}

    // Ensure roles table contains all 7 independent roles
    try {
      await pool.query("INSERT IGNORE INTO roles (name, description) VALUES ('superadmin', 'System-wide governance, multiple branches & platform security')");
      await pool.query("INSERT IGNORE INTO roles (name, description) VALUES ('accountant', 'Hotel financials, payments, invoices, income & expense ledger')");
    } catch (_) {}

    // Create expenses table if missing
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'ETB',
          payment_method VARCHAR(50) DEFAULT 'bank_transfer',
          reference_number VARCHAR(100),
          expense_date DATE NOT NULL,
          recorded_by INT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
    } catch (_) {}

    // Ensure Super Admin and Accountant exist with valid password hashes
    const salt = await bcrypt.genSalt(10);
    const superAdminPass = await bcrypt.hash('SuperAdmin123!', salt);
    const accountantPass = await bcrypt.hash('Accountant123!', salt);
    const maintenancePass = await bcrypt.hash('Maintenance123!', salt);

    const saExist = await queryOne<{ id: number }>("SELECT id FROM users WHERE email='superadmin@habeshahotel.com'");
    let superAdminId: number;
    if (!saExist) {
      const res = await execute(
        "INSERT INTO users (email, password_hash, role, full_name, phone, avatar_url, is_active) VALUES ('superadmin@habeshahotel.com', ?, 'superadmin', 'Dawit Hailemariam', '+251 91 000 1122', '/images/staff/dawit-manager.jpg', 1)",
        [superAdminPass]
      );
      superAdminId = res.insertId;
    } else {
      superAdminId = saExist.id;
      await execute("UPDATE users SET role='superadmin', full_name='Dawit Hailemariam', avatar_url='/images/staff/dawit-manager.jpg' WHERE id=?", [superAdminId]);
    }

    const accExist = await queryOne<{ id: number }>("SELECT id FROM users WHERE email='accountant@habeshahotel.com'");
    let accountantId: number;
    if (!accExist) {
      const res = await execute(
        "INSERT INTO users (email, password_hash, role, full_name, phone, avatar_url, is_active) VALUES ('accountant@habeshahotel.com', ?, 'accountant', 'Mahlet Kebede', '+251 91 999 8877', '/images/staff/Mahlet Kebede.jpg', 1)",
        [accountantPass]
      );
      accountantId = res.insertId;
    } else {
      accountantId = accExist.id;
      await execute("UPDATE users SET role='accountant', full_name='Mahlet Kebede', avatar_url='/images/staff/Mahlet Kebede.jpg' WHERE id=?", [accountantId]);
    }

    // Ensure a dedicated Maintenance role user exists
    const maintExist = await queryOne<{ id: number }>("SELECT id FROM users WHERE email='maintenance@habeshahotel.com'");
    if (!maintExist) {
      await execute(
        "INSERT INTO users (email, password_hash, role, full_name, phone, avatar_url, is_active) VALUES ('maintenance@habeshahotel.com', ?, 'maintenance', 'Sumeya Ahmed', '+251 91 678 9012', '/images/staff/Sumeya Ahmed.png', 1)",
        [maintenancePass]
      );
    } else {
      await execute(
        "UPDATE users SET role='maintenance', password_hash=?, full_name='Sumeya Ahmed' WHERE email='maintenance@habeshahotel.com'",
        [maintenancePass]
      );
    }

    // Seed sample expenses if expenses table is empty
    try {
      const expCount = await queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM expenses");
      if (!expCount || expCount.cnt === 0) {
        await pool.query(`
          INSERT INTO expenses (category, title, amount, currency, payment_method, reference_number, expense_date, recorded_by, notes) VALUES
          ('utilities', 'Ethiopian Electric Power (EEP) - Bole Substation', 34500.00, 'ETB', 'bank_transfer', 'CBE-TX-882910', '2026-10-28', ${accountantId}, 'Monthly 3-phase electricity consumption for hotel generators and towers'),
          ('utilities', 'Addis Ababa Water and Sewerage Authority (AAWSA)', 12800.00, 'ETB', 'bank_transfer', 'CBE-TX-882911', '2026-10-29', ${accountantId}, 'Central fresh water supply & purification maintenance'),
          ('food_beverage', 'Merkato Spice & Organic Vegetables Delivery', 45200.00, 'ETB', 'telebirr', 'TB-REC-49021', '2026-11-01', ${accountantId}, 'Weekly berbere, korarima, onions, teff flour for injera bakery'),
          ('supplies', 'Habesha Hospitality Guest Amenities & Linen turnover', 18400.00, 'ETB', 'cbe_birr', 'CBE-TX-883015', '2026-11-02', ${accountantId}, 'Egyptian cotton bath towels, shampoo dispensers, eucalyptus soaps'),
          ('maintenance', 'Otis Elevator Bole Tower Maintenance & Inspection', 22000.00, 'ETB', 'bank_transfer', 'CBE-TX-883100', '2026-11-03', ${accountantId}, 'Scheduled bi-weekly safety certification and lubrication')
        `);
      }
    } catch (expErr) {
      console.error('Expense seed error:', expErr);
    }

    // 2. Staff & User names & local avatars (strictly matching local image files & names)
    await execute("UPDATE users SET full_name='Selam Tesfaye', phone='+251 91 123 4567', avatar_url='/images/staff/selam-tesfaye.png' WHERE email='admin@habeshahotel.com'");
    await execute("UPDATE users SET full_name='Bilal Ahmed', phone='+251 91 234 5678', avatar_url='/images/staff/bilal.webp' WHERE email='manager@habeshahotel.com'");
    await execute("UPDATE users SET full_name='Firdews Mohammed', phone='+251 91 345 6789', avatar_url='/images/staff/firdews.jpg' WHERE email='reception@habeshahotel.com'");
    await execute("UPDATE users SET full_name='Hiwot Tadesse', phone='+251 91 456 7890', avatar_url='/images/staff/hiwot-housekeeper.jpg' WHERE email='housekeeping@habeshahotel.com'");
    await execute("UPDATE users SET full_name='Hiwot Tadesse', phone='+251 91 567 8901', avatar_url='/images/staff/hiwot-housekeeper.jpg' WHERE email='maria@habeshahotel.com'");
    await execute("UPDATE users SET full_name='Sumeya Ahmed', phone='+251 91 678 9012', avatar_url='/images/staff/Sumeya Ahmed.png' WHERE email='tech@habeshahotel.com'");
    await execute("UPDATE users SET full_name='Murad Kassim', phone='+251 91 789 0123', avatar_url='/images/guests/murad.jpg' WHERE email='guest@habeshahotel.com'");
    await execute("UPDATE users SET full_name='Dr. Olivia Chen', phone='+251 92 890 1234', avatar_url='/images/guests/olivia-chen.jpg' WHERE email='olivia.chen@gmail.com'");
    await execute("UPDATE users SET full_name='Rumana Ali', phone='+251 93 901 2345', avatar_url='/images/guests/Rumana.jpg' WHERE email='marcus.v@outlook.com'");

    // 3. Customers (strictly matching local guest files & names)
    await execute("UPDATE customers SET full_name='Murad Kassim', address='Bole Sub-City, Kebele 03, Addis Ababa', country='Ethiopia', phone='+251 91 789 0123' WHERE email='guest@habeshahotel.com'");
    await execute("UPDATE customers SET full_name='Dr. Olivia Chen', address='Kazanchis UNECA Compound, Addis Ababa', country='Ethiopia / AU Delegate', phone='+251 92 890 1234' WHERE email='olivia.chen@gmail.com'");
    await execute("UPDATE customers SET full_name='Rumana Ali', address='Bole Rwanda Embassy Area, Addis Ababa', country='Ethiopia', phone='+251 93 901 2345' WHERE email='marcus.v@outlook.com'");
    await execute("UPDATE customers SET full_name='Rumana Ali', address='Piazza Area, Hawassa', country='Ethiopia', phone='+251 94 012 3456' WHERE email='sophie.taylor@traveler.com'");

    // 4. Hotel Services & Dining Updates (realistic ETB prices)
    await execute("UPDATE hotel_services SET name='Habesha Morning Breakfast (Chechebsa & Ful)', price=550.00, description='Warm Chechebsa with honey butter, Ful Mudammas, fresh scrambled eggs, bread, and hot tea or coffee.' WHERE id=1");
    await execute("UPDATE hotel_services SET name='Bole Airport Pickup & Transfer Shuttle', price=1200.00, description='Safe, air-conditioned airport shuttle to and from Addis Ababa Bole International Airport (5 min drive).' WHERE id=2");
    await execute("UPDATE hotel_services SET name='Eucalyptus Herbal Steam & Massage Spa (60 min)', price=2500.00, description='Full body relaxation therapy with natural eucalyptus steam bath, dry sauna, and Swedish massage.' WHERE id=3");
    await execute("UPDATE hotel_services SET name='Express Laundry & Traditional Dress Pressing', price=450.00, description='Fast same-day washing, dry cleaning, and gentle steam pressing for suits and Habesha Kemis.' WHERE id=4");
    await execute("UPDATE hotel_services SET name='Traditional Ethiopian Coffee Ceremony (Buna Tetu)', price=350.00, description='Freshly roasted coffee brewed in a clay Jebena pot, served with hot popcorn and frankincense aroma.' WHERE id=5");
    await execute("UPDATE hotel_services SET name='Meeting Hall & Conference Rental (Half-Day)', price=9500.00, description='Modern air-conditioned hall with high-speed Wi-Fi, projector, sound system, and coffee break catering.' WHERE id=6");

    // Update existing or add additional Ethiopian dining and drink menu items with realistic ETB prices
    await execute("UPDATE hotel_services SET name='Special Habesha Siga Tibs with Injera', price=650.00, description='Tender beef cubes sautéed with onions, garlic, fresh rosemary, and green chili, served with soft injera and spicy awaze dip.' WHERE name LIKE '%Siga Tibs%'");
    await execute("UPDATE hotel_services SET name='Classic Doro Wat with Boiled Egg & Ayib', price=750.00, description='Slow-simmered chicken drumsticks in rich spicy berbere stew, served with hard-boiled egg, cottage cheese (Ayib), and warm injera.' WHERE name LIKE '%Doro Wat%'");
    await execute("UPDATE hotel_services SET name='Special Ethiopian Kitfo with Ayib & Gomen', price=700.00, description='Freshly minced prime beef seasoned with warm Niter Kibbeh and mitmita spice, served with Ayib and collard greens.' WHERE name LIKE '%Kitfo%'");
    await execute("UPDATE hotel_services SET name='Clay Pot Shiro Tegabino with Salad', price=380.00, description='Aromatic spiced chickpea stew served bubbling hot in a clay pot with fresh warm injera and tomato salad.' WHERE name LIKE '%Shiro%'");
    await execute("UPDATE hotel_services SET name='Fresh Tropical Juice Spris (Avocado & Mango)', price=220.00, description='Freshly blended layered avocado, mango, and papaya fruit smoothie, served chilled with a slice of fresh lime.' WHERE name LIKE '%Spris%' OR name LIKE '%Tropical Juice%'");
    await execute("UPDATE hotel_services SET name='Authentic Ethiopian Tej (Honey Wine) & Cold Drinks', price=320.00, description='Traditional fermented honey wine served in a Berele flask, alongside cold local beers and Ambo mineral water.' WHERE name LIKE '%Tej%'");

    const foodCheck = await queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM hotel_services WHERE name LIKE '%Siga Tibs%'");
    if (!foodCheck || foodCheck.cnt === 0) {
      await execute("INSERT INTO hotel_services (name, category, price, description, icon, is_available) VALUES ('Special Habesha Siga Tibs with Injera', 'dining', 650.00, 'Tender beef cubes sautéed with onions, garlic, fresh rosemary, and green chili, served with soft injera and spicy awaze dip.', 'Utensils', 1)");
      await execute("INSERT INTO hotel_services (name, category, price, description, icon, is_available) VALUES ('Classic Doro Wat with Boiled Egg & Ayib', 'dining', 750.00, 'Slow-simmered chicken drumsticks in rich spicy berbere stew, served with hard-boiled egg, cottage cheese (Ayib), and warm injera.', 'Utensils', 1)");
      await execute("INSERT INTO hotel_services (name, category, price, description, icon, is_available) VALUES ('Special Ethiopian Kitfo with Ayib & Gomen', 'dining', 700.00, 'Freshly minced prime beef seasoned with warm Niter Kibbeh and mitmita spice, served with Ayib and collard greens.', 'Utensils', 1)");
      await execute("INSERT INTO hotel_services (name, category, price, description, icon, is_available) VALUES ('Clay Pot Shiro Tegabino with Salad', 'dining', 380.00, 'Aromatic spiced chickpea stew served bubbling hot in a clay pot with fresh warm injera and tomato salad.', 'Utensils', 1)");
      await execute("INSERT INTO hotel_services (name, category, price, description, icon, is_available) VALUES ('Fresh Tropical Juice Spris (Avocado & Mango)', 'room_service', 220.00, 'Freshly blended layered avocado, mango, and papaya fruit smoothie, served chilled with a slice of fresh lime.', 'Wine', 1)");
      await execute("INSERT INTO hotel_services (name, category, price, description, icon, is_available) VALUES ('Authentic Ethiopian Tej (Honey Wine) & Cold Drinks', 'room_service', 320.00, 'Traditional fermented honey wine served in a Berele flask, alongside cold local beers and Ambo mineral water.', 'Wine', 1)");
    }

    // 5. Room Type Descriptions, Authentic Images & Realistic Ethiopian Birr Prices
    await execute("UPDATE room_types SET base_price=2800.00, description='A quiet, cozy room for one guest. Features a comfortable single bed, work desk, fast Wi-Fi, and private bathroom with hot rainfall shower.', image_url='/images/rooms/standard-single.jpg', gallery_urls=? WHERE code='STD-SGL'", [JSON.stringify(['/images/rooms/standard-single.jpg', '/images/hotel/hotel-lobby.jpg'])]);
    await execute("UPDATE room_types SET base_price=3900.00, description='A comfortable room for two guests or couples. Features a queen bed, wooden furnishings, soft lighting, fast Wi-Fi, and hot shower.', image_url='/images/rooms/standard-double.jpg', gallery_urls=? WHERE code='STD-DBL'", [JSON.stringify(['/images/rooms/standard-double.jpg', '/images/hotel/hotel-lobby.jpg'])]);
    await execute("UPDATE room_types SET base_price=5700.00, description='A bright and spacious room with a king-size bed, relaxing sitting area, work desk, and beautiful views of Bole and Addis Ababa.', image_url='/images/rooms/deluxe-king.jpg', gallery_urls=? WHERE code='DLX-KNG'", [JSON.stringify(['/images/rooms/deluxe-king.jpg', '/images/hotel/suite-interior.jpg'])]);
    await execute("UPDATE room_types SET base_price=4600.00, description='Features two separate comfortable single beds, ideal for friends or colleagues traveling together. Clean, quiet, and spacious.', image_url='/images/rooms/twin-deluxe.jpg', gallery_urls=? WHERE code='TWN-DLX'", [JSON.stringify(['/images/rooms/twin-deluxe.jpg', '/images/hotel/hotel-lobby.jpg'])]);
    await execute("UPDATE room_types SET base_price=7600.00, description='Located on higher floors with a king bed, comfortable living area, executive study desk, and complimentary afternoon tea and coffee.', image_url='/images/rooms/executive-club.jpg', gallery_urls=? WHERE code='EXE-CLB'", [JSON.stringify(['/images/rooms/executive-club.jpg', '/images/hotel/suite-interior.jpg'])]);
    await execute("UPDATE room_types SET base_price=9000.00, description='A large two-bedroom suite for families traveling with children. Includes two queen beds, kids TV area, and spacious modern bathroom.', image_url='/images/rooms/family-suite.jpg', gallery_urls=? WHERE code='FAM-STE'", [JSON.stringify(['/images/rooms/family-suite.jpg', '/images/hotel/suite-interior.jpg'])]);
    await execute("UPDATE room_types SET base_price=11200.00, description='A luxurious suite with a king bed, private living room, balcony with sunset views of Addis Ababa, and large bathroom.', image_url='/images/rooms/junior-suite.jpg', gallery_urls=? WHERE code='JNR-STE'", [JSON.stringify(['/images/rooms/junior-suite.jpg', '/images/hotel/suite-interior.jpg'])]);
    await execute("UPDATE room_types SET base_price=23000.00, description='Our largest luxury suite with panoramic 360-degree views of Addis Ababa, grand living room, dining table, master bedroom, and VIP service.', image_url='/images/rooms/presidential-suite.jpg', gallery_urls=? WHERE code='PRS-STE'", [JSON.stringify(['/images/rooms/presidential-suite.jpg', '/images/hotel/suite-interior.jpg', '/images/hotel/hotel-exterior.jpg'])]);

    // Synchronize room operational prices with room type base prices
    await execute("UPDATE rooms r JOIN room_types rt ON r.room_type_id = rt.id SET r.price_per_night = rt.base_price");
  } catch (e) {
    // Ignore if not applicable
  }
}

export async function seedDatabase() {
  await initDatabase();

  // Check if already seeded
  const row = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if (row && row.count > 0) {
    await syncEthiopianDefaults();
    return;
  }

  console.log('Seeding HABESHA-HOTEL SHMS database...');

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin123!', salt);
  const managerPass = await bcrypt.hash('Manager123!', salt);
  const receptionPass = await bcrypt.hash('Reception123!', salt);
  const housePass = await bcrypt.hash('Clean123!', salt);
  const guestPass = await bcrypt.hash('Guest123!', salt);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ── 1. ROLES ────────────────────────────────────────────────────────────
    await conn.execute('INSERT INTO roles (name, description) VALUES (?,?)', ['admin', 'Full system control, settings, financials and user management']);
    await conn.execute('INSERT INTO roles (name, description) VALUES (?,?)', ['manager', 'Hotel operations, employee schedules, housekeeping and performance']);
    await conn.execute('INSERT INTO roles (name, description) VALUES (?,?)', ['receptionist', 'Front desk check-in, check-out, walk-in bookings and guest service']);
    await conn.execute('INSERT INTO roles (name, description) VALUES (?,?)', ['housekeeper', 'Room cleaning status, priorities, inspection and maintenance alerts']);
    await conn.execute('INSERT INTO roles (name, description) VALUES (?,?)', ['customer', 'Guest booking portal, room reservations and personal invoices']);

    // ── 2. PERMISSIONS ──────────────────────────────────────────────────────
    const perms: [string, string, string][] = [
      ['users.manage', 'Create and modify users and roles', 'users'],
      ['rooms.manage', 'Configure room types, rooms and pricing', 'rooms'],
      ['bookings.manage', 'Create, update, cancel reservations', 'bookings'],
      ['checkin.process', 'Execute guest check-in and check-out', 'frontdesk'],
      ['finance.manage', 'Process payments and manage invoices', 'finance'],
      ['housekeeping.manage', 'Assign and update room cleaning tasks', 'housekeeping'],
      ['reports.view', 'Generate business and occupancy reports', 'reports'],
      ['settings.manage', 'Configure hotel policies and taxes', 'settings'],
    ];
    for (const [code, desc, module] of perms) {
      await conn.execute('INSERT INTO permissions (code, description, module) VALUES (?,?,?)', [code, desc, module]);
    }

    // ── 3. DEPARTMENTS ──────────────────────────────────────────────────────
    const [dExecRes] = await conn.execute('INSERT INTO departments (name, description) VALUES (?,?)', ['Executive Management', 'General hotel administration and strategy']) as any;
    const [dFDRes] = await conn.execute('INSERT INTO departments (name, description) VALUES (?,?)', ['Front Desk & Concierge', 'Guest reception, reservations and check-in services']) as any;
    const [dHKRes] = await conn.execute('INSERT INTO departments (name, description) VALUES (?,?)', ['Housekeeping & Facility', 'Room sanitation, linen management and cleanliness']) as any;
    const [dMaintRes] = await conn.execute('INSERT INTO departments (name, description) VALUES (?,?)', ['Engineering & Maintenance', 'HVAC, electrical, plumbing and structural repairs']) as any;
    const [dFBRes] = await conn.execute('INSERT INTO departments (name, description) VALUES (?,?)', ['Food & Beverage', 'Fine dining restaurant, bar and in-room dining']) as any;
    const dExecutive = dExecRes.insertId;
    const dFrontDesk = dFDRes.insertId;
    const dHousekeeping = dHKRes.insertId;
    const dMaintenance = dMaintRes.insertId;

    // ── 4. USERS ────────────────────────────────────────────────────────────
    const insertUser = async (email: string, hash: string, role: string, name: string, phone: string, avatar: string) => {
      const [r] = await conn.execute('INSERT INTO users (email,password_hash,role,full_name,phone,avatar_url,is_active) VALUES (?,?,?,?,?,?,1)', [email, hash, role, name, phone, avatar]) as any;
      return r.insertId as number;
    };

    const uAdmin = await insertUser('admin@habeshahotel.com', adminPass, 'admin', 'Selam Tesfaye', '+251 91 123 4567', '/images/staff/selam-tesfaye.png');
    const uManager = await insertUser('manager@habeshahotel.com', managerPass, 'manager', 'Bilal Ahmed', '+251 91 234 5678', '/images/staff/bilal.webp');
    const uReception = await insertUser('reception@habeshahotel.com', receptionPass, 'receptionist', 'Firdews Mohammed', '+251 91 345 6789', '/images/staff/firdews.jpg');
    const uHouse = await insertUser('housekeeping@habeshahotel.com', housePass, 'housekeeper', 'Hiwot Tadesse', '+251 91 456 7890', '/images/staff/hiwot-housekeeper.jpg');
    const uHouse2 = await insertUser('maria@habeshahotel.com', housePass, 'housekeeper', 'Hiwot Tadesse', '+251 91 567 8902', '/images/staff/hiwot-housekeeper.jpg');
    const uTech = await insertUser('tech@habeshahotel.com', managerPass, 'manager', 'Sumeya Ahmed', '+251 91 678 9012', '/images/staff/Sumeya Ahmed.png');
    const uGuest1 = await insertUser('guest@habeshahotel.com', guestPass, 'customer', 'Murad Kassim', '+251 91 789 0123', '/images/guests/murad.jpg');
    const uGuest2 = await insertUser('olivia.chen@gmail.com', guestPass, 'customer', 'Dr. Olivia Chen', '+251 92 890 1234', '/images/guests/olivia-chen.jpg');
    const uGuest3 = await insertUser('marcus.v@outlook.com', guestPass, 'customer', 'Rumana Ali', '+251 93 901 2345', '/images/guests/Rumana.jpg');

    // ── 5. EMPLOYEES ────────────────────────────────────────────────────────
    const insertEmp = async (userId: number, deptId: number, code: string, pos: string, salary: number, hireDate: string) => {
      const [r] = await conn.execute('INSERT INTO employees (user_id,department_id,employee_code,position,salary,hire_date,status) VALUES (?,?,?,?,?,?,?)',
        [userId, deptId, code, pos, salary, hireDate, 'active']) as any;
      return r.insertId as number;
    };

    await insertEmp(uAdmin, dExecutive, 'EMP-1001', 'General Director & Administrator', 125000, '2022-01-15');
    await insertEmp(uManager, dExecutive, 'EMP-1002', 'Hotel Operations Manager', 88000, '2022-06-01');
    await insertEmp(uReception, dFrontDesk, 'EMP-1003', 'Head Concierge & Receptionist', 52000, '2023-02-10');
    const empHouse1 = await insertEmp(uHouse, dHousekeeping, 'EMP-1004', 'Lead Housekeeping Supervisor', 46000, '2023-04-15');
    const empHouse2 = await insertEmp(uHouse2, dHousekeeping, 'EMP-1005', 'Housekeeping Floor Steward', 44000, '2023-09-01');
    const empTech = await insertEmp(uTech, dMaintenance, 'EMP-1006', 'Senior Systems & HVAC Technician', 62000, '2022-11-20');

    // ── 6. CUSTOMERS ────────────────────────────────────────────────────────
    const insertCust = async (userId: number | null, name: string, email: string, phone: string, address: string, country: string, docType: string, docNum: string, prefs: string, special: string) => {
      const [r] = await conn.execute(
        'INSERT INTO customers (user_id,full_name,email,phone,address,country,id_document_type,id_document_number,preferences,special_requests) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [userId, name, email, phone, address, country, docType, docNum, prefs, special]) as any;
      return r.insertId as number;
    };

    const c1 = await insertCust(uGuest1, 'Murad Kassim', 'guest@habeshahotel.com', '+251 91 789 0123', 'Bole Sub-City, Kebele 03, Addis Ababa', 'Ethiopia', 'National ID', 'ET-AA-98421045', 'Prefers high floor, quiet room', 'Late check-out request if possible');
    const c2 = await insertCust(uGuest2, 'Dr. Olivia Chen', 'olivia.chen@gmail.com', '+251 92 890 1234', 'Kazanchis UNECA Compound, Addis Ababa', 'Ethiopia / AU Delegate', 'Passport', 'P-8899238', 'Quiet corner room, morning Ethiopian coffee setup', 'Extra bath towels');
    const c3 = await insertCust(uGuest3, 'Rumana Ali', 'marcus.v@outlook.com', '+251 93 901 2345', 'Bole Rwanda Embassy Area, Addis Ababa', 'Ethiopia', 'Driver License', 'DL-BD-772918', 'Near elevator, extra pillows', 'Airport shuttle transfer on arrival');
    const cWalkIn = await insertCust(null, 'Rumana Ali', 'sophie.taylor@traveler.com', '+251 94 012 3456', 'Piazza Area, Hawassa', 'Ethiopia', 'National ID', 'ET-HW-55432911', 'Non-smoking floor', 'Walk-in guest registered at front desk');

    // ── 7. AMENITIES ────────────────────────────────────────────────────────
    const insertAmenity = async (name: string, icon: string, desc: string, cat: string) => {
      const [r] = await conn.execute('INSERT INTO amenities (name,icon,description,category) VALUES (?,?,?,?)', [name, icon, desc, cat]) as any;
      return r.insertId as number;
    };

    const amWifi = await insertAmenity('High-Speed Wi-Fi', 'Wifi', 'Ultra-fast gigabit fibre wireless connection', 'connectivity');
    const amTV = await insertAmenity('55" 4K Smart TV', 'Tv', 'Smart TV with Netflix, HBO & Apple AirPlay', 'entertainment');
    const amClimate = await insertAmenity('Climate Control', 'Thermometer', 'Individual silent digital thermostat', 'comfort');
    const amBath = await insertAmenity('Italian Marble Bath', 'Bath', 'Deep soaking tub and rainfall walk-in shower', 'bathroom');
    const amCoffee = await insertAmenity('Espresso Barista', 'Coffee', 'Nespresso premium machine with artisan pods', 'beverage');
    const amBar = await insertAmenity('Artisan Mini Bar', 'Wine', 'Curated craft spirits, wines and gourmet snacks', 'beverage');
    const amBalcony = await insertAmenity('Panoramic Balcony', 'Sunset', 'Private terrace with skyline & courtyard view', 'view');
    const amSafe = await insertAmenity('Laptop Digital Safe', 'ShieldCheck', 'Electronic safe with internal power outlet', 'security');
    const amDesk = await insertAmenity('Ergonomic Workstation', 'Briefcase', 'Executive walnut desk with Herman Miller chair', 'work');

    // ── 8. ROOM TYPES ───────────────────────────────────────────────────────
    const insertType = async (name: string, code: string, desc: string, price: number, cap: number, bed: string, bedsCount: number, size: number, img: string, gallery: string) => {
      const [r] = await conn.execute(
        'INSERT INTO room_types (name,code,description,base_price,capacity,bed_type,beds_count,size_sqm,image_url,gallery_urls) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [name, code, desc, price, cap, bed, bedsCount, size, img, gallery]) as any;
      return r.insertId as number;
    };

    const rtSingle = await insertType('Standard Single Room', 'STD-SGL', 'A quiet, cozy room for one guest. Features a comfortable single bed, work desk, fast Wi-Fi, and private bathroom with hot rainfall shower.', 140.00, 1, 'Single Bed', 1, 26, '/images/rooms/standard-single.jpg', JSON.stringify(['/images/rooms/standard-single.jpg', '/images/hotel/hotel-lobby.jpg']));
    const rtDouble = await insertType('Standard Double Room', 'STD-DBL', 'A comfortable room for two guests or couples. Features a queen bed, wooden furnishings, soft lighting, fast Wi-Fi, and hot shower.', 195.00, 2, 'Queen Bed', 1, 34, '/images/rooms/standard-double.jpg', JSON.stringify(['/images/rooms/standard-double.jpg', '/images/hotel/hotel-lobby.jpg']));
    const rtDeluxe = await insertType('Deluxe King Room', 'DLX-KNG', 'A bright and spacious room with a king-size bed, relaxing sitting area, work desk, and beautiful views of Bole and Addis Ababa.', 285.00, 2, 'King Bed', 1, 44, '/images/rooms/deluxe-king.jpg', JSON.stringify(['/images/rooms/deluxe-king.jpg', '/images/hotel/suite-interior.jpg']));
    const rtTwin = await insertType('Twin Deluxe Room', 'TWN-DLX', 'Features two separate comfortable single beds, ideal for friends or colleagues traveling together. Clean, quiet, and spacious.', 230.00, 2, 'Twin Single Beds', 2, 38, '/images/rooms/twin-deluxe.jpg', JSON.stringify(['/images/rooms/twin-deluxe.jpg', '/images/hotel/hotel-lobby.jpg']));
    const rtExecutive = await insertType('Executive Club Room', 'EXE-CLB', 'Located on higher floors with a king bed, comfortable living area, executive study desk, and complimentary afternoon tea and coffee.', 380.00, 3, 'King Bed + Daybed', 2, 52, '/images/rooms/executive-club.jpg', JSON.stringify(['/images/rooms/executive-club.jpg', '/images/hotel/suite-interior.jpg']));
    const rtFamily = await insertType('Family Grand Suite', 'FAM-STE', 'A large two-bedroom suite for families traveling with children. Includes two queen beds, kids TV area, and spacious modern bathroom.', 450.00, 4, 'Two Queen Beds', 2, 68, '/images/rooms/family-suite.jpg', JSON.stringify(['/images/rooms/family-suite.jpg', '/images/hotel/suite-interior.jpg']));
    const rtJunior = await insertType('Junior Sovereign Suite', 'JNR-STE', 'A luxurious suite with a king bed, private living room, balcony with sunset views of Addis Ababa, and large bathroom.', 560.00, 3, 'California King Bed', 1, 82, '/images/rooms/junior-suite.jpg', JSON.stringify(['/images/rooms/junior-suite.jpg', '/images/hotel/suite-interior.jpg']));
    const rtPresidential = await insertType('Presidential Penthouse Suite', 'PRS-STE', 'Our largest luxury suite with panoramic 360-degree views of Addis Ababa, grand living room, dining table, master bedroom, and VIP service.', 1150.00, 4, 'Master California King + Guest King', 2, 142, '/images/rooms/presidential-suite.jpg', JSON.stringify(['/images/rooms/presidential-suite.jpg', '/images/hotel/suite-interior.jpg', '/images/hotel/hotel-exterior.jpg']));

    // ── 9. ROOMS ────────────────────────────────────────────────────────────
    const insertRoom = async (num: string, typeId: number, floor: number, status: string, opStatus: string, price: number, notes: string) => {
      const [r] = await conn.execute(
        'INSERT INTO rooms (room_number,room_type_id,floor_number,status,operational_status,price_per_night,is_active,notes) VALUES (?,?,?,?,?,?,1,?)',
        [num, typeId, floor, status, opStatus, price, notes]) as any;
      return r.insertId as number;
    };

    const r101 = await insertRoom('101', rtSingle, 1, 'available', 'ready', 140.00, 'Garden facing, peaceful ambiance');
    const r102 = await insertRoom('102', rtSingle, 1, 'occupied', 'ready', 140.00, 'Checked in guest Alexander Wright');
    const r103 = await insertRoom('103', rtDouble, 1, 'available', 'ready', 195.00, 'Refurbished parquet flooring');
    const r104 = await insertRoom('104', rtDouble, 1, 'dirty', 'needs_cleaning', 195.00, 'Guest departed 11:00 AM, scheduled for housekeeping');
    const r105 = await insertRoom('105', rtTwin, 1, 'cleaning', 'cleaning_in_progress', 230.00, 'Assigned to Carlos Rivera');
    const r201 = await insertRoom('201', rtDouble, 2, 'available', 'ready', 195.00, 'City center facing');
    const r202 = await insertRoom('202', rtDeluxe, 2, 'occupied', 'ready', 285.00, 'Checked in guest Dr. Olivia Chen');
    const r203 = await insertRoom('203', rtDeluxe, 2, 'reserved', 'ready', 285.00, 'Upcoming VIP arrival today 15:00');
    const r204 = await insertRoom('204', rtTwin, 2, 'available', 'ready', 230.00, 'Dual single beds, spotless');
    const r205 = await insertRoom('205', rtDeluxe, 2, 'maintenance', 'under_repair', 285.00, 'AC cooling sensor replacement underway');
    const r301 = await insertRoom('301', rtDeluxe, 3, 'available', 'ready', 285.00, 'Spacious corner room');
    const r302 = await insertRoom('302', rtExecutive, 3, 'available', 'ready', 380.00, 'High speed work hub setup');
    const r303 = await insertRoom('303', rtExecutive, 3, 'reserved', 'ready', 380.00, 'Reserved for British consulate visitor');
    const r304 = await insertRoom('304', rtFamily, 3, 'available', 'ready', 450.00, 'Connecting door ready for family stay');
    const r305 = await insertRoom('305', rtFamily, 3, 'dirty', 'needs_cleaning', 450.00, 'Late checkout completed');
    const r401 = await insertRoom('401', rtJunior, 4, 'available', 'ready', 560.00, 'Sunset terrace balcony');
    const r402 = await insertRoom('402', rtJunior, 4, 'occupied', 'ready', 560.00, 'Guest Marcus Vance staying for 4 nights');
    const r501 = await insertRoom('501', rtPresidential, 5, 'available', 'ready', 1150.00, 'Penthouse master suite with panoramic skyline terrace');

    // ── 10. ROOM AMENITIES ──────────────────────────────────────────────────
    const baseRooms = [r101, r102, r103, r104, r105, r201, r202, r203, r204, r205, r301, r302, r303, r304, r305, r401, r402, r501];
    const baseAmenities = [amWifi, amTV, amClimate, amBath, amCoffee, amSafe];
    const suiteRooms = [r302, r303, r401, r402, r501];
    const suiteExtras = [amBar, amBalcony, amDesk];

    for (const rid of baseRooms) {
      for (const aid of baseAmenities) {
        await conn.execute('INSERT IGNORE INTO room_amenities (room_id,amenity_id) VALUES (?,?)', [rid, aid]);
      }
    }
    for (const rid of suiteRooms) {
      for (const aid of suiteExtras) {
        await conn.execute('INSERT IGNORE INTO room_amenities (room_id,amenity_id) VALUES (?,?)', [rid, aid]);
      }
    }

    // ── 11. HOTEL SERVICES ──────────────────────────────────────────────────
    const insertSvc = async (name: string, cat: string, price: number, desc: string, icon: string) => {
      const [r] = await conn.execute('INSERT INTO hotel_services (name,category,price,description,icon,is_available) VALUES (?,?,?,?,?,1)', [name, cat, price, desc, icon]) as any;
      return r.insertId as number;
    };

    const sBreakfast = await insertSvc('Habesha Morning Breakfast (Chechebsa & Ful)', 'dining', 550.00, 'Warm Chechebsa with honey butter, Ful Mudammas, fresh scrambled eggs, bread, and hot tea or coffee.', 'Utensils');
    const sTransfer = await insertSvc('Bole Airport Pickup & Transfer Shuttle', 'transport', 1200.00, 'Safe, air-conditioned airport shuttle to and from Addis Ababa Bole International Airport (5 min drive).', 'Car');
    const sSpa = await insertSvc('Eucalyptus Herbal Steam & Massage Spa (60 min)', 'spa', 2500.00, 'Full body relaxation therapy with natural eucalyptus steam bath, dry sauna, and Swedish massage.', 'Sparkles');
    const sLaundry = await insertSvc('Express Laundry & Traditional Dress Pressing', 'laundry', 450.00, 'Fast same-day washing, dry cleaning, and gentle steam pressing for suits and Habesha Kemis.', 'Shirt');
    const sDining = await insertSvc('Traditional Ethiopian Coffee Ceremony (Buna Tetu)', 'room_service', 350.00, 'Freshly roasted coffee brewed in a clay Jebena pot, served with hot popcorn and frankincense aroma.', 'Coffee');
    const sConf = await insertSvc('Meeting Hall & Conference Rental (Half-Day)', 'conference', 9500.00, 'Modern air-conditioned hall with high-speed Wi-Fi, projector, sound system, and coffee break catering.', 'Users');
    const sTibs = await insertSvc('Special Habesha Siga Tibs with Injera', 'dining', 650.00, 'Tender beef cubes sautéed with onions, garlic, fresh rosemary, and green chili, served with injera and awaze.', 'Utensils');
    const sDoro = await insertSvc('Classic Doro Wat with Boiled Egg & Ayib', 'dining', 750.00, 'Slow-simmered chicken drumsticks in rich spicy berbere stew, served with hard-boiled egg, Ayib, and injera.', 'Utensils');
    const sShiro = await insertSvc('Clay Pot Shiro Tegabino with Salad', 'dining', 380.00, 'Aromatic spiced chickpea stew served bubbling hot in a clay pot with fresh warm injera and tomato salad.', 'Utensils');
    const sSpris = await insertSvc('Fresh Tropical Juice Spris (Avocado & Mango)', 'room_service', 220.00, 'Freshly blended layered avocado, mango, and papaya fruit smoothie, served chilled with a slice of lime.', 'Wine');
    const sTej = await insertSvc('Authentic Ethiopian Tej (Honey Wine) & Cold Drinks', 'room_service', 320.00, 'Traditional fermented honey wine served in a Berele flask, alongside cold local beers and Ambo water.', 'Wine');

    // ── 12. BOOKINGS ────────────────────────────────────────────────────────
    const insertBooking = async (
      ref: string, custId: number, roomId: number,
      ciDate: string, coDate: string, actualCi: string | null, actualCo: string | null,
      adults: number, children: number, nights: number,
      roomRate: number, svcTotal: number, tax: number, discount: number, total: number, paid: number,
      status: string, payStatus: string, specialReqs: string | null, checkedInBy: number | null
    ) => {
      const [r] = await conn.execute(
        `INSERT INTO bookings (booking_reference,customer_id,room_id,check_in_date,check_out_date,
         actual_check_in,actual_check_out,adults_count,children_count,nights_count,
         room_rate,services_total,tax_amount,discount_amount,total_amount,paid_amount,
         status,payment_status,special_requests,checked_in_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [ref, custId, roomId, ciDate, coDate, actualCi, actualCo, adults, children, nights,
          roomRate, svcTotal, tax, discount, total, paid, status, payStatus, specialReqs, checkedInBy]) as any;
      return r.insertId as number;
    };

    const b1 = await insertBooking('AG-2026-9041', c1, r102, '2026-10-31', '2026-11-04', '2026-10-31 14:22:00', null, 1, 0, 4, 140.00, 32.00, 71.04, 0.00, 663.04, 663.04, 'checked_in', 'paid', 'High floor preferred, sparkling water on arrival', uReception);
    const b2 = await insertBooking('AG-2026-9042', c2, r202, '2026-11-01', '2026-11-05', '2026-11-01 13:45:00', null, 2, 0, 4, 285.00, 135.00, 153.00, 0.00, 1428.00, 1428.00, 'checked_in', 'paid', 'Quiet room, attending cardiology conference', uReception);
    const b3 = await insertBooking('AG-2026-9043', c3, r402, '2026-11-02', '2026-11-06', null, null, 2, 1, 4, 560.00, 85.00, 278.40, 50.00, 2553.40, 1000.00, 'confirmed', 'partially_paid', 'Airport transfer pickup requested for 14:00 at Terminal 3', null);
    const b4 = await insertBooking('AG-2026-9044', cWalkIn, r203, '2026-11-03', '2026-11-06', null, null, 2, 0, 3, 285.00, 0.00, 102.60, 0.00, 957.60, 0.00, 'confirmed', 'pending', 'Celebrating anniversary', null);
    const bPast = await insertBooking('AG-2026-8812', c1, r104, '2026-10-28', '2026-11-01', '2026-10-28 15:00:00', '2026-11-01 11:00:00', 1, 0, 4, 195.00, 38.00, 98.16, 0.00, 916.16, 916.16, 'checked_out', 'paid', 'Standard corporate billing', uReception);

    // ── 13. BOOKING GUESTS ──────────────────────────────────────────────────
    const bGuest = async (bookingId: number, name: string, email: string, phone: string, primary: number) =>
      conn.execute('INSERT INTO booking_guests (booking_id,full_name,email,phone,is_primary) VALUES (?,?,?,?,?)', [bookingId, name, email, phone, primary]);

    await bGuest(b1, 'Alexander Wright', 'guest@habeshahotel.com', '+1 (555) 789-0123', 1);
    await bGuest(b2, 'Dr. Olivia Chen', 'olivia.chen@gmail.com', '+1 (555) 890-1234', 1);
    await bGuest(b2, 'David Chen', 'david.c@gmail.com', '+1 (555) 890-5544', 0);
    await bGuest(b3, 'Marcus Vance', 'marcus.v@outlook.com', '+1 (555) 901-2345', 1);

    // ── 14. PAYMENTS ────────────────────────────────────────────────────────
    const pay = async (bookingId: number, ref: string, amount: number, method: string, notes: string, recordedBy: number) =>
      conn.execute('INSERT INTO payments (booking_id,payment_reference,amount,payment_method,status,notes,recorded_by) VALUES (?,?,?,?,?,?,?)',
        [bookingId, ref, amount, method, 'completed', notes, recordedBy]);

    await pay(b1, 'PAY-88219-CC', 663.04, 'card', 'Visa ending in 4012 settled in full', uReception);
    await pay(b2, 'PAY-88220-CC', 1428.00, 'card', 'Mastercard ending in 9811 processed at check-in', uReception);
    await pay(b3, 'PAY-88221-BT', 1000.00, 'bank_transfer', 'Deposit received via Wire Transfer WT-55910', uAdmin);
    await pay(bPast, 'PAY-88102-CS', 916.16, 'card', 'Amex settled at checkout with receipt #AG-INV-8812', uReception);

    // ── 15. INVOICES & ITEMS ────────────────────────────────────────────────
    const insertInv = async (num: string, bookingId: number, custId: number, sub: number, tax: number, disc: number, total: number, paid: number, balance: number, status: string, due: string) => {
      const [r] = await conn.execute(
        'INSERT INTO invoices (invoice_number,booking_id,customer_id,subtotal,tax_amount,discount_amount,total_amount,paid_amount,balance_due,status,due_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [num, bookingId, custId, sub, tax, disc, total, paid, balance, status, due]) as any;
      return r.insertId as number;
    };
    const invItem = async (invId: number, desc: string, qty: number, unit: number, total: number, type: string) =>
      conn.execute('INSERT INTO invoice_items (invoice_id,description,quantity,unit_price,total_price,item_type) VALUES (?,?,?,?,?,?)', [invId, desc, qty, unit, total, type]);

    const inv1 = await insertInv('INV-2026-001', b1, c1, 592.00, 71.04, 0.00, 663.04, 663.04, 0.00, 'paid', '2026-11-04');
    await invItem(inv1, 'Standard Single Room (4 Nights @ $140.00)', 4, 140.00, 560.00, 'room_charge');
    await invItem(inv1, 'Gourmet Artisan Breakfast Buffet', 1, 32.00, 32.00, 'service');
    await invItem(inv1, 'State & City Occupancy Tax (12%)', 1, 71.04, 71.04, 'tax');

    const inv2 = await insertInv('INV-2026-002', b2, c2, 1275.00, 153.00, 0.00, 1428.00, 1428.00, 0.00, 'paid', '2026-11-05');
    await invItem(inv2, 'Deluxe King Room (4 Nights @ $285.00)', 4, 285.00, 1140.00, 'room_charge');
    await invItem(inv2, 'Signature Swedish Massage (60 min)', 1, 135.00, 135.00, 'service');
    await invItem(inv2, 'State & City Occupancy Tax (12%)', 1, 153.00, 153.00, 'tax');

    const inv3 = await insertInv('INV-2026-003', b3, c3, 2325.00, 278.40, 50.00, 2553.40, 1000.00, 1553.40, 'partially_paid', '2026-11-06');
    await invItem(inv3, 'Junior Sovereign Suite (4 Nights @ $560.00)', 4, 560.00, 2240.00, 'room_charge');
    await invItem(inv3, 'Luxury Airport Chauffeur (Mercedes S-Class)', 1, 85.00, 85.00, 'service');
    await invItem(inv3, 'VIP Loyalty Member Discount', 1, -50.00, -50.00, 'discount');
    await invItem(inv3, 'State & City Occupancy Tax (12%)', 1, 278.40, 278.40, 'tax');

    // ── 16. SERVICE ORDERS ──────────────────────────────────────────────────
    await conn.execute('INSERT INTO service_orders (booking_id,service_id,quantity,unit_price,total_price,status,notes,ordered_by) VALUES (?,?,?,?,?,?,?,?)', [b1, sBreakfast, 1, 32.00, 32.00, 'completed', 'Deliver to room 102 at 08:30 AM', uGuest1]);
    await conn.execute('INSERT INTO service_orders (booking_id,service_id,quantity,unit_price,total_price,status,notes,ordered_by) VALUES (?,?,?,?,?,?,?,?)', [b2, sSpa, 1, 135.00, 135.00, 'completed', 'Appointment confirmed for 17:00 at 3rd Floor Spa', uGuest2]);
    await conn.execute('INSERT INTO service_orders (booking_id,service_id,quantity,unit_price,total_price,status,notes,ordered_by) VALUES (?,?,?,?,?,?,?,?)', [b3, sTransfer, 1, 85.00, 85.00, 'in_progress', 'Flight BA-284 arriving at 13:40', uGuest3]);

    // ── 17. HOUSEKEEPING TASKS ──────────────────────────────────────────────
    const hkTask = async (roomId: number, empId: number | null, type: string, priority: string, status: string, instructions: string, date: string) =>
      conn.execute('INSERT INTO housekeeping_tasks (room_id,assigned_employee_id,task_type,priority,status,instructions,scheduled_for) VALUES (?,?,?,?,?,?,?)',
        [roomId, empId, type, priority, status, instructions, date]);

    await hkTask(r104, empHouse1, 'standard_clean', 'urgent', 'pending', 'Checkout turnover clean. Replace all linens, sanitize bath, restock coffee.', '2026-11-01');
    await hkTask(r105, empHouse1, 'standard_clean', 'high', 'in_progress', 'Deep dusting, vacuuming, window wipe in progress.', '2026-11-01');
    await hkTask(r305, empHouse2, 'deep_clean', 'medium', 'pending', 'Family room checkout clean. Prepare double queen setups.', '2026-11-01');
    await hkTask(r101, empHouse2, 'turn_down', 'low', 'completed', 'Evening turn down with lavender mint pillow spray.', '2026-10-31');

    // ── 18. MAINTENANCE REQUESTS ────────────────────────────────────────────
    await conn.execute('INSERT INTO maintenance_requests (room_id,reported_by,technician_id,issue_title,description,priority,status,estimated_cost,actual_cost) VALUES (?,?,?,?,?,?,?,?,?)',
      [r205, uReception, empTech, 'AC Cooling Sensor Malfunction', 'Thermostat displays error E-04 and fails to blow cold air below 24C. Requires replacement sensor module.', 'high', 'in_progress', 180.00, 0.00]);
    await conn.execute('INSERT INTO maintenance_requests (room_id,reported_by,technician_id,issue_title,description,priority,status,estimated_cost,actual_cost) VALUES (?,?,?,?,?,?,?,?,?)',
      [r302, uHouse, empTech, 'Desk Lamp Switch Loose', 'Executive desk brass lamp switch loose on swivel arm. Tightened and grounded safely.', 'low', 'resolved', 25.00, 20.00]);

    // ── 19. REVIEWS ─────────────────────────────────────────────────────────
    await conn.execute('INSERT INTO reviews (customer_id,booking_id,room_type_id,rating,title,comment,is_approved) VALUES (?,?,?,?,?,?,1)',
      [c1, b1, rtSingle, 5, 'Wonderful Ethiopian hospitality and quiet comfort in Bole', 'The staff at HABESHA-HOTEL were so welcoming. The traditional coffee ceremony was wonderful, the room was quiet and spotless, and check-in was very fast. Highly recommended!']);
    await conn.execute('INSERT INTO reviews (customer_id,booking_id,room_type_id,rating,title,comment,is_approved) VALUES (?,?,?,?,?,?,1)',
      [c2, b2, rtDeluxe, 5, 'Perfect location for African Union meetings & great spa', 'The hotel is only minutes from the airport and conference centers. The steam bath and massage were refreshing after long meetings, and the food at the restaurant was delicious.']);
    await conn.execute('INSERT INTO reviews (customer_id,booking_id,room_type_id,rating,title,comment,is_approved) VALUES (?,?,?,?,?,?,1)',
      [c3, b3, rtJunior, 5, 'Smooth airport pickup and excellent service', 'The driver was waiting for me at Bole Airport with a name sign. Room 402 had a wonderful view of Addis Ababa, and the bed was very comfortable.']);

    // ── 20. NOTIFICATIONS ───────────────────────────────────────────────────
    const notif = async (userId: number, title: string, msg: string, type: string, isRead: number, link: string) =>
      conn.execute('INSERT INTO notifications (user_id,title,message,type,is_read,link_url) VALUES (?,?,?,?,?,?)', [userId, title, msg, type, isRead, link]);

    await notif(uAdmin, 'High Weekend Occupancy', 'Hotel occupancy is at 84% for this upcoming weekend in Addis Ababa. All departments prepared.', 'info', 0, '/admin/reports');
    await notif(uManager, 'Maintenance in Progress', 'Room 205 AC sensor repair assigned to Sumeya Ahmed. Expected completion today 16:30.', 'warning', 0, '/manager/maintenance');
    await notif(uReception, 'VIP Arrival Pending', 'Rumana Ali (Booking #AG-2026-9043) arriving tomorrow for Junior Sovereign Suite #402.', 'urgent', 0, '/reception/checkin');
    await notif(uHouse, 'Priority Room 104 Clean Required', 'Room 104 marked Dirty post-checkout. Turnaround required before 15:00 arrival.', 'urgent', 0, '/housekeeping');
    await notif(uGuest1, 'Welcome to HABESHA-HOTEL', 'Dear Murad, welcome to your stay in Addis Ababa. Breakfast is served daily from 06:30 to 10:30 AM in the main dining hall.', 'success', 1, '/customer/bookings');

    // ── 21. COMPLAINTS ──────────────────────────────────────────────────────
    await conn.execute(
      'INSERT INTO complaints (customer_id,booking_id,title,description,department_id,priority,status,resolution_notes,resolved_by) VALUES (?,?,?,?,?,?,?,?,?)',
      [c1, b1, 'Wi-Fi Reconnection on Balcony', 'Slight signal dip experienced when sitting at the edge of the private balcony.', dFrontDesk, 'low', 'resolved', 'Provided guest with personal dual-band high-power range extender. Guest confirmed fast connection.', uReception]);

    // ── 22. AUDIT LOGS ──────────────────────────────────────────────────────
    await conn.execute('INSERT INTO audit_logs (user_id,user_role,action,entity_type,entity_id,details,ip_address) VALUES (?,?,?,?,?,?,?)',
      [uReception, 'receptionist', 'GUEST_CHECK_IN', 'booking', b1, 'Checked in Murad Kassim into room 102. Keycards issued: 2.', '192.168.1.101']);
    await conn.execute('INSERT INTO audit_logs (user_id,user_role,action,entity_type,entity_id,details,ip_address) VALUES (?,?,?,?,?,?,?)',
      [uReception, 'receptionist', 'GUEST_CHECK_IN', 'booking', b2, 'Checked in Dr. Olivia Chen into room 202. Welcome pack handed.', '192.168.1.101']);
    await conn.execute('INSERT INTO audit_logs (user_id,user_role,action,entity_type,entity_id,details,ip_address) VALUES (?,?,?,?,?,?,?)',
      [uHouse, 'housekeeper', 'STATUS_UPDATE', 'room', r104, 'Updated room 104 status from occupied to dirty after departure checkout.', '192.168.1.104']);

    // ── 23. HOTEL SETTINGS ──────────────────────────────────────────────────
    const setting = async (key: string, val: string, label: string, cat: string) =>
      conn.execute('INSERT INTO hotel_settings (`key`,value,label,category) VALUES (?,?,?,?)', [key, val, label, cat]);

    await setting('hotel_name', 'HABESHA-HOTEL', 'Hotel Name', 'general');
    await setting('hotel_email', 'reservations@habeshahotel.com', 'Hotel Primary Email', 'general');
    await setting('hotel_phone', '+251 11 667 8000', 'Hotel Phone Line', 'general');
    await setting('hotel_address', 'Bole Sub-City, Africa Avenue (Bole Road), Addis Ababa, Ethiopia', 'Hotel Physical Address', 'general');
    await setting('currency_symbol', '$', 'Currency Symbol', 'finance');
    await setting('currency_code', 'USD', 'Currency ISO Code', 'finance');
    await setting('tax_rate', '12.0', 'Occupancy & City Tax (%)', 'finance');
    await setting('check_in_time', '14:00', 'Standard Check-in Time', 'policies');
    await setting('check_out_time', '11:00', 'Standard Check-out Time', 'policies');
    await setting('cancellation_hours', '48', 'Free Cancellation Notice (Hours)', 'policies');
    await setting('deposit_percentage', '20', 'Advance Deposit Required (%)', 'policies');

    await conn.commit();
    console.log('HABESHA-HOTEL SHMS successfully seeded with production data!');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
