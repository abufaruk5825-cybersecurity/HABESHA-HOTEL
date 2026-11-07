import { Request, Response } from 'express';
import { query, queryOne } from '../db/database.ts';

export async function getReportOverview(_req: Request, res: Response) {
  try {
    const [
      totalRooms, availableRooms, occupiedRooms, reservedRooms, dirtyRooms, maintenanceRooms,
      revenueRes, outstandingRes,
      totalBookings, activeBookings, completedBookings, cancelledBookings,
      totalCustomers, totalEmployees,
      adrRes, recentActivities, recentPayments,
    ] = await Promise.all([
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM rooms WHERE is_active=1'),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status='available' AND is_active=1"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status='occupied' AND is_active=1"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status='reserved' AND is_active=1"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status IN ('dirty','cleaning') AND is_active=1"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rooms WHERE status IN ('maintenance','out_of_service') AND is_active=1"),
      queryOne<{ total: number }>("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='completed'"),
      queryOne<{ total: number }>("SELECT COALESCE(SUM(balance_due),0) as total FROM invoices WHERE status!='cancelled'"),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM bookings'),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM bookings WHERE status IN ('confirmed','checked_in')"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM bookings WHERE status='checked_out'"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM bookings WHERE status='cancelled'"),
      queryOne<{ count: number }>('SELECT COUNT(*) as count FROM customers'),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM employees WHERE status='active'"),
      queryOne<{ avg_rate: number }>("SELECT COALESCE(AVG(room_rate),0) as avg_rate FROM bookings WHERE status IN ('confirmed','checked_in','checked_out')"),
      query(`SELECT al.*,u.full_name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id=u.id ORDER BY al.created_at DESC LIMIT 8`),
      query(`SELECT p.*,b.booking_reference,c.full_name as customer_name FROM payments p JOIN bookings b ON p.booking_id=b.id JOIN customers c ON b.customer_id=c.id ORDER BY p.created_at DESC LIMIT 6`),
    ]);

    const total        = totalRooms?.count   ?? 0;
    const occupied     = occupiedRooms?.count ?? 0;
    const reserved     = reservedRooms?.count ?? 0;
    const occupancyRate= total > 0 ? ((occupied + reserved) / total) * 100 : 0;
    const adr          = adrRes?.avg_rate ?? 0;
    const revpar       = (adr * occupancyRate) / 100;

    return res.json({
      revenue: {
        total_revenue:       parseFloat((revenueRes?.total ?? 0).toFixed(2)),
        outstanding_balance: parseFloat((outstandingRes?.total ?? 0).toFixed(2)),
        adr:                 parseFloat(adr.toFixed(2)),
        revpar:              parseFloat(revpar.toFixed(2)),
      },
      rooms: {
        total,
        available:       availableRooms?.count   ?? 0,
        occupied,
        reserved,
        dirty:           dirtyRooms?.count        ?? 0,
        maintenance:     maintenanceRooms?.count  ?? 0,
        occupancy_rate:  parseFloat(occupancyRate.toFixed(1)),
      },
      bookings: {
        total:     totalBookings?.count     ?? 0,
        active:    activeBookings?.count    ?? 0,
        completed: completedBookings?.count ?? 0,
        cancelled: cancelledBookings?.count ?? 0,
      },
      people: {
        customers: totalCustomers?.count ?? 0,
        employees: totalEmployees?.count ?? 0,
      },
      recent_activities: recentActivities,
      recent_payments:   recentPayments,
    });
  } catch (error: any) {
    console.error('getReportOverview error:', error);
    return res.status(500).json({ error: 'Failed to generate operational report' });
  }
}

export async function getRevenueTrends(_req: Request, res: Response) {
  try {
    const [monthlyRevenue, bookingStatusBreakdown, roomTypePerformance] = await Promise.all([
      query(`
        SELECT DATE_FORMAT(created_at,'%Y-%m') as month,
               COUNT(*) as transaction_count,
               COALESCE(SUM(amount),0) as total_amount
        FROM payments WHERE status='completed'
        GROUP BY month ORDER BY month ASC LIMIT 12
      `),
      query('SELECT status, COUNT(*) as count FROM bookings GROUP BY status'),
      query(`
        SELECT rt.name as room_type,
               COUNT(b.id) as bookings_count,
               COALESCE(SUM(b.total_amount),0) as total_revenue,
               COALESCE(AVG(b.nights_count),0) as avg_nights
        FROM room_types rt
        JOIN rooms r ON r.room_type_id = rt.id
        LEFT JOIN bookings b ON b.room_id = r.id AND b.status != 'cancelled'
        GROUP BY rt.id, rt.name ORDER BY total_revenue DESC
      `),
    ]);

    return res.json({ monthly_revenue: monthlyRevenue, booking_status_breakdown: bookingStatusBreakdown, room_type_performance: roomTypePerformance });
  } catch (error: any) {
    console.error('getRevenueTrends error:', error);
    return res.status(500).json({ error: 'Failed to fetch revenue trends' });
  }
}

export async function exportReportData(req: Request, res: Response) {
  try {
    const { type = 'bookings', format = 'json' } = req.query;
    let data: any[] = [];

    if (type === 'bookings') {
      data = await query(`
        SELECT b.booking_reference, c.full_name as guest_name, c.email, r.room_number,
               rt.name as room_type, b.check_in_date, b.check_out_date, b.nights_count,
               b.total_amount, b.paid_amount, b.status, b.payment_status, b.created_at
        FROM bookings b
        JOIN customers c ON b.customer_id=c.id
        JOIN rooms r ON b.room_id=r.id
        JOIN room_types rt ON r.room_type_id=rt.id
        ORDER BY b.created_at DESC
      `);
    } else if (type === 'payments') {
      data = await query(`
        SELECT p.payment_reference, b.booking_reference, c.full_name as guest_name,
               p.amount, p.payment_method, p.status, p.created_at
        FROM payments p
        JOIN bookings b ON p.booking_id=b.id
        JOIN customers c ON b.customer_id=c.id
        ORDER BY p.created_at DESC
      `);
    } else if (type === 'rooms') {
      data = await query(`
        SELECT r.room_number, rt.name as room_type, r.floor_number, r.price_per_night,
               r.status, r.operational_status, r.notes
        FROM rooms r JOIN room_types rt ON r.room_type_id=rt.id
        WHERE r.is_active=1 ORDER BY r.floor_number ASC, r.room_number ASC
      `);
    }

    if (format === 'csv') {
      if (data.length === 0) return res.send('No data available');
      const headers = Object.keys(data[0]).join(',');
      const rows    = data.map(item => Object.values(item).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','));
      const csv     = [headers, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=habeshahotel_${type}_report.csv`);
      return res.send(csv);
    }

    return res.json({ type, count: data.length, records: data });
  } catch (error: any) {
    console.error('exportReportData error:', error);
    return res.status(500).json({ error: 'Failed to export report data' });
  }
}
