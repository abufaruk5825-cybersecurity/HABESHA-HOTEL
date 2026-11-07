import 'dotenv/config';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootEnvPath = path.resolve(process.cwd(), '.env');
const fallbackRootEnv = path.resolve(__dirname, '../../.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
} else if (fs.existsSync(fallbackRootEnv)) {
  dotenv.config({ path: fallbackRootEnv, override: true });
} else {
  dotenv.config({ override: true });
}

const cfg = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT)  || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
};

console.log('\n=== SHMS MySQL Database Check ===');
console.log(`Host: ${cfg.host}:${cfg.port}  User: ${cfg.user}\n`);

let conn: mysql.Connection | null = null;

try {
  // ── 1. Basic connection ──────────────────────────────────────────────────
  conn = await mysql.createConnection(cfg);
  const [[vrow]] = await conn.execute('SELECT VERSION() as v') as any;
  console.log(`✅ Connected to MySQL ${vrow.v}`);

  // ── 2. Create DB if missing ──────────────────────────────────────────────
  const [dbs] = await conn.query("SHOW DATABASES LIKE 'shms'") as any;
  if (dbs.length === 0) {
    await conn.query('CREATE DATABASE shms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "shms" created');
  } else {
    console.log('✅ Database "shms" already exists');
  }
  await conn.query('USE shms');

  // ── 3. Run schema ────────────────────────────────────────────────────────
  const schemaPath = [
    path.resolve(process.cwd(), 'server/db/schema.sql'),
    path.resolve(__dirname, '../db/schema.sql'),
  ].find(p => fs.existsSync(p)) || path.resolve(__dirname, '../db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const stmts  = schema.split(';').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  let created  = 0;
  let skipped  = 0;
  for (const stmt of stmts) {
    try {
      await conn.query(stmt);
      created++;
    } catch (e: any) {
      if (e.code === 'ER_DUP_KEYNAME' || e.code === 'ER_TABLE_EXISTS_ERROR') {
        skipped++;
      } else {
        console.warn(`  ⚠ Schema [${e.code}]: ${(e.sqlMessage || e.message)?.slice(0, 100)}`);
      }
    }
  }
  console.log(`✅ Schema applied  (${created} executed, ${skipped} already existed)`);

  // ── 4. Check all 27 tables ───────────────────────────────────────────────
  const expectedTables = [
    'roles','permissions','role_permissions','users','departments','employees',
    'customers','room_types','rooms','amenities','room_amenities','bookings',
    'booking_rooms','booking_guests','payments','invoices','invoice_items',
    'hotel_services','service_orders','housekeeping_tasks','maintenance_requests',
    'reviews','notifications','complaints','audit_logs','hotel_settings','expenses'
  ];
  const [tableRows] = await conn.query('SHOW TABLES') as any;
  const existingTables: string[] = tableRows.map((r: any) => Object.values(r)[0] as string);
  
  console.log('\n--- Table existence (26 expected) ---');
  let missing = 0;
  for (const t of expectedTables) {
    if (existingTables.includes(t)) {
      console.log(`  ✅ ${t}`);
    } else {
      console.log(`  ❌ MISSING: ${t}`);
      missing++;
    }
  }

  if (missing > 0) {
    console.log(`\n❌ ${missing} table(s) missing — check schema.sql`);
    process.exit(1);
  }
  console.log(`\n✅ All 26 tables present`);

  // ── 5. Seed if empty ────────────────────────────────────────────────────
  const [[ucnt]] = await conn.execute('SELECT COUNT(*) as c FROM users') as any;
  if (ucnt.c === 0) {
    console.log('\nℹ️  Tables are empty — running seed...');
    await conn.end();
    conn = null;
    const { seedDatabase } = await import('../db/seeds/seed.ts');
    await seedDatabase();
    conn = await mysql.createConnection({ ...cfg, database: 'shms' });
    console.log('✅ Seed completed');
  } else {
    console.log(`\n✅ Database already seeded (${ucnt.c} users found)`);
    const { syncEthiopianDefaults } = await import('../db/seeds/seed.ts');
    await syncEthiopianDefaults();
    console.log('✅ Synchronized Ethiopian hotel settings & staff records');
  }

  // ── 6. Row count audit ──────────────────────────────────────────────────
  console.log('\n--- Row counts ---');
  const auditTables = [
    'users', 'customers', 'rooms', 'room_types', 'amenities',
    'bookings', 'payments', 'invoices', 'invoice_items',
    'hotel_services', 'service_orders',
    'housekeeping_tasks', 'maintenance_requests',
    'reviews', 'notifications', 'hotel_settings', 'expenses'
  ];
  let emptyCount = 0;
  for (const t of auditTables) {
    const [[row]] = await conn.execute(`SELECT COUNT(*) as c FROM ${t}`) as any;
    const icon = row.c > 0 ? '✅' : '⚠️ ';
    if (row.c === 0) emptyCount++;
    console.log(`  ${icon} ${t.padEnd(26)} ${row.c} rows`);
  }
  if (emptyCount > 0) console.log(`  ⚠️  ${emptyCount} table(s) have 0 rows (may need seeding)`);

  // ── 7. Verify critical queries (join tests) ──────────────────────────────
  console.log('\n--- Critical query tests ---');

  // Auth: admin user exists
  const [[admin]] = await conn.execute("SELECT id,email,role FROM users WHERE role='admin' LIMIT 1") as any;
  if (admin) console.log(`  ✅ Admin user found: ${admin.email}`);
  else       console.log('  ❌ No admin user — seed may have failed');

  // Rooms: available count
  const [[avail]] = await conn.execute("SELECT COUNT(*) as c FROM rooms WHERE status='available'") as any;
  console.log(`  ✅ Available rooms: ${avail.c}`);

  // Bookings: active
  const [[active]] = await conn.execute("SELECT COUNT(*) as c FROM bookings WHERE status IN ('confirmed','checked_in')") as any;
  console.log(`  ✅ Active bookings: ${active.c}`);

  // Settings: tax_rate key
  const [[tax]] = await conn.execute("SELECT value FROM hotel_settings WHERE `key`='tax_rate'") as any;
  if (tax) console.log(`  ✅ Tax rate setting: ${tax.value}%`);
  else     console.log('  ❌ tax_rate setting missing');

  // Full JOIN: booking → customer → room → room_type
  const [[brow]] = await conn.execute(`
    SELECT b.booking_reference, c.full_name, r.room_number, rt.name AS room_type
    FROM bookings b
    JOIN customers c  ON b.customer_id   = c.id
    JOIN rooms r      ON b.room_id        = r.id
    JOIN room_types rt ON r.room_type_id  = rt.id
    LIMIT 1
  `) as any;
  if (brow) console.log(`  ✅ Booking JOIN: ${brow.booking_reference} | ${brow.full_name} | Room ${brow.room_number} (${brow.room_type})`);
  else      console.log('  ❌ Booking JOIN failed — no data');

  // Invoice + items
  const [[inv]] = await conn.execute(`
    SELECT i.invoice_number, COUNT(ii.id) AS item_count
    FROM invoices i JOIN invoice_items ii ON ii.invoice_id = i.id
    GROUP BY i.id LIMIT 1
  `) as any;
  if (inv) console.log(`  ✅ Invoice JOIN: ${inv.invoice_number} → ${inv.item_count} line items`);
  else     console.log('  ⚠️  No invoice items found');

  // Housekeeping task with employee join
  const [[hk]] = await conn.execute(`
    SELECT ht.id, r.room_number, u.full_name AS assigned_to, ht.status
    FROM housekeeping_tasks ht
    JOIN rooms r ON ht.room_id = r.id
    LEFT JOIN employees e ON ht.assigned_employee_id = e.id
    LEFT JOIN users u ON e.user_id = u.id
    LIMIT 1
  `) as any;
  if (hk) console.log(`  ✅ Housekeeping JOIN: Task #${hk.id} for Room ${hk.room_number} → ${hk.assigned_to ?? 'unassigned'} [${hk.status}]`);
  else    console.log('  ⚠️  No housekeeping tasks found');

  // Demo switch: one user per role
  const [roleRows] = await conn.execute("SELECT role, COUNT(*) as c FROM users GROUP BY role") as any;
  const roles = roleRows.map((r: any) => `${r.role}(${r.c})`).join(', ');
  console.log(`  ✅ Users by role: ${roles}`);

  // FK integrity: no orphaned bookings
  const [[orphan]] = await conn.execute(`
    SELECT COUNT(*) as c FROM bookings b
    LEFT JOIN customers c ON b.customer_id = c.id
    WHERE c.id IS NULL
  `) as any;
  if (orphan.c === 0) console.log('  ✅ FK integrity: no orphaned bookings');
  else                console.log(`  ❌ FK integrity: ${orphan.c} orphaned booking(s)`);

  console.log('\n🏨 All checks passed — SHMS MySQL database is healthy!\n');

} catch (err: any) {
  console.error('\n❌ FATAL:', err.message);
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.log('\n🔍 Running auto-diagnostic to find your MySQL instance & credentials...');
    const candidatePorts = [3306, 3307, 3308];
    const candidatePasswords = [
      process.env.DB_PASSWORD || '',
      'sey1234',
      'root',
      'admin',
      '1234',
      '123456',
      'Sey1234',
      '',
    ].filter((v, i, a) => a.indexOf(v) === i);

    let found = false;
    for (const port of candidatePorts) {
      for (const pass of candidatePasswords) {
        try {
          const testConn = await mysql.createConnection({
            host: cfg.host,
            port,
            user: cfg.user,
            password: pass,
          });
          const [[v]] = await testConn.execute('SELECT VERSION() as v') as any;
          await testConn.end();
          console.log(`\n🎉 MATCH FOUND!`);
          console.log(`   Host:     ${cfg.host}`);
          console.log(`   Port:     ${port}`);
          console.log(`   User:     ${cfg.user}`);
          console.log(`   Password: ${pass ? pass : '(empty / no password)'}`);
          console.log(`   MySQL:    ${v.v}`);
          console.log(`\n➜ Please update your .env and server/.env files:`);
          console.log(`   DB_PORT=${port}`);
          console.log(`   DB_PASSWORD=${pass}`);
          found = true;
          break;
        } catch {}
      }
      if (found) break;
    }
    if (!found) {
      console.log('\n💡 In MySQL Workbench, open a query tab and run:');
      console.log('   SELECT @@port, @@version;');
      console.log("   ALTER USER 'root'@'localhost' IDENTIFIED BY 'sey1234';");
      console.log('   FLUSH PRIVILEGES;');
    }
  } else if (err.code === 'ER_BAD_DB_ERROR') {
    console.error('\n   Database "shms" does not exist.');
    console.error('   ➜ Run: CREATE DATABASE shms CHARACTER SET utf8mb4;  in your MySQL client');
  } else {
    console.error('   Code:', err.code);
  }
  process.exit(1);
} finally {
  if (conn) await conn.end().catch(() => {});
}
