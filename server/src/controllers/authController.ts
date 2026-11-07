import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool, query, queryOne, execute } from '../db/database.ts';
import { generateToken, AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await queryOne<any>('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated. Please contact hotel administration.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const authUser = { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
    const token = generateToken(authUser);

    res.cookie('shms_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    logAudit(user.id, user.role, 'USER_LOGIN', 'user', user.id, `User ${user.email} signed in`);

    return res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, phone: user.phone, avatar_url: user.avatar_url } });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, full_name, phone, address, country } = req.body;
    if (!email || !password || !full_name) return res.status(400).json({ error: 'Email, password and full name are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) return res.status(400).json({ error: 'An account with this email already exists' });

    const password_hash = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    let newUserId: number;
    try {
      await conn.beginTransaction();
      const [userRes] = await conn.execute(
        "INSERT INTO users (email,password_hash,role,full_name,phone,is_active) VALUES (?,?,'customer',?,?,1)",
        [email.toLowerCase().trim(), password_hash, full_name, phone || null]
      ) as any;
      newUserId = userRes.insertId;

      await conn.execute(
        'INSERT INTO customers (user_id,full_name,email,phone,address,country) VALUES (?,?,?,?,?,?)',
        [newUserId, full_name, email.toLowerCase().trim(), phone || null, address || null, country || 'United States']
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const token = generateToken({ id: newUserId!, email: email.toLowerCase().trim(), role: 'customer', full_name });
    res.cookie('shms_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    logAudit(newUserId!, 'customer', 'USER_REGISTER', 'user', newUserId!, `Customer ${email} registered`);

    return res.status(201).json({ message: 'Account created successfully', token, user: { id: newUserId!, email, role: 'customer', full_name, phone } });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const user = await queryOne<any>('SELECT id,email,role,full_name,phone,avatar_url,is_active,created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User record not found' });

  let extraData: any = {};
  if (user.role === 'customer') {
    extraData.customer = await queryOne('SELECT * FROM customers WHERE user_id = ?', [user.id]);
  } else {
    extraData.employee = await queryOne(`
      SELECT e.*, d.name as department_name FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id WHERE e.user_id = ?
    `, [user.id]);
  }

  return res.json({ user, ...extraData });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('shms_token');
  return res.json({ message: 'Signed out successfully' });
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await queryOne<any>('SELECT id, email, role FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

    logAudit(user.id, user.role, 'PASSWORD_RESET', 'user', user.id, `User ${user.email} reset their password`);

    return res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

export async function demoSwitch(req: Request, res: Response) {
  const { role } = req.body;
  const validRoles = ['superadmin', 'admin', 'manager', 'receptionist', 'housekeeper', 'accountant', 'maintenance', 'customer'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: `Invalid demo role. Must be one of: ${validRoles.join(', ')}` });

  const user = await queryOne<any>('SELECT * FROM users WHERE role = ? AND is_active = 1 LIMIT 1', [role]);
  if (!user) return res.status(404).json({ error: `No active user found for role: ${role}` });

  const token = generateToken({ id: user.id, email: user.email, role: user.role, full_name: user.full_name });
  res.cookie('shms_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.json({ message: `Switched demo role to ${role}`, token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, phone: user.phone, avatar_url: user.avatar_url } });
}
