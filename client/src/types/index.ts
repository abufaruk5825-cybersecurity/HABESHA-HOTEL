export type UserRole = 'superadmin' | 'admin' | 'manager' | 'receptionist' | 'housekeeper' | 'accountant' | 'customer' | 'maintenance';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: number;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  description?: string;
  category: string;
}

export interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  base_price: number;
  capacity: number;
  bed_type: string;
  beds_count: number;
  size_sqm: number;
  image_url: string;
  gallery: string[];
}

export interface Room {
  id: number;
  room_number: string;
  room_type_id: number;
  room_type_name?: string;
  room_type_code?: string;
  room_type_image?: string;
  capacity?: number;
  bed_type?: string;
  beds_count?: number;
  size_sqm?: number;
  floor_number: number;
  status: 'available' | 'reserved' | 'occupied' | 'dirty' | 'cleaning' | 'maintenance' | 'out_of_service';
  operational_status: 'ready' | 'needs_cleaning' | 'cleaning_in_progress' | 'under_repair' | 'out_of_order';
  price_per_night: number;
  is_active: number;
  notes?: string;
  amenities?: Amenity[];
}

export interface Booking {
  id: number;
  booking_reference: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  customer_country?: string;
  id_document_number?: string;
  room_id: number;
  room_number: string;
  floor_number?: number;
  room_type_name: string;
  room_type_code?: string;
  room_type_image?: string;
  bed_type?: string;
  size_sqm?: number;
  room_status?: string;
  operational_status?: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in?: string;
  actual_check_out?: string;
  adults_count: number;
  children_count: number;
  nights_count: number;
  room_rate: number;
  services_total: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'partially_paid' | 'paid' | 'refunded';
  special_requests?: string;
  invoice_number?: string;
  balance_due?: number;
  invoice_status?: string;
  created_at: string;
  guests?: BookingGuest[];
  payments?: Payment[];
  invoice?: Invoice;
  service_orders?: ServiceOrder[];
}

export interface BookingGuest {
  id: number;
  booking_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  is_primary: number;
}

export interface Payment {
  id: number;
  booking_id: number;
  booking_reference?: string;
  customer_name?: string;
  payment_reference: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  recorded_by?: number;
  recorded_by_name?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'room_charge' | 'service' | 'tax' | 'discount' | 'extra';
}

export interface Invoice {
  id: number;
  invoice_number: string;
  booking_id: number;
  booking_reference?: string;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_country?: string;
  room_number?: string;
  room_type_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  nights_count?: number;
  adults_count?: number;
  children_count?: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';
  due_date: string;
  created_at: string;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface HotelService {
  id: number;
  name: string;
  category: 'dining' | 'spa' | 'transport' | 'laundry' | 'conference' | 'room_service' | 'other';
  price: number;
  description?: string;
  icon?: string;
  is_available: number;
}

export interface ServiceOrder {
  id: number;
  booking_id: number;
  service_id: number;
  service_name?: string;
  service_category?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  order_time: string;
  delivered_time?: string;
  notes?: string;
}

export interface HousekeepingTask {
  id: number;
  room_id: number;
  room_number: string;
  floor_number: number;
  room_status: string;
  operational_status: string;
  room_type_name: string;
  assigned_employee_id?: number;
  assigned_employee_name?: string;
  task_type: 'standard_clean' | 'deep_clean' | 'turn_down' | 'inspection' | 'sanitization';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  instructions?: string;
  scheduled_for?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MaintenanceRequest {
  id: number;
  room_id: number;
  room_number: string;
  floor_number: number;
  room_status: string;
  reported_by: number;
  reported_by_name: string;
  technician_id?: number;
  technician_name?: string;
  issue_title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'pending' | 'assigned' | 'in_progress' | 'waiting_parts' | 'resolved' | 'closed' | 'cancelled';
  estimated_cost: number;
  actual_cost: number;
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface Review {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_country?: string;
  room_type_id?: number;
  room_type_name?: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: number;
  created_at: string;
}

export interface Complaint {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email?: string;
  booking_id?: number;
  booking_reference?: string;
  title: string;
  description: string;
  department_id?: number;
  department_name?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_investigation' | 'resolved' | 'closed';
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  is_read: number;
  link_url?: string;
  created_at: string;
}

export interface Employee {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  employee_code: string;
  position: string;
  department_id: number;
  department_name?: string;
  salary: number;
  hire_date: string;
  status: 'active' | 'on_leave' | 'terminated';
}

export interface Customer {
  id: number;
  user_id?: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  id_document_type?: string;
  id_document_number?: string;
  preferences?: string;
  total_bookings?: number;
  total_spent?: number;
  last_stay_date?: string;
  created_at: string;
}

export interface Expense {
  id: number;
  category: string;
  title: string;
  amount: number;
  currency: string;
  payment_method: string;
  reference_number?: string;
  expense_date: string;
  recorded_by?: number;
  recorded_by_name?: string;
  notes?: string;
  created_at: string;
}

export interface FinancialSummary {
  currency: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  outstandingInvoices: number;
  categoryBreakdown: { category: string; total: number; count: number }[];
  paymentMethodBreakdown: { payment_method: string; total: number; count: number }[];
}

export interface Refund {
  id: number;
  refund_number: string;
  payment_id: number;
  booking_id: number;
  amount: number;
  currency: string;
  refund_method: string;
  reason: string;
  status: 'pending' | 'completed' | 'rejected';
  processed_by?: number;
  processed_by_name?: string;
  payment_reference?: string;
  booking_reference?: string;
  customer_name?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'card' | 'cash' | 'other';
  currency: string;
  is_active: boolean | number;
  account_number?: string;
  instructions?: string;
  created_at: string;
  updated_at?: string;
}

export interface Discount {
  id: number;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed_amount';
  value: number;
  min_spend: number;
  max_discount?: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean | number;
  created_at: string;
}

export interface RoomStatusHistory {
  id: number;
  room_id: number;
  previous_status: string;
  new_status: string;
  changed_by?: number;
  reason?: string;
  created_at: string;
}

export interface BookingStatusHistory {
  id: number;
  booking_id: number;
  previous_status: string;
  new_status: string;
  changed_by?: number;
  notes?: string;
  created_at: string;
}

export interface Shift {
  id: number;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  description?: string;
  created_at: string;
}

export interface StaffSchedule {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  avatar_url?: string;
  position?: string;
  department_name?: string;
  shift_id: number;
  shift_name?: string;
  shift_code?: string;
  start_time?: string;
  end_time?: string;
  department_id?: number;
  work_date: string;
  status: 'scheduled' | 'completed' | 'absent' | 'swapped' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface StaffAttendance {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  avatar_url?: string;
  position?: string;
  department_name?: string;
  shift_name?: string;
  schedule_id?: number;
  attendance_date: string;
  clock_in?: string;
  clock_out?: string;
  total_hours: number;
  status: 'present' | 'late' | 'absent' | 'half_day' | 'on_leave';
  notes?: string;
  recorded_by?: number;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category: 'linen' | 'toiletries' | 'food_beverage' | 'cleaning_supplies' | 'maintenance_parts' | 'stationery' | 'other';
  unit: string;
  quantity_on_hand: number;
  reorder_level: number;
  unit_cost: number;
  currency: string;
  storage_location: string;
  is_active: boolean | number;
  is_low_stock?: boolean | number;
  created_at: string;
  updated_at?: string;
}

export interface InventoryTransaction {
  id: number;
  inventory_id: number;
  item_name?: string;
  item_code?: string;
  unit?: string;
  transaction_type: 'purchase_in' | 'usage_out' | 'waste_loss' | 'return_in' | 'adjustment';
  quantity: number;
  unit_price: number;
  total_cost: number;
  department_id?: number;
  department_name?: string;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  recorded_by?: number;
  recorded_by_name?: string;
  created_at: string;
}
