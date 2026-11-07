import { Request, Response } from 'express';
import { pool, query, queryOne } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getMaintenanceRequests(req: Request, res: Response) {
  try {
    const { status, priority, room_id } = req.query;
    let sql = `
      SELECT mr.*,
             r.room_number, r.floor_number, r.status as room_status,
             reporter.full_name as reported_by_name,
             tech_user.full_name as technician_name
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.id
      JOIN users reporter ON mr.reported_by = reporter.id
      LEFT JOIN employees tech_emp ON mr.technician_id = tech_emp.id
      LEFT JOIN users tech_user ON tech_emp.user_id = tech_user.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status)  { sql += ' AND mr.status = ?';   params.push(status); }
    if (priority){ sql += ' AND mr.priority = ?';  params.push(priority); }
    if (room_id) { sql += ' AND mr.room_id = ?';   params.push(room_id); }

    sql += ` ORDER BY FIELD(mr.priority,'critical','high','medium','low'), mr.reported_at DESC`;

    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getMaintenanceRequests error:', error);
    return res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
}

export async function createMaintenanceRequest(req: AuthRequest, res: Response) {
  try {
    const { room_id, issue_title, description, priority = 'medium', estimated_cost = 0, technician_id } = req.body;
    if (!room_id || !issue_title || !description) return res.status(400).json({ error: 'Room ID, issue title, and description are required' });

    const conn = await pool.getConnection();
    let newId: number;
    try {
      await conn.beginTransaction();
      const [r] = await conn.execute(
        "INSERT INTO maintenance_requests (room_id,reported_by,technician_id,issue_title,description,priority,status,estimated_cost) VALUES (?,?,?,?,?,?,'reported',?)",
        [room_id, req.user?.id || 1, technician_id || null, issue_title, description, priority, estimated_cost]
      ) as any;
      newId = r.insertId;

      await conn.execute("UPDATE rooms SET status='maintenance',operational_status='under_repair' WHERE id=?", [room_id]);

      const mgr = await queryOne<any>("SELECT id FROM users WHERE role='manager' LIMIT 1");
      if (mgr) {
        await conn.execute("INSERT INTO notifications (user_id,title,message,type,link_url) VALUES (?,'New Maintenance Alert',?,'warning','/manager/maintenance')",
          [mgr.id, `Room #${room_id} reported: ${issue_title} (${priority} priority)`]);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'staff', 'MAINTENANCE_REPORT', 'maintenance_request', newId!, `Reported: '${issue_title}' for room ${room_id}`);
    return res.status(201).json({ message: 'Maintenance request logged successfully', id: newId! });
  } catch (error: any) {
    console.error('createMaintenanceRequest error:', error);
    return res.status(500).json({ error: 'Failed to create maintenance request' });
  }
}

export async function updateMaintenanceRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, technician_id, actual_cost, resolution_notes } = req.body;

    const request = await queryOne<any>('SELECT * FROM maintenance_requests WHERE id = ?', [id]);
    if (!request) return res.status(404).json({ error: 'Maintenance request not found' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const fields: string[] = [];
      const params: any[] = [];
      let dbStatus = status;
      if (status === 'pending') dbStatus = 'reported';
      if (status === 'closed') dbStatus = 'resolved';

      if (dbStatus !== undefined)         { fields.push('status = ?');            params.push(dbStatus); }
      if (technician_id !== undefined)    { fields.push('technician_id = ?');     params.push(technician_id); }
      if (actual_cost !== undefined)      { fields.push('actual_cost = ?');       params.push(actual_cost); }
      if (resolution_notes !== undefined) { fields.push('resolution_notes = ?'); params.push(resolution_notes); }

      if (status === 'resolved' || status === 'closed') {
        fields.push('resolved_at = NOW()');
        await conn.execute("UPDATE rooms SET status='available',operational_status='ready' WHERE id=? AND status='maintenance'", [request.room_id]);
      } else if (status === 'in_progress' || status === 'assigned' || status === 'waiting_parts') {
        await conn.execute("UPDATE rooms SET operational_status='under_repair' WHERE id=?", [request.room_id]);
      }

      if (fields.length > 0) {
        params.push(id);
        await conn.execute(`UPDATE maintenance_requests SET ${fields.join(', ')} WHERE id=?`, params);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'staff', 'MAINTENANCE_UPDATE', 'maintenance_request', Number(id), `Updated maintenance request #${id} to status: ${status || 'unchanged'}`);
    return res.json({ message: 'Maintenance request updated successfully' });
  } catch (error: any) {
    console.error('updateMaintenanceRequest error:', error);
    return res.status(500).json({ error: 'Failed to update maintenance request' });
  }
}
