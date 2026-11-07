import { Request, Response } from 'express';
import { query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getCustomers(req: Request, res: Response) {
  try {
    const { search } = req.query;
    let sql = `
      SELECT c.*,
             COUNT(DISTINCT b.id) as total_bookings,
             COALESCE(SUM(b.total_amount),0) as total_spent,
             MAX(b.check_in_date) as last_stay_date
      FROM customers c
      LEFT JOIN bookings b ON b.customer_id=c.id AND b.status!='cancelled'
      WHERE 1=1
    `;
    const params: any[] = [];
    if (search) {
      sql += ' AND (c.full_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' GROUP BY c.id ORDER BY c.created_at DESC';
    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getCustomers error:', error);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

export async function getCustomerById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const customer = await queryOne('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const bookings = await query(`
      SELECT b.*, r.room_number, rt.name as room_type_name
      FROM bookings b JOIN rooms r ON b.room_id=r.id JOIN room_types rt ON r.room_type_id=rt.id
      WHERE b.customer_id=? ORDER BY b.created_at DESC
    `, [id]);

    return res.json({ ...customer, bookings });
  } catch (error: any) {
    console.error('getCustomerById error:', error);
    return res.status(500).json({ error: 'Failed to fetch customer details' });
  }
}

export async function getReviews(req: Request, res: Response) {
  try {
    const { room_type_id, all } = req.query;
    let sql = `
      SELECT rev.*, c.full_name as customer_name, c.country as customer_country, rt.name as room_type_name
      FROM reviews rev
      JOIN customers c ON rev.customer_id=c.id
      LEFT JOIN room_types rt ON rev.room_type_id=rt.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (all !== 'true') { sql += ' AND rev.is_approved=1'; }
    if (room_type_id)   { sql += ' AND rev.room_type_id=?'; params.push(room_type_id); }
    sql += ' ORDER BY rev.created_at DESC';
    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getReviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

export async function createReview(req: AuthRequest, res: Response) {
  try {
    const { booking_id, room_type_id, rating, title, comment } = req.body;
    if (!rating || !title || !comment) return res.status(400).json({ error: 'Rating (1-5), title, and comment are required' });

    let customerId = 1;
    if (req.user?.role === 'customer') {
      const cust = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
      if (cust) customerId = cust.id;
    }

    const r = await execute('INSERT INTO reviews (customer_id,booking_id,room_type_id,rating,title,comment,is_approved) VALUES (?,?,?,?,?,?,1)',
      [customerId, booking_id || null, room_type_id || null, rating, title, comment]);

    return res.status(201).json({ message: 'Thank you! Your review has been published.', id: r.insertId });
  } catch (error: any) {
    console.error('createReview error:', error);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
}

export async function getComplaints(req: AuthRequest, res: Response) {
  try {
    let sql = `
      SELECT cmp.*, c.full_name as customer_name, c.email as customer_email,
             d.name as department_name, b.booking_reference
      FROM complaints cmp
      JOIN customers c ON cmp.customer_id=c.id
      LEFT JOIN departments d ON cmp.department_id=d.id
      LEFT JOIN bookings b ON cmp.booking_id=b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (req.user?.role === 'customer') {
      const cust = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
      if (!cust) return res.json([]);
      sql += ' AND cmp.customer_id=?'; params.push(cust.id);
    }
    sql += ` ORDER BY FIELD(cmp.priority,'critical','high','medium','low'), cmp.created_at DESC`;
    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getComplaints error:', error);
    return res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

export async function createComplaint(req: AuthRequest, res: Response) {
  try {
    const { booking_id, title, description, priority = 'medium', department_id } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });

    let customerId = 1;
    if (req.user?.role === 'customer') {
      const cust = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id=?', [req.user.id]);
      if (cust) customerId = cust.id;
    }

    const r = await execute("INSERT INTO complaints (customer_id,booking_id,title,description,priority,department_id,status) VALUES (?,?,?,?,?,?,'open')",
      [customerId, booking_id || null, title, description, priority, department_id || null]);

    return res.status(201).json({ message: 'Complaint registered. Our guest relations team is reviewing it.', id: r.insertId });
  } catch (error: any) {
    console.error('createComplaint error:', error);
    return res.status(500).json({ error: 'Failed to register complaint' });
  }
}

export async function resolveComplaint(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status = 'resolved', resolution_notes } = req.body;

    await execute('UPDATE complaints SET status=?,resolution_notes=?,resolved_by=?,resolved_at=NOW() WHERE id=?',
      [status, resolution_notes || null, req.user?.id || null, id]);

    logAudit(req.user?.id || null, req.user?.role || null, 'COMPLAINT_RESOLVE', 'complaint', Number(id), `Resolved complaint #${id}`);
    return res.json({ message: 'Complaint resolved successfully' });
  } catch (error: any) {
    console.error('resolveComplaint error:', error);
    return res.status(500).json({ error: 'Failed to update complaint' });
  }
}
