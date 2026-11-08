import { Router } from 'express';
import * as authCtrl from '../controllers/authController.ts';
import * as roomCtrl from '../controllers/roomController.ts';
import * as bookingCtrl from '../controllers/bookingController.ts';
import * as paymentCtrl from '../controllers/paymentController.ts';
import * as houseCtrl from '../controllers/housekeepingController.ts';
import * as maintCtrl from '../controllers/maintenanceController.ts';
import * as serviceCtrl from '../controllers/serviceController.ts';
import * as reportCtrl from '../controllers/reportController.ts';
import * as userCtrl from '../controllers/userController.ts';
import * as customerCtrl from '../controllers/customerController.ts';
import * as settingsCtrl from '../controllers/settingsController.ts';
import * as expenseCtrl from '../controllers/expenseController.ts';
import * as rbacCtrl from '../controllers/rbacController.ts';
import * as invCtrl from '../controllers/inventoryController.ts';
import * as staffCtrl from '../controllers/staffOperationsController.ts';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.ts';

const api = Router();

// =================== AUTHENTICATION ===================
api.post('/auth/login', authCtrl.login);
api.post('/auth/register', authCtrl.register);
api.get('/auth/me', authenticate, authCtrl.me);
api.post('/auth/logout', authCtrl.logout);
api.post('/auth/reset-password', authCtrl.resetPassword);
api.post('/auth/demo-switch', authCtrl.demoSwitch);

// =================== ROOMS & AVAILABILITY ===================
api.get('/rooms/types', roomCtrl.getRoomTypes);
api.get('/rooms/types/:id', roomCtrl.getRoomTypeById);
api.get('/rooms/available', roomCtrl.searchAvailableRooms);
api.get('/rooms', roomCtrl.getRooms);
api.post('/rooms', authenticate, requireRole('superadmin', 'admin', 'manager'), roomCtrl.createRoom);
api.put('/rooms/:id', authenticate, requireRole('superadmin', 'admin', 'manager'), roomCtrl.updateRoom);
api.patch('/rooms/:id/status', authenticate, roomCtrl.updateRoomStatus);

// =================== BOOKINGS & FRONT DESK ===================
api.get('/bookings/arrivals-departures', authenticate, requireRole('superadmin', 'admin', 'manager', 'receptionist'), bookingCtrl.getArrivalsDepartures);
api.get('/bookings', authenticate, bookingCtrl.getBookings);
api.get('/bookings/:id', authenticate, bookingCtrl.getBookingById);
api.post('/bookings', optionalAuthenticate, bookingCtrl.createBooking);
api.post('/bookings/:id/check-in', authenticate, requireRole('superadmin', 'admin', 'manager', 'receptionist'), bookingCtrl.checkInGuest);
api.post('/bookings/:id/check-out', authenticate, requireRole('superadmin', 'admin', 'manager', 'receptionist'), bookingCtrl.checkOutGuest);
api.post('/bookings/:id/cancel', authenticate, bookingCtrl.cancelBooking);

// =================== PAYMENTS & INVOICES ===================
api.get('/payments', authenticate, paymentCtrl.getPayments);
api.post('/payments', authenticate, requireRole('superadmin', 'admin', 'manager', 'receptionist', 'accountant'), paymentCtrl.recordPayment);
api.get('/payments/refunds', authenticate, requireRole('superadmin', 'admin', 'manager', 'accountant'), paymentCtrl.getRefunds);
api.post('/payments/refunds', authenticate, requireRole('superadmin', 'admin', 'accountant'), paymentCtrl.recordRefund);
api.get('/payment-methods', paymentCtrl.getPaymentMethods);
api.get('/discounts', paymentCtrl.getDiscounts);
api.get('/invoices', authenticate, paymentCtrl.getInvoices);
api.get('/invoices/:id', authenticate, paymentCtrl.getInvoiceById);

// =================== HOTEL INVENTORY & CONSUMABLES ===================
api.get('/inventory', authenticate, requireRole('superadmin', 'admin', 'manager', 'housekeeper', 'maintenance'), invCtrl.getInventory);
api.post('/inventory', authenticate, requireRole('superadmin', 'admin', 'manager'), invCtrl.createInventoryItem);
api.get('/inventory/transactions', authenticate, requireRole('superadmin', 'admin', 'manager'), invCtrl.getInventoryTransactions);
api.post('/inventory/transactions', authenticate, requireRole('superadmin', 'admin', 'manager', 'housekeeper', 'maintenance'), invCtrl.recordInventoryTransaction);

// =================== STAFF ROSTERS & ATTENDANCE ===================
api.get('/staff/shifts', authenticate, staffCtrl.getShifts);
api.get('/staff/schedules', authenticate, staffCtrl.getStaffSchedules);
api.post('/staff/schedules', authenticate, requireRole('superadmin', 'admin', 'manager'), staffCtrl.createStaffSchedule);
api.get('/staff/attendance', authenticate, staffCtrl.getStaffAttendance);
api.post('/staff/attendance', authenticate, staffCtrl.recordStaffAttendance);

// =================== EXPENSES & ACCOUNTING ===================
api.get('/expenses', authenticate, requireRole('superadmin', 'admin', 'manager', 'accountant'), expenseCtrl.getExpenses);
api.post('/expenses', authenticate, requireRole('superadmin', 'admin', 'accountant'), expenseCtrl.createExpense);
api.get('/expenses/summary', authenticate, requireRole('superadmin', 'admin', 'manager', 'accountant'), expenseCtrl.getFinancialSummary);

// =================== HOUSEKEEPING ===================
api.get('/housekeeping/tasks', authenticate, houseCtrl.getHousekeepingTasks);
api.post('/housekeeping/tasks', authenticate, requireRole('superadmin', 'admin', 'manager', 'housekeeper', 'housekeeping'), houseCtrl.createHousekeepingTask);
api.patch('/housekeeping/tasks/:id/status', authenticate, requireRole('superadmin', 'admin', 'manager', 'housekeeper', 'housekeeping'), houseCtrl.updateTaskStatus);
api.get('/housekeeping/rooms-overview', authenticate, requireRole('superadmin', 'admin', 'manager', 'housekeeper', 'housekeeping', 'receptionist'), houseCtrl.getHousekeepingRoomsOverview);

// =================== MAINTENANCE ===================
api.get('/maintenance', authenticate, maintCtrl.getMaintenanceRequests);
api.post('/maintenance', authenticate, maintCtrl.createMaintenanceRequest);
api.patch('/maintenance/:id', authenticate, requireRole('superadmin', 'admin', 'manager', 'maintenance'), maintCtrl.updateMaintenanceRequest);

// =================== HOTEL SERVICES ===================
api.get('/services', serviceCtrl.getHotelServices);
api.post('/services', authenticate, requireRole('superadmin', 'admin', 'manager'), serviceCtrl.createHotelService);
api.post('/services/order', authenticate, serviceCtrl.orderHotelService);

// =================== REPORTS & ANALYTICS ===================
api.get('/reports/overview', authenticate, requireRole('superadmin', 'admin', 'manager', 'accountant'), reportCtrl.getReportOverview);
api.get('/reports/revenue-trends', authenticate, requireRole('superadmin', 'admin', 'manager', 'accountant'), reportCtrl.getRevenueTrends);
api.get('/reports/export', authenticate, requireRole('superadmin', 'admin', 'manager', 'accountant'), reportCtrl.exportReportData);

// =================== USERS & EMPLOYEES ===================
api.get('/users', authenticate, requireRole('superadmin', 'admin'), userCtrl.getUsers);
api.post('/users', authenticate, requireRole('superadmin', 'admin'), userCtrl.createUser);
api.put('/users/:id', authenticate, requireRole('superadmin', 'admin'), userCtrl.updateUser);
api.delete('/users/:id', authenticate, requireRole('superadmin'), userCtrl.deleteUser);
api.get('/users/:id/activity', authenticate, requireRole('superadmin', 'admin'), userCtrl.getUserActivity);
api.get('/employees', authenticate, requireRole('superadmin', 'admin', 'manager'), userCtrl.getEmployees);
api.get('/departments', authenticate, userCtrl.getDepartments);

// =================== ROLES & PERMISSIONS (RBAC) ===================
api.get('/roles', authenticate, requireRole('superadmin'), rbacCtrl.getRoles);
api.put('/roles/:id', authenticate, requireRole('superadmin'), rbacCtrl.updateRoleDescription);
api.get('/permissions', authenticate, requireRole('superadmin'), rbacCtrl.getPermissions);
api.get('/permissions/matrix', authenticate, requireRole('superadmin'), rbacCtrl.getPermissionMatrix);
api.get('/roles/:roleId/permissions', authenticate, requireRole('superadmin', 'admin'), rbacCtrl.getRolePermissions);
api.post('/role-permissions/assign', authenticate, requireRole('superadmin'), rbacCtrl.assignPermission);
api.post('/role-permissions/revoke', authenticate, requireRole('superadmin'), rbacCtrl.revokePermission);

// =================== CUSTOMERS & REVIEWS & COMPLAINTS ===================
api.get('/customers', authenticate, requireRole('superadmin', 'admin', 'manager', 'receptionist'), customerCtrl.getCustomers);
api.get('/customers/:id', authenticate, requireRole('superadmin', 'admin', 'manager', 'receptionist'), customerCtrl.getCustomerById);
api.get('/reviews', customerCtrl.getReviews);
api.post('/reviews', authenticate, customerCtrl.createReview);
api.get('/complaints', authenticate, customerCtrl.getComplaints);
api.post('/complaints', authenticate, customerCtrl.createComplaint);
api.patch('/complaints/:id/resolve', authenticate, requireRole('superadmin', 'admin', 'manager'), customerCtrl.resolveComplaint);

// =================== SETTINGS & NOTIFICATIONS & AUDIT ===================
api.get('/settings', settingsCtrl.getHotelSettings);
api.put('/settings', authenticate, requireRole('superadmin', 'admin'), settingsCtrl.updateHotelSettings);
api.get('/notifications', authenticate, settingsCtrl.getNotifications);
api.patch('/notifications/:id/read', authenticate, settingsCtrl.markNotificationRead);
api.get('/audit-logs', authenticate, requireRole('superadmin', 'admin'), settingsCtrl.getAuditLogs);

export default api;
