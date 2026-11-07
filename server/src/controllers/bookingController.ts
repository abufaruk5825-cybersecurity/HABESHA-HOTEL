import { Request, Response } from 'express';
import { pool, query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getBookings(req: AuthRequest, res: Response) {
  try {
    const { status, customer_id, room_id, search, from_date, to_date } = req.query;
    let sql = `
      SELECT b.*,
             c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone,
             r.room_number, r.floor_number,
             rt.name as room_type_name, rt.image_url as room_type_image,
             inv.invoice_number, inv.balance_due, inv.status as invoice_status
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN invoices inv ON inv.booking_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role === 'customer') {
      const cust = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (!cust) return res.json([]);
      sql += ' AND b.customer_id = ?'; params.push(cust.id);
    } else if (customer_id) {
      sql += ' AND b.customer_id = ?'; params.push(customer_id);
    }

    if (status)    { sql += ' AND b.status = ?';            params.push(status); }
    if (room_id)   { sql += ' AND b.room_id = ?';           params.push(room_id); }
    if (from_date) { sql += ' AND b.check_in_date >= ?';    params.push(from_date); }
    if (to_date)   { sql += ' AND b.check_out_date <= ?';   params.push(to_date); }
    if (search)    {
      sql += ' AND (b.booking_reference LIKE ? OR c.full_name LIKE ? OR c.email LIKE ? OR r.room_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY b.created_at DESC';
    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getBookings error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

export async function getBookingById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const booking = await queryOne<any>(`
      SELECT b.*,
             c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone,
             c.address as customer_address, c.country as customer_country, c.id_document_number,
             r.room_number, r.floor_number, r.status as room_status, r.operational_status,
             rt.name as room_type_name, rt.code as room_type_code, rt.image_url as room_type_image,
             rt.bed_type, rt.size_sqm
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE b.id = ? OR b.booking_reference = ?
    `, [id, id]);

    if (!booking) return res.status(404).json({ error: 'Booking reservation not found' });

    if (req.user?.role === 'customer') {
      const cust = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (!cust || cust.id !== booking.customer_id) return res.status(403).json({ error: 'Unauthorized to view this reservation' });
    }

    const [guests, payments, invoice, serviceOrders] = await Promise.all([
      query('SELECT * FROM booking_guests WHERE booking_id = ?', [booking.id]),
      query('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC', [booking.id]),
      queryOne<any>('SELECT * FROM invoices WHERE booking_id = ?', [booking.id]),
      query(`SELECT so.*, hs.name as service_name, hs.category as service_category FROM service_orders so JOIN hotel_services hs ON so.service_id = hs.id WHERE so.booking_id = ?`, [booking.id]),
    ]);

    let invoiceItems: any[] = [];
    if (invoice) invoiceItems = await query('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);

    return res.json({ ...booking, guests, payments, invoice: invoice ? { ...invoice, items: invoiceItems } : null, service_orders: serviceOrders });
  } catch (error: any) {
    console.error('getBookingById error:', error);
    return res.status(500).json({ error: 'Failed to fetch booking details' });
  }
}

export async function createBooking(req: AuthRequest, res: Response) {
  try {
    const {
      room_id, check_in_date, check_out_date,
      adults_count = 1, children_count = 0, special_requests,
      primary_guest_name, primary_guest_email, primary_guest_phone,
      additional_guests, service_ids = [],
      initial_payment_amount = 0, payment_method = 'card',
    } = req.body;

    if (!room_id || !check_in_date || !check_out_date) return res.status(400).json({ error: 'Room ID, check-in date, and check-out date are required' });

    const checkIn  = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return res.status(400).json({ error: 'Invalid dates provided' });
    if (checkOut <= checkIn) return res.status(400).json({ error: 'Check-out must be after check-in' });

    const nightsCount = Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    // Determine customer
    let customerId: number = 0;
    if (req.user?.role === 'customer') {
      const c = await queryOne<{ id: number }>('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (c) customerId = c.id;
    }
    if (!customerId) {
      const guestEmail = (primary_guest_email || req.user?.email || '').toLowerCase().trim();
      const guestName  = primary_guest_name || req.user?.full_name || 'Guest';
      const existing   = await queryOne<{ id: number }>('SELECT id FROM customers WHERE email = ?', [guestEmail]);
      if (existing) {
        customerId = existing.id;
      } else {
        const r = await execute('INSERT INTO customers (user_id,full_name,email,phone) VALUES (?,?,?,?)', [req.user?.id || null, guestName, guestEmail, primary_guest_phone || null]);
        customerId = r.insertId;
      }
    }

    const conn = await pool.getConnection();
    let createdBookingId: number = 0;
    let bookingRef = '';
    let totalAmount = 0;

    try {
      await conn.beginTransaction();

      // Double-booking check
      const conflict = await queryOne<any>(`
        SELECT id, booking_reference FROM bookings
        WHERE room_id = ? AND status IN ('confirmed','checked_in')
          AND check_in_date < ? AND check_out_date > ?
      `, [room_id, check_out_date, check_in_date]);
      if (conflict) throw new Error(`Room already reserved (Booking #${conflict.booking_reference})`);

      const room = await queryOne<any>(`SELECT r.*, rt.capacity, rt.name as room_type_name FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id WHERE r.id = ?`, [room_id]);
      if (!room) throw new Error('Selected room does not exist');

      const totalGuests = (parseInt(adults_count, 10) || 1) + (parseInt(children_count, 10) || 0);
      if (totalGuests > room.capacity) throw new Error(`Total guests (${totalGuests}) exceeds room capacity of ${room.capacity}`);

      const roomSubtotal = (parseFloat(room.price_per_night) || 0) * nightsCount;
      let servicesTotal  = 0;
      const servicesList: any[] = [];
      if (Array.isArray(service_ids) && service_ids.length > 0) {
        for (const sId of service_ids) {
          const svc = await queryOne<any>('SELECT * FROM hotel_services WHERE id = ? AND is_available = 1', [sId]);
          if (svc) {
            servicesTotal += parseFloat(svc.price) || 0;
            servicesList.push(svc);
          }
        }
      }

      const taxRow  = await queryOne<{ value: string }>("SELECT value FROM hotel_settings WHERE `key` = 'tax_rate'");
      const taxRate = taxRow ? parseFloat(taxRow.value) : 12.0;
      const subtotalBeforeTax = parseFloat((roomSubtotal + servicesTotal).toFixed(2));
      const taxAmount  = parseFloat(((subtotalBeforeTax * taxRate) / 100).toFixed(2));
      totalAmount      = parseFloat((subtotalBeforeTax + taxAmount).toFixed(2));

      const year    = new Date().getFullYear();
      bookingRef    = `AG-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      const paidAmount  = parseFloat(Number(initial_payment_amount).toFixed(2)) || 0;
      const payStatus   = paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'pending';

      const [bRes] = await conn.execute(`
        INSERT INTO bookings (booking_reference,customer_id,room_id,check_in_date,check_out_date,
          adults_count,children_count,nights_count,room_rate,services_total,tax_amount,discount_amount,
          total_amount,paid_amount,status,payment_status,special_requests)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,0.00,?,?,'confirmed',?,?)
      `, [bookingRef, customerId, room_id, check_in_date, check_out_date,
          adults_count, children_count, nightsCount, room.price_per_night,
          servicesTotal, taxAmount, totalAmount, paidAmount, payStatus, special_requests || null]) as any;
      createdBookingId = bRes.insertId;

      await conn.execute('INSERT INTO booking_guests (booking_id,full_name,email,phone,is_primary) VALUES (?,?,?,?,1)',
        [createdBookingId, primary_guest_name || req.user?.full_name || 'Primary Guest', primary_guest_email || req.user?.email || null, primary_guest_phone || null]);

      if (Array.isArray(additional_guests)) {
        for (const g of additional_guests) {
          if (g.full_name) await conn.execute('INSERT INTO booking_guests (booking_id,full_name,email,phone,is_primary) VALUES (?,?,?,?,0)', [createdBookingId, g.full_name, g.email || null, g.phone || null]);
        }
      }

      for (const svc of servicesList) {
        await conn.execute('INSERT INTO service_orders (booking_id,service_id,quantity,unit_price,total_price,status,ordered_by) VALUES (?,?,1,?,?,?,?)',
          [createdBookingId, svc.id, svc.price, svc.price, 'pending', req.user?.id || null]);
      }

      const invNum    = `INV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      const balanceDue= parseFloat((totalAmount - paidAmount).toFixed(2));
      const invStatus = balanceDue <= 0 ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'unpaid';

      const [invRes] = await conn.execute(`
        INSERT INTO invoices (invoice_number,booking_id,customer_id,subtotal,tax_amount,discount_amount,total_amount,paid_amount,balance_due,status,due_date)
        VALUES (?,?,?,?,?,0.00,?,?,?,?,?)
      `, [invNum, createdBookingId, customerId, subtotalBeforeTax, taxAmount, totalAmount, paidAmount, balanceDue, invStatus, check_out_date]) as any;
      const invoiceId = invRes.insertId;

      await conn.execute('INSERT INTO invoice_items (invoice_id,description,quantity,unit_price,total_price,item_type) VALUES (?,?,?,?,?,?)',
        [invoiceId, `${room.room_type_name} - Room #${room.room_number} (${nightsCount} Night${nightsCount > 1 ? 's' : ''} @ $${room.price_per_night})`, nightsCount, room.price_per_night, roomSubtotal, 'room_charge']);
      for (const svc of servicesList) {
        await conn.execute('INSERT INTO invoice_items (invoice_id,description,quantity,unit_price,total_price,item_type) VALUES (?,?,1,?,?,?)', [invoiceId, svc.name, svc.price, svc.price, 'service']);
      }
      await conn.execute('INSERT INTO invoice_items (invoice_id,description,quantity,unit_price,total_price,item_type) VALUES (?,?,1,?,?,?)',
        [invoiceId, `Occupancy & City Tourism Tax (${taxRate}%)`, taxAmount, taxAmount, 'tax']);

      if (paidAmount > 0) {
        const payRef = `PAY-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
        await conn.execute("INSERT INTO payments (booking_id,payment_reference,amount,payment_method,status,notes,recorded_by) VALUES (?,?,?,?,'completed','Initial booking deposit / prepayment',?)",
          [createdBookingId, payRef, paidAmount, payment_method, req.user?.id || null]);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (check_in_date === todayStr && room.status === 'available') {
        await conn.execute("UPDATE rooms SET status = 'reserved' WHERE id = ?", [room_id]);
      }

      await conn.execute("INSERT INTO notifications (user_id,title,message,type,link_url) VALUES (?,'Reservation Confirmed',?,'success','/customer/bookings')",
        [req.user?.id || customerId, `Your reservation #${bookingRef} for Room #${room.room_number} is confirmed! Check-in: ${check_in_date}`]);

      await conn.commit();
    } catch (err: any) {
      await conn.rollback();
      return res.status(409).json({ error: err.message || 'Failed to create booking' });
    } finally {
      conn.release();
    }

    logAudit(req.user?.id || null, req.user?.role || 'customer', 'BOOKING_CREATE', 'booking', createdBookingId, `Created booking ${bookingRef} for room ${room_id} ($${totalAmount})`);
    return res.status(201).json({ message: 'Booking confirmed successfully', booking_id: createdBookingId, booking_reference: bookingRef, total_amount: totalAmount });
  } catch (error: any) {
    console.error('createBooking error:', error);
    return res.status(500).json({ error: 'Failed to create booking reservation' });
  }
}

export async function checkInGuest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { assigned_room_id } = req.body;

    const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) return res.status(404).json({ error: 'Reservation not found' });
    if (booking.status === 'checked_in')  return res.status(400).json({ error: 'Guest already checked in' });
    if (booking.status === 'checked_out') return res.status(400).json({ error: 'Cannot check-in a completed checkout' });
    if (booking.status === 'cancelled')   return res.status(400).json({ error: 'Cannot check-in a cancelled reservation' });

    const roomIdToUse = assigned_room_id || booking.room_id;
    const room = await queryOne<any>('SELECT * FROM rooms WHERE id = ?', [roomIdToUse]);
    if (!room) return res.status(404).json({ error: 'Target room not found' });
    if (room.operational_status !== 'ready') return res.status(400).json({ error: `Room ${room.room_number} is '${room.operational_status}' and not ready for guests.` });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("UPDATE bookings SET status='checked_in',room_id=?,actual_check_in=NOW(),checked_in_by=? WHERE id=?", [roomIdToUse, req.user?.id || null, id]);
      await conn.execute("UPDATE rooms SET status='occupied',operational_status='ready' WHERE id=?", [roomIdToUse]);
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'receptionist', 'GUEST_CHECK_IN', 'booking', Number(id), `Checked in booking #${booking.booking_reference} into Room #${room.room_number}`);
    return res.json({ message: `Guest checked in to Room #${room.room_number}` });
  } catch (error: any) {
    console.error('checkInGuest error:', error);
    return res.status(500).json({ error: 'Failed to process check-in' });
  }
}

export async function checkOutGuest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const booking = await queryOne<any>('SELECT b.*,r.room_number,r.id as room_id FROM bookings b JOIN rooms r ON b.room_id=r.id WHERE b.id=?', [id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'checked_in') return res.status(400).json({ error: `Cannot check-out a booking with status '${booking.status}'` });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("UPDATE bookings SET status='checked_out',actual_check_out=NOW(),checked_out_by=? WHERE id=?", [req.user?.id || null, id]);
      await conn.execute("UPDATE rooms SET status='dirty',operational_status='needs_cleaning' WHERE id=?", [booking.room_id]);

      const today = new Date().toISOString().split('T')[0];
      await conn.execute("INSERT INTO housekeeping_tasks (room_id,task_type,priority,status,instructions,scheduled_for) VALUES (?,'standard_clean','urgent','pending','Checkout turnaround. Linen exchange, full bathroom sanitization, mini bar audit.',?)", [booking.room_id, today]);

      const invoice = await queryOne<any>('SELECT * FROM invoices WHERE booking_id = ?', [id]);
      if (invoice && invoice.balance_due <= 0) {
        await conn.execute("UPDATE invoices SET status='paid' WHERE id=?", [invoice.id]);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'receptionist', 'GUEST_CHECK_OUT', 'booking', Number(id), `Checked out booking #${booking.booking_reference}. Room #${booking.room_number} queued for housekeeping.`);
    return res.json({ message: `Check-out done for Room #${booking.room_number}. Room queued for housekeeping.` });
  } catch (error: any) {
    console.error('checkOutGuest error:', error);
    return res.status(500).json({ error: 'Failed to process check-out' });
  }
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) return res.status(404).json({ error: 'Reservation not found' });
    if (['checked_in','checked_out'].includes(booking.status)) return res.status(400).json({ error: `Cannot cancel a booking that is already ${booking.status}` });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("UPDATE bookings SET status='cancelled' WHERE id=?", [id]);
      const room = await queryOne<any>('SELECT status,operational_status FROM rooms WHERE id=?', [booking.room_id]);
      if (room && room.status === 'reserved' && room.operational_status === 'ready') {
        await conn.execute("UPDATE rooms SET status='available' WHERE id=?", [booking.room_id]);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'customer', 'BOOKING_CANCEL', 'booking', Number(id), `Cancelled booking #${booking.booking_reference}. Reason: ${reason || 'Customer request'}`);
    return res.json({ message: 'Reservation cancelled successfully' });
  } catch (error: any) {
    console.error('cancelBooking error:', error);
    return res.status(500).json({ error: 'Failed to cancel reservation' });
  }
}

export async function getArrivalsDepartures(_req: Request, res: Response) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [arrivals, departures] = await Promise.all([
      query(`SELECT b.*,c.full_name as customer_name,c.phone as customer_phone,r.room_number,r.status as room_status,r.operational_status,rt.name as room_type_name FROM bookings b JOIN customers c ON b.customer_id=c.id JOIN rooms r ON b.room_id=r.id JOIN room_types rt ON r.room_type_id=rt.id WHERE b.check_in_date=? AND b.status IN ('confirmed') ORDER BY r.room_number ASC`, [today]),
      query(`SELECT b.*,c.full_name as customer_name,c.phone as customer_phone,r.room_number,r.status as room_status,rt.name as room_type_name,inv.balance_due,inv.status as invoice_status FROM bookings b JOIN customers c ON b.customer_id=c.id JOIN rooms r ON b.room_id=r.id JOIN room_types rt ON r.room_type_id=rt.id LEFT JOIN invoices inv ON inv.booking_id=b.id WHERE b.check_out_date=? AND b.status='checked_in' ORDER BY r.room_number ASC`, [today]),
    ]);
    return res.json({ date: today, arrivals_count: arrivals.length, departures_count: departures.length, arrivals, departures });
  } catch (error: any) {
    console.error('getArrivalsDepartures error:', error);
    return res.status(500).json({ error: 'Failed to fetch arrivals and departures' });
  }
}
