import { Response } from 'express';
import { pool, query, queryOne } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getInventory(req: AuthRequest, res: Response) {
  try {
    const { category, search, low_stock } = req.query;
    let sql = `
      SELECT i.*, 
        CASE WHEN i.quantity_on_hand <= i.reorder_level THEN 1 ELSE 0 END as is_low_stock
      FROM inventory i
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      sql += ' AND i.category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (i.name LIKE ? OR i.item_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (low_stock === 'true' || low_stock === '1') {
      sql += ' AND i.quantity_on_hand <= i.reorder_level';
    }

    sql += ' ORDER BY is_low_stock DESC, i.category ASC, i.name ASC';
    const items = await query(sql, params);
    return res.json(items);
  } catch (error: any) {
    console.error('getInventory error:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

export async function createInventoryItem(req: AuthRequest, res: Response) {
  try {
    const { item_code, name, category, unit = 'pieces', quantity_on_hand = 0, reorder_level = 10, unit_cost = 0, currency = 'ETB', storage_location } = req.body;
    if (!item_code || !name || !category) {
      return res.status(400).json({ error: 'Item code, name, and category are required' });
    }

    const existing = await queryOne('SELECT id FROM inventory WHERE item_code = ?', [item_code]);
    if (existing) {
      return res.status(400).json({ error: 'Item with this item code already exists' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result]: any = await conn.execute(
        `INSERT INTO inventory (item_code, name, category, unit, quantity_on_hand, reorder_level, unit_cost, currency, storage_location, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [item_code, name, category, unit, quantity_on_hand, reorder_level, unit_cost, currency, storage_location || 'Central Store']
      );

      const newItemId = result.insertId;

      if (Number(quantity_on_hand) > 0) {
        await conn.execute(
          `INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity, unit_price, total_cost, notes, recorded_by)
           VALUES (?, 'purchase_in', ?, ?, ?, 'Initial inventory stock registration', ?)`,
          [newItemId, quantity_on_hand, unit_cost, Number(quantity_on_hand) * Number(unit_cost), req.user?.id || null]
        );
      }

      await conn.commit();
      logAudit(req.user?.id || null, req.user?.role || 'admin', 'INVENTORY_CREATE', 'inventory', newItemId, `Created inventory item ${item_code} - ${name}`);
      return res.status(201).json({ message: 'Inventory item created successfully', id: newItemId });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error: any) {
    console.error('createInventoryItem error:', error);
    return res.status(500).json({ error: 'Failed to create inventory item' });
  }
}

export async function getInventoryTransactions(req: AuthRequest, res: Response) {
  try {
    const { inventory_id, type } = req.query;
    let sql = `
      SELECT t.*, i.name as item_name, i.item_code, i.unit, u.full_name as recorded_by_name, d.name as department_name
      FROM inventory_transactions t
      JOIN inventory i ON t.inventory_id = i.id
      LEFT JOIN users u ON t.recorded_by = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (inventory_id) {
      sql += ' AND t.inventory_id = ?';
      params.push(inventory_id);
    }
    if (type) {
      sql += ' AND t.transaction_type = ?';
      params.push(type);
    }
    sql += ' ORDER BY t.created_at DESC LIMIT 100';

    const txs = await query(sql, params);
    return res.json(txs);
  } catch (error: any) {
    console.error('getInventoryTransactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory transactions' });
  }
}

export async function recordInventoryTransaction(req: AuthRequest, res: Response) {
  try {
    const { inventory_id, transaction_type, quantity, unit_price, department_id, reference_type, reference_id, notes } = req.body;
    if (!inventory_id || !transaction_type || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({ error: 'Inventory ID, transaction type, and valid quantity (> 0) required' });
    }

    const item = await queryOne<any>('SELECT * FROM inventory WHERE id = ?', [inventory_id]);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    const qty = parseFloat(Number(quantity).toFixed(2));
    const price = unit_price !== undefined ? parseFloat(Number(unit_price).toFixed(2)) : parseFloat(Number(item.unit_cost).toFixed(2));
    const totalCost = parseFloat((qty * price).toFixed(2));

    const isAddition = transaction_type === 'purchase_in' || transaction_type === 'return_in';
    const newQty = isAddition ? (Number(item.quantity_on_hand) + qty) : (Number(item.quantity_on_hand) - qty);

    if (!isAddition && newQty < 0) {
      return res.status(400).json({ error: `Insufficient stock on hand (${item.quantity_on_hand} ${item.unit} available)` });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        `INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity, unit_price, total_cost, department_id, reference_type, reference_id, notes, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [inventory_id, transaction_type, qty, price, totalCost, department_id || null, reference_type || null, reference_id || null, notes || null, req.user?.id || null]
      );

      await conn.execute('UPDATE inventory SET quantity_on_hand = ? WHERE id = ?', [newQty, inventory_id]);

      await conn.commit();
      logAudit(req.user?.id || null, req.user?.role || 'admin', 'INVENTORY_TX', 'inventory', Number(inventory_id), `${transaction_type}: ${qty} ${item.unit} of ${item.name}`);
      return res.json({ message: 'Inventory transaction logged successfully', new_quantity: newQty });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error: any) {
    console.error('recordInventoryTransaction error:', error);
    return res.status(500).json({ error: 'Failed to record inventory transaction' });
  }
}

