import { Request, Response } from 'express';
import { pool, query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getPayments(req: AuthRequest, res: Response) {
  try {
    const { booking_id, method, search } = req.query;
    let sql = `
      SELECT p.*, b.booking_reference, c.full_name as customer_name, c.email as customer_email,
             r.room_number, u.full_name as recorded_by_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      LEFT JOIN users u ON p.recorded_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role === 'customer') {
      const cust = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (!cust) return res.json([]);
      sql += ' AND b.customer_id = ?'; params.push(cust.id);
    }

    if (booking_id) { sql += ' AND p.booking_id = ?'; params.push(booking_id); }
    if (method)     { sql += ' AND p.payment_method = ?'; params.push(method); }
    if (search)     {
      sql += ' AND (p.payment_reference LIKE ? OR b.booking_reference LIKE ? OR c.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY p.created_at DESC';

    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getPayments error:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

export async function recordPayment(req: AuthRequest, res: Response) {
  try {
    const { booking_id, amount, payment_method = 'card', notes } = req.body;
    if (!booking_id || !amount || Number(amount) <= 0) return res.status(400).json({ error: 'Valid booking ID and amount (> 0) are required' });

    const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [booking_id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const payAmount = parseFloat(Number(amount).toFixed(2));
    const year      = new Date().getFullYear();
    const paymentRef= `PAY-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("INSERT INTO payments (booking_id,payment_reference,amount,payment_method,status,notes,recorded_by) VALUES (?,?,?,?,'completed',?,?)",
        [booking_id, paymentRef, payAmount, payment_method, notes || null, req.user?.id || null]);

      const newPaidTotal    = parseFloat((Number(booking.paid_amount) + payAmount).toFixed(2));
      const newPaymentStatus= newPaidTotal >= Number(booking.total_amount) ? 'paid' : 'partially_paid';
      await conn.execute('UPDATE bookings SET paid_amount=?,payment_status=? WHERE id=?', [newPaidTotal, newPaymentStatus, booking_id]);

      const invoice = await queryOne<any>('SELECT * FROM invoices WHERE booking_id = ?', [booking_id]);
      if (invoice) {
        const invNewPaid   = parseFloat((Number(invoice.paid_amount) + payAmount).toFixed(2));
        const invNewBalance= Math.max(0, parseFloat((Number(invoice.total_amount) - invNewPaid).toFixed(2)));
        const invNewStatus = invNewBalance <= 0 ? 'paid' : 'partially_paid';
        await conn.execute('UPDATE invoices SET paid_amount=?,balance_due=?,status=? WHERE id=?', [invNewPaid, invNewBalance, invNewStatus, invoice.id]);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'staff', 'PAYMENT_RECORD', 'payment', Number(booking_id), `Recorded payment of $${payAmount} (${payment_method}) for booking #${booking.booking_reference}`);
    return res.status(201).json({ message: 'Payment recorded successfully', payment_reference: paymentRef, amount: payAmount });
  } catch (error: any) {
    console.error('recordPayment error:', error);
    return res.status(500).json({ error: 'Failed to record payment' });
  }
}

export async function getInvoices(req: AuthRequest, res: Response) {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT inv.*,
             b.booking_reference, b.check_in_date, b.check_out_date,
             c.full_name as customer_name, c.email as customer_email,
             r.room_number, rt.name as room_type_name
      FROM invoices inv
      JOIN bookings b ON inv.booking_id = b.id
      JOIN customers c ON inv.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role === 'customer') {
      const cust = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (!cust) return res.json([]);
      sql += ' AND inv.customer_id = ?'; params.push(cust.id);
    }
    if (status) { sql += ' AND inv.status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (inv.invoice_number LIKE ? OR b.booking_reference LIKE ? OR c.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY inv.created_at DESC';

    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getInvoices error:', error);
    return res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}

export async function getInvoiceById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const invoice = await queryOne<any>(`
      SELECT inv.*,
             b.booking_reference, b.check_in_date, b.check_out_date, b.nights_count,
             b.adults_count, b.children_count,
             c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone,
             c.address as customer_address, c.country as customer_country,
             r.room_number, rt.name as room_type_name
      FROM invoices inv
      JOIN bookings b ON inv.booking_id = b.id
      JOIN customers c ON inv.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE inv.id = ? OR inv.invoice_number = ?
    `, [id, id]);

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const [items, payments, hotelSettingsList] = await Promise.all([
      query('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]),
      query('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at ASC', [invoice.booking_id]),
      query<{ key: string; value: string }>('SELECT `key`, value FROM hotel_settings'),
    ]);

    const settingsMap: Record<string, string> = {};
    hotelSettingsList.forEach((s: any) => { settingsMap[s.key] = s.value; });

    return res.json({
      invoice: { ...invoice, items, payments },
      hotel: {
        name:     settingsMap['hotel_name']    || 'HABESHA-HOTEL',
        email:    settingsMap['hotel_email']   || 'concierge@habeshahotel.com',
        phone:    settingsMap['hotel_phone']   || '+1 (800) 555-HABESHA',
        address:  settingsMap['hotel_address'] || '100 Grand Boulevard, Metropolitan District, NY 10001',
        tax_rate: settingsMap['tax_rate']      || '12.0',
        currency: settingsMap['currency_symbol'] || '$',
      },
    });
  } catch (error: any) {
    console.error('getInvoiceById error:', error);
    return res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
}
