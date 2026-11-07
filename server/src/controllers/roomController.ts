import { Request, Response } from 'express';
import { pool, query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getRoomTypes(req: Request, res: Response) {
  try {
    const types = await query('SELECT * FROM room_types ORDER BY base_price ASC');
    const result = types.map(t => {
      let gallery: any[] = [];
      try { gallery = t.gallery_urls ? JSON.parse(t.gallery_urls) : []; } catch { gallery = [t.image_url]; }
      return { ...t, gallery };
    });
    return res.json(result);
  } catch (error: any) {
    console.error('getRoomTypes error:', error);
    return res.status(500).json({ error: 'Failed to fetch room types' });
  }
}

export async function getRoomTypeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const type = await queryOne<any>('SELECT * FROM room_types WHERE id = ?', [id]);
    if (!type) return res.status(404).json({ error: 'Room type not found' });

    let gallery: any[] = [];
    try { gallery = type.gallery_urls ? JSON.parse(type.gallery_urls) : []; } catch { gallery = [type.image_url]; }

    const countRow = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM rooms WHERE room_type_id = ? AND is_active = 1', [id]);
    return res.json({ ...type, gallery, total_rooms: countRow?.count ?? 0 });
  } catch (error: any) {
    console.error('getRoomTypeById error:', error);
    return res.status(500).json({ error: 'Failed to fetch room type' });
  }
}

export async function getRooms(req: Request, res: Response) {
  try {
    const { floor, status, room_type_id, search } = req.query;
    let sql = `
      SELECT r.*, rt.name as room_type_name, rt.code as room_type_code,
             rt.capacity, rt.bed_type, rt.beds_count, rt.image_url as room_type_image
      FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.is_active = 1
    `;
    const params: any[] = [];
    if (floor)        { sql += ' AND r.floor_number = ?';                                                params.push(floor); }
    if (status)       { sql += ' AND r.status = ?';                                                      params.push(status); }
    if (room_type_id) { sql += ' AND r.room_type_id = ?';                                               params.push(room_type_id); }
    if (search)       { sql += ' AND (r.room_number LIKE ? OR rt.name LIKE ?)';                         params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY r.floor_number ASC, r.room_number ASC';

    const rooms = await query(sql, params);
    const result = await Promise.all(rooms.map(async room => ({
      ...room,
      amenities: await query(`SELECT a.* FROM amenities a JOIN room_amenities ra ON a.id = ra.amenity_id WHERE ra.room_id = ?`, [room.id]),
    })));
    return res.json(result);
  } catch (error: any) {
    console.error('getRooms error:', error);
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
}

export async function searchAvailableRooms(req: Request, res: Response) {
  try {
    const { check_in, check_out, guests = '1', room_type_id } = req.query;
    if (!check_in || !check_out) return res.status(400).json({ error: 'Check-in and check-out dates are required' });

    const checkInDate  = new Date(check_in as string);
    const checkOutDate = new Date(check_out as string);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD)' });
    if (checkOutDate <= checkInDate) return res.status(400).json({ error: 'Check-out date must be after check-in date' });

    const guestCount = parseInt(guests as string, 10) || 1;

    let sql = `
      SELECT r.*, rt.name as room_type_name, rt.code as room_type_code,
             rt.description as room_type_description, rt.capacity, rt.bed_type,
             rt.beds_count, rt.size_sqm, rt.image_url as room_type_image, rt.gallery_urls
      FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.is_active = 1
        AND r.operational_status = 'ready'
        AND rt.capacity >= ?
        AND r.id NOT IN (
          SELECT b.room_id FROM bookings b
          WHERE b.status IN ('confirmed','checked_in')
            AND b.check_in_date < ? AND b.check_out_date > ?
        )
    `;
    const params: any[] = [guestCount, check_out, check_in];
    if (room_type_id) { sql += ' AND r.room_type_id = ?'; params.push(room_type_id); }
    sql += ' ORDER BY r.price_per_night ASC, r.room_number ASC';

    const availableRooms = await query(sql, params);

    const diffMs = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;

    const taxRow = await queryOne<{ value: string }>("SELECT value FROM hotel_settings WHERE `key` = 'tax_rate'");
    const taxRate = taxRow ? parseFloat(taxRow.value) : 12.0;

    const result = availableRooms.map(room => {
      const roomTotal  = room.price_per_night * nights;
      const taxAmount  = (roomTotal * taxRate) / 100;
      const grandTotal = roomTotal + taxAmount;
      let gallery: any[] = [];
      try { gallery = room.gallery_urls ? JSON.parse(room.gallery_urls) : []; } catch { gallery = [room.room_type_image]; }
      return { ...room, nights, room_total: roomTotal, tax_amount: parseFloat(taxAmount.toFixed(2)), grand_total: parseFloat(grandTotal.toFixed(2)), gallery };
    });

    return res.json(result);
  } catch (error: any) {
    console.error('searchAvailableRooms error:', error);
    return res.status(500).json({ error: 'Failed to search available rooms' });
  }
}

export async function createRoom(req: AuthRequest, res: Response) {
  try {
    const { room_number, room_type_id, floor_number, price_per_night, notes, amenity_ids } = req.body;
    if (!room_number || !room_type_id || !floor_number || !price_per_night) return res.status(400).json({ error: 'Room number, type, floor, and price are required' });

    const existing = await queryOne('SELECT id FROM rooms WHERE room_number = ?', [room_number]);
    if (existing) return res.status(400).json({ error: `Room number ${room_number} already exists` });

    const conn = await pool.getConnection();
    let newRoomId: number;
    try {
      await conn.beginTransaction();
      const [r] = await conn.execute(
        "INSERT INTO rooms (room_number,room_type_id,floor_number,status,operational_status,price_per_night,notes) VALUES (?,?,?,'available','ready',?,?)",
        [room_number, room_type_id, floor_number, price_per_night, notes || null]
      ) as any;
      newRoomId = r.insertId;
      if (Array.isArray(amenity_ids) && amenity_ids.length > 0) {
        for (const aId of amenity_ids) {
          await conn.execute('INSERT INTO room_amenities (room_id,amenity_id) VALUES (?,?)', [newRoomId, aId]);
        }
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || null, 'ROOM_CREATE', 'room', newRoomId!, `Created room ${room_number}`);
    return res.status(201).json({ message: 'Room created successfully', id: newRoomId! });
  } catch (error: any) {
    console.error('createRoom error:', error);
    return res.status(500).json({ error: 'Failed to create room' });
  }
}

export async function updateRoom(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { room_number, room_type_id, floor_number, price_per_night, notes, status, operational_status } = req.body;

    const room = await queryOne('SELECT * FROM rooms WHERE id = ?', [id]);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    await execute(`
      UPDATE rooms SET
        room_number = COALESCE(?,room_number),
        room_type_id = COALESCE(?,room_type_id),
        floor_number = COALESCE(?,floor_number),
        price_per_night = COALESCE(?,price_per_night),
        notes = COALESCE(?,notes),
        status = COALESCE(?,status),
        operational_status = COALESCE(?,operational_status)
      WHERE id = ?
    `, [room_number, room_type_id, floor_number, price_per_night, notes, status, operational_status, id]);

    logAudit(req.user?.id || null, req.user?.role || null, 'ROOM_UPDATE', 'room', Number(id), `Updated room ${id}`);
    return res.json({ message: 'Room updated successfully' });
  } catch (error: any) {
    console.error('updateRoom error:', error);
    return res.status(500).json({ error: 'Failed to update room' });
  }
}

export async function updateRoomStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, operational_status } = req.body;

    const validStatuses = ['available','reserved','occupied','dirty','cleaning','maintenance','out_of_service'];
    if (status && !validStatuses.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });

    await execute(`
      UPDATE rooms SET
        status = COALESCE(?,status),
        operational_status = COALESCE(?,operational_status)
      WHERE id = ?
    `, [status, operational_status, id]);

    logAudit(req.user?.id || null, req.user?.role || null, 'ROOM_STATUS_CHANGE', 'room', Number(id), `Changed status to ${status || 'unchanged'} / ${operational_status || 'unchanged'}`);
    return res.json({ message: 'Room status updated successfully' });
  } catch (error: any) {
    console.error('updateRoomStatus error:', error);
    return res.status(500).json({ error: 'Failed to update room status' });
  }
}
