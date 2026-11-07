import { Request, Response } from 'express';
import { pool, query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getHotelServices(req: Request, res: Response) {
  try {
    const { category, available_only } = req.query;
    let sql = 'SELECT * FROM hotel_services WHERE 1=1';
    const params: any[] = [];
    if (category)               { sql += ' AND category=?';       params.push(category); }
    if (available_only === 'true') { sql += ' AND is_available=1'; }
    sql += ' ORDER BY category ASC, price ASC';
    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getHotelServices error:', error);
    return res.status(500).json({ error: 'Failed to fetch hotel services' });
  }
}

export async function createHotelService(req: AuthRequest, res: Response) {
  try {
    const { name, category, price, description, icon = 'Coffee' } = req.body;
    if (!name || !category || price === undefined) return res.status(400).json({ error: 'Name, category, and price are required' });

    const r = await execute('INSERT INTO hotel_services (name,category,price,description,icon) VALUES (?,?,?,?,?)',
      [name, category, price, description || null, icon]);

    logAudit(req.user?.id || null, req.user?.role || null, 'SERVICE_CREATE', 'hotel_service', r.insertId, `Created service ${name} ($${price})`);
    return res.status(201).json({ message: 'Service created successfully', id: r.insertId });
  } catch (error: any) {
    console.error('createHotelService error:', error);
    return res.status(500).json({ error: 'Failed to create hotel service' });
  }
}

export async function orderHotelService(req: AuthRequest, res: Response) {
  try {
    const { booking_id, service_id, quantity = 1, notes } = req.body;
    if (!booking_id || !service_id) return res.status(400).json({ error: 'Booking ID and service ID are required' });

    const [booking, service] = await Promise.all([
      queryOne<any>('SELECT * FROM bookings WHERE id=?', [booking_id]),
      queryOne<any>('SELECT * FROM hotel_services WHERE id=? AND is_available=1', [service_id]),
    ]);
    if (!booking) return res.status(404).json({ error: 'Active booking not found' });
    if (['checked_out','cancelled'].includes(booking.status)) return res.status(400).json({ error: 'Cannot add service to checked-out or cancelled booking' });
    if (!service) return res.status(404).json({ error: 'Service not found or unavailable' });

    const qty       = parseInt(quantity, 10) || 1;
    const lineTotal = parseFloat((service.price * qty).toFixed(2));

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute("INSERT INTO service_orders (booking_id,service_id,quantity,unit_price,total_price,status,notes,ordered_by) VALUES (?,?,?,?,?,'in_progress',?,?)",
        [booking_id, service_id, qty, service.price, lineTotal, notes || null, req.user?.id || null]);

      const invoice = await queryOne<any>('SELECT * FROM invoices WHERE booking_id=?', [booking_id]);
      if (invoice) {
        await conn.execute('INSERT INTO invoice_items (invoice_id,description,quantity,unit_price,total_price,item_type) VALUES (?,?,?,?,?,?)',
          [invoice.id, `${service.name} (${qty}x)`, qty, service.price, lineTotal, 'service']);

        const taxRow  = await queryOne<{ value: string }>("SELECT value FROM hotel_settings WHERE `key`='tax_rate'");
        const taxRate = taxRow ? parseFloat(taxRow.value) : 12.0;
        const addTax  = parseFloat(((lineTotal * taxRate) / 100).toFixed(2));

        const newSub    = parseFloat((Number(invoice.subtotal) + lineTotal).toFixed(2));
        const newTax    = parseFloat((Number(invoice.tax_amount) + addTax).toFixed(2));
        const newTotal  = parseFloat((newSub + newTax - Number(invoice.discount_amount)).toFixed(2));
        const newBalance= Math.max(0, parseFloat((newTotal - Number(invoice.paid_amount)).toFixed(2)));

        await conn.execute("UPDATE invoices SET subtotal=?,tax_amount=?,total_amount=?,balance_due=?,status=IF(?=0,'paid','partially_paid') WHERE id=?",
          [newSub, newTax, newTotal, newBalance, newBalance, invoice.id]);
        await conn.execute("UPDATE bookings SET services_total=services_total+?,tax_amount=?,total_amount=?,payment_status=IF(?=0,'paid','partially_paid') WHERE id=?",
          [lineTotal, newTax, newTotal, newBalance, booking_id]);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'customer', 'SERVICE_ORDER', 'service_order', Number(booking_id), `Ordered ${qty}x ${service.name} ($${lineTotal})`);
    return res.status(201).json({ message: `${service.name} ordered successfully and added to guest invoice`, total_added: lineTotal });
  } catch (error: any) {
    console.error('orderHotelService error:', error);
    return res.status(500).json({ error: 'Failed to order hotel service' });
  }
}
