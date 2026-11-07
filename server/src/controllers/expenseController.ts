import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { query, queryOne, execute } from '../db/database.ts';
import { logAudit } from '../middleware/audit.ts';

export async function getExpenses(req: AuthRequest, res: Response) {
  try {
    const { category, startDate, endDate, search } = req.query;
    let sql = `
      SELECT e.*, u.full_name as recorded_by_name
      FROM expenses e
      LEFT JOIN users u ON e.recorded_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND e.category = ?';
      params.push(category);
    }
    if (startDate) {
      sql += ' AND e.expense_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND e.expense_date <= ?';
      params.push(endDate);
    }
    if (search) {
      sql += ' AND (e.title LIKE ? OR e.reference_number LIKE ? OR e.notes LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY e.expense_date DESC, e.id DESC';

    const expenses = await query(sql, params);
    return res.json(expenses);
  } catch (error: any) {
    console.error('getExpenses error:', error);
    return res.status(500).json({ error: 'Failed to retrieve expenses' });
  }
}

export async function createExpense(req: AuthRequest, res: Response) {
  try {
    const { category, title, amount, payment_method, reference_number, expense_date, notes } = req.body;
    if (!title || !amount || !expense_date) {
      return res.status(400).json({ error: 'Title, amount, and expense date are required' });
    }

    const recordedBy = req.user?.id || null;
    const result = await execute(
      'INSERT INTO expenses (category, title, amount, currency, payment_method, reference_number, expense_date, recorded_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        category || 'other',
        title,
        Number(amount),
        'ETB',
        payment_method || 'bank_transfer',
        reference_number || null,
        expense_date,
        recordedBy,
        notes || null
      ]
    );

    if (req.user) {
      logAudit(req.user.id, req.user.role, 'CREATE_EXPENSE', 'expense', result.insertId, `Recorded expense of ${amount} ETB: ${title}`);
    }

    return res.status(201).json({
      message: 'Expense recorded successfully',
      id: result.insertId,
    });
  } catch (error: any) {
    console.error('createExpense error:', error);
    return res.status(500).json({ error: 'Failed to record expense' });
  }
}

export async function getFinancialSummary(req: AuthRequest, res: Response) {
  try {
    // Total income from completed payments
    const incomeRow = await queryOne<{ total_revenue: number; count: number }>(
      "SELECT COALESCE(SUM(amount), 0) as total_revenue, COUNT(*) as count FROM payments WHERE status = 'completed'"
    );
    const totalIncome = Number(incomeRow?.total_revenue || 0);

    // Total expenses
    const expenseRow = await queryOne<{ total_expense: number; count: number }>(
      "SELECT COALESCE(SUM(amount), 0) as total_expense, COUNT(*) as count FROM expenses"
    );
    const totalExpenses = Number(expenseRow?.total_expense || 0);

    // Expenses by category
    const categoryBreakdown = await query<{ category: string; total: number; count: number }[]>(
      "SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses GROUP BY category ORDER BY total DESC"
    );

    // Income by payment method (Telebirr, CBE Birr, Bank Transfer, Cash)
    const paymentMethodBreakdown = await query<{ payment_method: string; total: number; count: number }[]>(
      "SELECT payment_method, SUM(amount) as total, COUNT(*) as count FROM payments WHERE status = 'completed' GROUP BY payment_method ORDER BY total DESC"
    );

    // Outstanding invoices
    const invoiceRow = await queryOne<{ total_due: number; count: number }>(
      "SELECT COALESCE(SUM(balance_due), 0) as total_due, COUNT(*) as count FROM invoices WHERE status IN ('unpaid', 'partially_paid')"
    );
    const outstandingInvoices = Number(invoiceRow?.total_due || 0);

    return res.json({
      currency: 'ETB',
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      outstandingInvoices,
      categoryBreakdown,
      paymentMethodBreakdown,
    });
  } catch (error: any) {
    console.error('getFinancialSummary error:', error);
    return res.status(500).json({ error: 'Failed to retrieve financial summary' });
  }
}

