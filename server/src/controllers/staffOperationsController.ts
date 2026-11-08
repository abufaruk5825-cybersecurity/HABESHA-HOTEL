import { Request, Response } from 'express';
import { pool, query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getShifts(_req: Request, res: Response) {
  try {
    const shifts = await query('SELECT * FROM shifts ORDER BY start_time ASC');
    return res.json(shifts);
  } catch (error: any) {
    console.error('getShifts error:', error);
    return res.status(500).json({ error: 'Failed to fetch shifts' });
  }
}

export async function getStaffSchedules(req: AuthRequest, res: Response) {
  try {
    const { department_id, employee_id, start_date, end_date, status } = req.query;
    let sql = `
      SELECT s.*, e.employee_code, e.position, u.full_name as employee_name, u.avatar_url,
             d.name as department_name, sh.name as shift_name, sh.code as shift_code,
             sh.start_time, sh.end_time
      FROM staff_schedules s
      JOIN employees e ON s.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      JOIN shifts sh ON s.shift_id = sh.id
      LEFT JOIN departments d ON s.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (department_id) { sql += ' AND s.department_id = ?'; params.push(department_id); }
    if (employee_id)   { sql += ' AND s.employee_id = ?'; params.push(employee_id); }
    if (status)        { sql += ' AND s.status = ?'; params.push(status); }
    if (start_date)    { sql += ' AND s.work_date >= ?'; params.push(start_date); }
    if (end_date)      { sql += ' AND s.work_date <= ?'; params.push(end_date); }

    sql += ' ORDER BY s.work_date ASC, sh.start_time ASC';
    const schedules = await query(sql, params);
    return res.json(schedules);
  } catch (error: any) {
    console.error('getStaffSchedules error:', error);
    return res.status(500).json({ error: 'Failed to fetch staff schedules' });
  }
}

export async function createStaffSchedule(req: AuthRequest, res: Response) {
  try {
    const { employee_id, shift_id, department_id, work_date, notes } = req.body;
    if (!employee_id || !shift_id || !work_date) {
      return res.status(400).json({ error: 'Employee ID, shift ID, and work date are required' });
    }

    const r = await execute(
      `INSERT INTO staff_schedules (employee_id, shift_id, department_id, work_date, status, notes)
       VALUES (?, ?, ?, ?, 'scheduled', ?)
       ON DUPLICATE KEY UPDATE shift_id=VALUES(shift_id), department_id=VALUES(department_id), notes=VALUES(notes)`,
      [employee_id, shift_id, department_id || null, work_date, notes || null]
    );

    logAudit(req.user?.id || null, req.user?.role || 'manager', 'STAFF_SCHEDULE', 'staff_schedules', r.insertId || null, `Scheduled employee #${employee_id} for shift #${shift_id} on ${work_date}`);
    return res.status(201).json({ message: 'Staff schedule saved successfully' });
  } catch (error: any) {
    console.error('createStaffSchedule error:', error);
    return res.status(500).json({ error: 'Failed to save staff schedule' });
  }
}

export async function getStaffAttendance(req: AuthRequest, res: Response) {
  try {
    const { date, employee_id, status } = req.query;
    let sql = `
      SELECT a.*, e.employee_code, e.position, u.full_name as employee_name, u.avatar_url,
             d.name as department_name, sh.name as shift_name
      FROM staff_attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN staff_schedules sc ON a.schedule_id = sc.id
      LEFT JOIN shifts sh ON sc.shift_id = sh.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (date)        { sql += ' AND a.attendance_date = ?'; params.push(date); }
    if (employee_id) { sql += ' AND a.employee_id = ?'; params.push(employee_id); }
    if (status)      { sql += ' AND a.status = ?'; params.push(status); }

    sql += ' ORDER BY a.attendance_date DESC, a.clock_in ASC';
    const attendance = await query(sql, params);
    return res.json(attendance);
  } catch (error: any) {
    console.error('getStaffAttendance error:', error);
    return res.status(500).json({ error: 'Failed to fetch staff attendance' });
  }
}

export async function recordStaffAttendance(req: AuthRequest, res: Response) {
  try {
    const { employee_id, attendance_date, clock_in, clock_out, total_hours, status = 'present', notes } = req.body;
    if (!employee_id || !attendance_date) {
      return res.status(400).json({ error: 'Employee ID and attendance date are required' });
    }

    const r = await execute(
      `INSERT INTO staff_attendance (employee_id, attendance_date, clock_in, clock_out, total_hours, status, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE clock_out=VALUES(clock_out), total_hours=VALUES(total_hours), status=VALUES(status), notes=VALUES(notes)`,
      [employee_id, attendance_date, clock_in || null, clock_out || null, total_hours || 0, status, notes || null, req.user?.id || null]
    );

    logAudit(req.user?.id || null, req.user?.role || 'manager', 'STAFF_ATTENDANCE', 'staff_attendance', r.insertId || null, `Logged attendance for employee #${employee_id} on ${attendance_date}: ${status}`);
    return res.json({ message: 'Attendance recorded successfully' });
  } catch (error: any) {
    console.error('recordStaffAttendance error:', error);
    return res.status(500).json({ error: 'Failed to record attendance' });
  }
}

