import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

// ─── Roles an admin is allowed to assign ─────────────────────────────────────
const ADMIN_ASSIGNABLE_ROLES = ['manager', 'receptionist', 'housekeeper', 'accountant', 'maintenance', 'customer'];
const ALL_ROLES = ['superadmin', 'admin', 'manager', 'receptionist', 'housekeeper', 'accountant', 'maintenance', 'customer'];

// ─── GET /users ───────────────────────────────────────────────────────────────

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const { role, is_active, search, department_id, page = '1', limit = '50' } = req.query;

    let sql = `
      SELECT u.id, u.email, u.role, u.full_name, u.phone, u.avatar_url, u.is_active, u.created_at, u.updated_at,
             e.id AS employee_id, e.employee_code, e.position, e.salary, e.hire_date, e.status AS employee_status,
             d.id AS department_id, d.name AS department_name
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Admins cannot see superadmin accounts
    if (req.user?.role === 'admin') {
      sql += " AND u.role != 'superadmin'";
    }

    if (role)              { sql += ' AND u.role=?';         params.push(role); }
    if (is_active !== undefined) { sql += ' AND u.is_active=?'; params.push(is_active === 'true' ? 1 : 0); }
    if (department_id)     { sql += ' AND e.department_id=?'; params.push(department_id); }
    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    sql += ' ORDER BY u.created_at DESC';

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const offset = (pageNum - 1) * pageSize;

    let countSql = `
      SELECT COUNT(*) AS total
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE 1=1
    `;
    if (req.user?.role === 'admin') {
      countSql += " AND u.role != 'superadmin'";
    }
    if (role)              { countSql += ' AND u.role=?'; }
    if (is_active !== undefined) { countSql += ' AND u.is_active=?'; }
    if (department_id)     { countSql += ' AND e.department_id=?'; }
    if (search)            { countSql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'; }

    const [countRow, users] = await Promise.all([
      queryOne<{ total: number }>(countSql, params),
      query<any>(sql + ` LIMIT ${pageSize} OFFSET ${offset}`, params),
    ]);

    return res.json({
      users,
      total: countRow?.total ?? 0,
      page: pageNum,
      pageSize,
    });
  } catch (error: any) {
    console.error('getUsers error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// ─── POST /users ──────────────────────────────────────────────────────────────

export async function createUser(req: AuthRequest, res: Response) {
  try {
    const { email, password, role, full_name, phone, department_id, employee_code, position } = req.body;
    if (!email || !password || !role || !full_name) {
      return res.status(400).json({ error: 'Email, password, role, and full name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Privilege escalation guard — admins cannot create superadmins or other admins
    if (req.user?.role === 'admin' && !ADMIN_ASSIGNABLE_ROLES.includes(role)) {
      return res.status(403).json({ error: `Admins cannot assign the '${role}' role` });
    }
    if (!ALL_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role: ${role}` });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email=?', [email.toLowerCase().trim()]);
    if (existing) return res.status(400).json({ error: 'A user with this email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const r = await execute(
      'INSERT INTO users (email,password_hash,role,full_name,phone,is_active) VALUES (?,?,?,?,?,1)',
      [email.toLowerCase().trim(), password_hash, role, full_name, phone || null]
    );
    const newUserId = r.insertId;

    // Auto-create employee record for staff roles
    if (role !== 'customer') {
      const code = employee_code || `EMP-${Date.now()}`;
      const pos = position || role.charAt(0).toUpperCase() + role.slice(1);
      const deptId = department_id || null;
      await execute(
        'INSERT INTO employees (user_id,department_id,employee_code,position,hire_date,status) VALUES (?,?,?,?,CURDATE(),?)',
        [newUserId, deptId, code, pos, 'active']
      ).catch(() => {}); // non-fatal if employee record fails
    } else {
      // Auto-create customer record
      await execute(
        'INSERT INTO customers (user_id,full_name,email,phone) VALUES (?,?,?,?)',
        [newUserId, full_name, email.toLowerCase().trim(), phone || null]
      ).catch(() => {});
    }

    logAudit(req.user?.id ?? null, req.user?.role ?? null, 'USER_CREATE', 'user', newUserId, `Created ${role} account for ${email}`);
    return res.status(201).json({ message: 'User created successfully', id: newUserId });
  } catch (error: any) {
    console.error('createUser error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

// ─── PUT /users/:id ───────────────────────────────────────────────────────────

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role, full_name, phone, is_active, password, department_id, position } = req.body;

    const targetUser = await queryOne<any>('SELECT id, role, email FROM users WHERE id=?', [id]);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Prevent any non-superadmin from modifying a superadmin account
    if (targetUser.role === 'superadmin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Cannot modify Super Admin accounts' });
    }

    // Prevent admins from granting superadmin or admin roles
    if (role && req.user?.role === 'admin' && !ADMIN_ASSIGNABLE_ROLES.includes(role)) {
      return res.status(403).json({ error: `Admins cannot assign the '${role}' role` });
    }

    // Prevent self-demotion from superadmin
    if (req.user?.id === Number(id) && role && role !== req.user.role && req.user.role === 'superadmin') {
      return res.status(403).json({ error: 'Super Admin cannot demote themselves' });
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (role !== undefined)      { fields.push('role=?');      params.push(role); }
    if (full_name !== undefined) { fields.push('full_name=?'); params.push(full_name); }
    if (phone !== undefined)     { fields.push('phone=?');     params.push(phone || null); }
    if (is_active !== undefined) { fields.push('is_active=?'); params.push(is_active ? 1 : 0); }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      const hash = await bcrypt.hash(password, 10);
      fields.push('password_hash=?');
      params.push(hash);
    }

    if (fields.length === 0 && !department_id && !position) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    if (fields.length > 0) {
      params.push(id);
      await execute(`UPDATE users SET ${fields.join(',')} WHERE id=?`, params);
    }

    // Update employee record if relevant fields supplied
    if (department_id !== undefined || position !== undefined) {
      const empExists = await queryOne('SELECT id FROM employees WHERE user_id=?', [id]);
      if (empExists) {
        const empFields: string[] = [];
        const empParams: any[] = [];
        if (department_id !== undefined) { empFields.push('department_id=?'); empParams.push(department_id || null); }
        if (position !== undefined)      { empFields.push('position=?');      empParams.push(position); }
        if (empFields.length > 0) {
          empParams.push(id);
          await execute(`UPDATE employees SET ${empFields.join(',')} WHERE user_id=?`, empParams);
        }
      }
    }

    logAudit(req.user?.id ?? null, req.user?.role ?? null, 'USER_UPDATE', 'user', Number(id), `Updated user ${targetUser.email}`);
    return res.json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error('updateUser error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

// ─── DELETE /users/:id ────────────────────────────────────────────────────────

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const targetUser = await queryOne<any>('SELECT id, role, email FROM users WHERE id=?', [id]);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Only superadmin can hard-delete; protect superadmin accounts
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ error: 'Super Admin accounts cannot be deleted' });
    }
    // Prevent self-deletion
    if (req.user?.id === Number(id)) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }

    await execute('DELETE FROM users WHERE id=?', [id]);
    logAudit(req.user?.id ?? null, req.user?.role ?? null, 'USER_DELETE', 'user', Number(id), `Deleted user ${targetUser.email} (${targetUser.role})`);
    return res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

// ─── GET /users/:id/activity ──────────────────────────────────────────────────

export async function getUserActivity(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const logs = await query<any>(
      'SELECT action, entity_type, entity_id, details, ip_address, created_at FROM audit_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 50',
      [id]
    );
    return res.json(logs);
  } catch (err: any) {
    console.error('getUserActivity error:', err);
    return res.status(500).json({ error: 'Failed to fetch user activity' });
  }
}

// ─── GET /employees ───────────────────────────────────────────────────────────

export async function getEmployees(_req: Request, res: Response) {
  try {
    return res.json(await query(`
      SELECT e.*, u.email, u.full_name, u.phone, u.avatar_url, u.role as user_role, d.name as department_name
      FROM employees e
      JOIN users u ON e.user_id=u.id
      LEFT JOIN departments d ON e.department_id=d.id
      ORDER BY e.created_at DESC
    `));
  } catch (error: any) {
    console.error('getEmployees error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
}

// ─── GET /departments ─────────────────────────────────────────────────────────

export async function getDepartments(_req: Request, res: Response) {
  try {
    return res.json(await query(`
      SELECT d.*, COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON e.department_id=d.id AND e.status='active'
      GROUP BY d.id ORDER BY d.name ASC
    `));
  } catch (error: any) {
    console.error('getDepartments error:', error);
    return res.status(500).json({ error: 'Failed to fetch departments' });
  }
}
