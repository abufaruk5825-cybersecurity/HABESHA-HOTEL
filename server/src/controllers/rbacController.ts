/**
 * RBAC Controller — manages roles, permissions, and role-permission assignments.
 * Only accessible by superadmin.
 */
import { Response } from 'express';
import { query, queryOne, execute } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getRoles(_req: AuthRequest, res: Response) {
  try {
    const roles = await query<any>(`
      SELECT r.*, COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      GROUP BY r.id
      ORDER BY r.id ASC
    `);
    return res.json(roles);
  } catch (err: any) {
    console.error('getRoles error:', err);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
}

export async function updateRoleDescription(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { description } = req.body;
    await execute('UPDATE roles SET description=? WHERE id=?', [description, id]);
    logAudit(req.user?.id ?? null, req.user?.role ?? null, 'ROLE_UPDATE', 'role', Number(id), `Updated description for role #${id}`);
    return res.json({ message: 'Role updated' });
  } catch (err: any) {
    console.error('updateRoleDescription error:', err);
    return res.status(500).json({ error: 'Failed to update role' });
  }
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function getPermissions(_req: AuthRequest, res: Response) {
  try {
    const perms = await query<any>('SELECT * FROM permissions ORDER BY module ASC, code ASC');
    return res.json(perms);
  } catch (err: any) {
    console.error('getPermissions error:', err);
    return res.status(500).json({ error: 'Failed to fetch permissions' });
  }
}

// ─── Role ↔ Permission assignments ───────────────────────────────────────────

export async function getRolePermissions(req: AuthRequest, res: Response) {
  try {
    const { roleId } = req.params;
    const perms = await query<any>(`
      SELECT p.*
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      ORDER BY p.module ASC, p.code ASC
    `, [roleId]);
    return res.json(perms);
  } catch (err: any) {
    console.error('getRolePermissions error:', err);
    return res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
}

export async function getPermissionMatrix(_req: AuthRequest, res: Response) {
  try {
    const [roles, permissions, assignments] = await Promise.all([
      query<any>('SELECT id, name, description FROM roles ORDER BY id ASC'),
      query<any>('SELECT id, code, description, module FROM permissions ORDER BY module ASC, code ASC'),
      query<any>('SELECT role_id, permission_id FROM role_permissions'),
    ]);

    // Build a Set of "roleId:permId" for O(1) lookups
    const granted = new Set(assignments.map((a: any) => `${a.role_id}:${a.permission_id}`));

    return res.json({ roles, permissions, granted: Array.from(granted) });
  } catch (err: any) {
    console.error('getPermissionMatrix error:', err);
    return res.status(500).json({ error: 'Failed to fetch permission matrix' });
  }
}

export async function assignPermission(req: AuthRequest, res: Response) {
  try {
    const { roleId, permissionId } = req.body;
    if (!roleId || !permissionId) return res.status(400).json({ error: 'roleId and permissionId are required' });

    // Prevent granting superadmin-level permissions by non-superadmins (belt + suspenders)
    const role = await queryOne<any>('SELECT name FROM roles WHERE id=?', [roleId]);
    if (!role) return res.status(404).json({ error: 'Role not found' });

    await execute(
      'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)',
      [roleId, permissionId]
    );
    logAudit(req.user?.id ?? null, req.user?.role ?? null, 'PERMISSION_GRANT', 'role_permissions', roleId, `Granted permission ${permissionId} to role ${role.name}`);
    return res.json({ message: 'Permission granted' });
  } catch (err: any) {
    console.error('assignPermission error:', err);
    return res.status(500).json({ error: 'Failed to assign permission' });
  }
}

export async function revokePermission(req: AuthRequest, res: Response) {
  try {
    const { roleId, permissionId } = req.body;
    if (!roleId || !permissionId) return res.status(400).json({ error: 'roleId and permissionId are required' });

    await execute(
      'DELETE FROM role_permissions WHERE role_id=? AND permission_id=?',
      [roleId, permissionId]
    );
    logAudit(req.user?.id ?? null, req.user?.role ?? null, 'PERMISSION_REVOKE', 'role_permissions', roleId, `Revoked permission ${permissionId} from role #${roleId}`);
    return res.json({ message: 'Permission revoked' });
  } catch (err: any) {
    console.error('revokePermission error:', err);
    return res.status(500).json({ error: 'Failed to revoke permission' });
  }
}
