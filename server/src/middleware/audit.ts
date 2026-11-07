import { pool } from '../db/database.ts';

export function logAudit(
  userId: number | null,
  userRole: string | null,
  action: string,
  entityType: string,
  entityId: number | null,
  details: string,
  ipAddress?: string,
  status: string = 'success'
) {
  // Fire-and-forget — never await in request path
  pool.execute(
    'INSERT INTO audit_logs (user_id,user_role,action,entity_type,entity_id,details,ip_address,status) VALUES (?,?,?,?,?,?,?,?)',
    [userId, userRole, action, entityType, entityId, details, ipAddress || '127.0.0.1', status || 'success']
  ).catch(err => console.error('Audit logging error:', err));
}
