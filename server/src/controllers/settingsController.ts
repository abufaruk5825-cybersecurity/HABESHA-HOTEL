import { Request, Response } from 'express';
import { pool, query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getHotelSettings(_req: Request, res: Response) {
  try {
    const settings = await query<{ key: string; value: string }>('SELECT * FROM hotel_settings');
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => { settingsMap[s.key] = s.value; });
    return res.json({ settings_list: settings, settings: settingsMap });
  } catch (error: any) {
    console.error('getHotelSettings error:', error);
    return res.status(500).json({ error: 'Failed to fetch hotel settings' });
  }
}

export async function updateHotelSettings(req: AuthRequest, res: Response) {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'Settings update object required' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(updates)) {
        await conn.execute(
          'INSERT INTO hotel_settings (`key`,value,label,category) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)',
          [key, String(value), key.replace(/_/g, ' ').toUpperCase(), 'general']
        );
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || null, 'SETTINGS_UPDATE', 'hotel_settings', null, 'Updated system configuration settings');
    return res.json({ message: 'Hotel settings updated successfully' });
  } catch (error: any) {
    console.error('updateHotelSettings error:', error);
    return res.status(500).json({ error: 'Failed to update hotel settings' });
  }
}

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json([]);

    const [notifs, unreadRow] = await Promise.all([
      query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 20', [userId]),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM notifications WHERE user_id=? AND is_read=0', [userId]),
    ]);

    return res.json({ unread_count: unreadRow?.count ?? 0, notifications: notifs });
  } catch (error: any) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (id === 'all') {
      await execute('UPDATE notifications SET is_read=1 WHERE user_id=?', [userId]);
    } else {
      await execute('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [id, userId]);
    }

    return res.json({ message: 'Marked as read' });
  } catch (error: any) {
    console.error('markNotificationRead error:', error);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const { limit = 100, action, entity_type, role, search, start_date, end_date } = req.query;
    let sql = `
      SELECT al.id, al.user_id, al.user_role, al.action, al.entity_type, al.entity_id, al.details, al.ip_address,
             COALESCE(al.status, 'success') as status, al.created_at,
             u.full_name as user_name, u.email as user_email
      FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (action) {
      sql += ' AND (al.action = ? OR al.action LIKE ?)';
      params.push(action, `%${action}%`);
    }
    if (entity_type) { sql += ' AND al.entity_type = ?'; params.push(entity_type); }
    if (role)        { sql += ' AND al.user_role = ?';   params.push(role); }
    if (start_date)  { sql += ' AND al.created_at >= ?'; params.push(`${start_date} 00:00:00`); }
    if (end_date)    { sql += ' AND al.created_at <= ?'; params.push(`${end_date} 23:59:59`); }
    if (search) {
      sql += ' AND (al.details LIKE ? OR al.action LIKE ? OR al.entity_type LIKE ? OR u.full_name LIKE ? OR al.ip_address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const safeLimit = Math.min(500, Math.max(1, parseInt(String(limit), 10) || 100));
    sql += ` ORDER BY al.created_at DESC LIMIT ${safeLimit}`;

    const logs = await query(sql, params);
    return res.json(logs);
  } catch (error: any) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}
