import { Request, Response } from 'express';
import { pool, query, queryOne } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getHousekeepingTasks(req: AuthRequest, res: Response) {
  try {
    const { status, priority, employee_id, room_id } = req.query;
    let sql = `
      SELECT ht.*,
             r.room_number, r.floor_number, r.status as room_status, r.operational_status,
             rt.name as room_type_name,
             u.full_name as assigned_employee_name
      FROM housekeeping_tasks ht
      JOIN rooms r ON ht.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN employees e ON ht.assigned_employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employee_id) { sql += ' AND ht.assigned_employee_id = ?'; params.push(employee_id); }
    if (status)      { sql += ' AND ht.status = ?';                params.push(status); }
    if (priority)    { sql += ' AND ht.priority = ?';              params.push(priority); }
    if (room_id)     { sql += ' AND ht.room_id = ?';               params.push(room_id); }

    sql += ` ORDER BY FIELD(ht.priority,'urgent','high','medium','low'), ht.created_at DESC`;

    return res.json(await query(sql, params));
  } catch (error: any) {
    console.error('getHousekeepingTasks error:', error);
    return res.status(500).json({ error: 'Failed to fetch housekeeping tasks' });
  }
}

export async function createHousekeepingTask(req: AuthRequest, res: Response) {
  try {
    const { room_id, assigned_employee_id, task_type = 'standard_clean', priority = 'medium', instructions, scheduled_for } = req.body;
    if (!room_id) return res.status(400).json({ error: 'Room ID is required' });

    const today = scheduled_for || new Date().toISOString().split('T')[0];
    const conn  = await pool.getConnection();
    let newId: number;
    try {
      await conn.beginTransaction();
      const [r] = await conn.execute(
        "INSERT INTO housekeeping_tasks (room_id,assigned_employee_id,task_type,priority,status,instructions,scheduled_for) VALUES (?,?,?,?,'pending',?,?)",
        [room_id, assigned_employee_id || null, task_type, priority, instructions || null, today]
      ) as any;
      newId = r.insertId;

      const room = await queryOne<any>('SELECT status FROM rooms WHERE id = ?', [room_id]);
      if (room && room.status !== 'occupied') {
        await conn.execute("UPDATE rooms SET status='dirty',operational_status='needs_cleaning' WHERE id=?", [room_id]);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'staff', 'HOUSEKEEPING_TASK_CREATE', 'housekeeping_task', newId!, `Created ${priority} ${task_type} for room ${room_id}`);
    return res.status(201).json({ message: 'Housekeeping task created successfully', id: newId! });
  } catch (error: any) {
    console.error('createHousekeepingTask error:', error);
    return res.status(500).json({ error: 'Failed to create housekeeping task' });
  }
}

export async function updateTaskStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending','in_progress','completed','verified'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });

    const task = await queryOne<any>('SELECT * FROM housekeeping_tasks WHERE id = ?', [id]);
    if (!task) return res.status(404).json({ error: 'Housekeeping task not found' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (status === 'in_progress') {
        await conn.execute('UPDATE housekeeping_tasks SET status=?,started_at=NOW() WHERE id=?', [status, id]);
        await conn.execute("UPDATE rooms SET status='cleaning',operational_status='cleaning_in_progress' WHERE id=? AND status!='occupied'", [task.room_id]);
      } else if (status === 'completed' || status === 'verified') {
        await conn.execute('UPDATE housekeeping_tasks SET status=?,completed_at=NOW() WHERE id=?', [status, id]);
        await conn.execute("UPDATE rooms SET status='available',operational_status='ready' WHERE id=? AND status!='occupied'", [task.room_id]);
      } else {
        await conn.execute('UPDATE housekeeping_tasks SET status=? WHERE id=?', [status, id]);
      }
      await conn.commit();
    } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }

    logAudit(req.user?.id || null, req.user?.role || 'housekeeper', 'HOUSEKEEPING_STATUS_CHANGE', 'housekeeping_task', Number(id), `Updated task #${id} to '${status}'`);
    return res.json({ message: `Task status updated to ${status}` });
  } catch (error: any) {
    console.error('updateTaskStatus error:', error);
    return res.status(500).json({ error: 'Failed to update task status' });
  }
}

export async function getHousekeepingRoomsOverview(_req: Request, res: Response) {
  try {
    const [rooms, cleanCount, dirtyCount, cleaningCount, maintenanceCount] = await Promise.all([
      query(`
        SELECT r.id,r.room_number,r.floor_number,r.status,r.operational_status,
               rt.name as room_type_name,
               ht.id as active_task_id,ht.task_type,ht.priority as task_priority,ht.status as task_status,
               u.full_name as assigned_to
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        LEFT JOIN housekeeping_tasks ht ON r.id=ht.room_id AND ht.status IN ('pending','in_progress')
        LEFT JOIN employees e ON ht.assigned_employee_id = e.id
        LEFT JOIN users u ON e.user_id = u.id
        WHERE r.is_active = 1
        ORDER BY r.floor_number ASC, r.room_number ASC
      `),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE operational_status='ready' AND is_active=1"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status='dirty' OR operational_status='needs_cleaning'"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status='cleaning' OR operational_status='cleaning_in_progress'"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status='maintenance' OR operational_status='under_repair'"),
    ]);

    return res.json({
      summary: { clean: cleanCount?.count ?? 0, dirty: dirtyCount?.count ?? 0, cleaning: cleaningCount?.count ?? 0, maintenance: maintenanceCount?.count ?? 0 },
      rooms,
    });
  } catch (error: any) {
    console.error('getHousekeepingRoomsOverview error:', error);
    return res.status(500).json({ error: 'Failed to fetch housekeeping overview' });
  }
}
