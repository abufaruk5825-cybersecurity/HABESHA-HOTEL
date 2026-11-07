-- ====================================================================
-- SMART HOTEL MANAGEMENT SYSTEM (SHMS) - MySQL DATABASE SCHEMA
-- Normalized 26 tables with Foreign Keys, Constraints, and Indexes
-- ====================================================================

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50) NOT NULL
);

-- 3. ROLE_PERMISSIONS
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role ENUM('admin','manager','receptionist','housekeeper','customer') NOT NULL DEFAULT 'customer',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department_id INT,
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  position VARCHAR(100) NOT NULL,
  salary DECIMAL(10,2) DEFAULT 0.00,
  hire_date DATE NOT NULL,
  status ENUM('active','on_leave','terminated') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 7. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  country VARCHAR(100) DEFAULT 'United States',
  id_document_type VARCHAR(50) DEFAULT 'Passport',
  id_document_number VARCHAR(100),
  preferences TEXT,
  special_requests TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. ROOM_TYPES
CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  bed_type VARCHAR(50) NOT NULL,
  beds_count INT NOT NULL DEFAULT 1,
  size_sqm INT NOT NULL DEFAULT 35,
  image_url TEXT,
  gallery_urls TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. ROOMS
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type_id INT NOT NULL,
  floor_number INT NOT NULL,
  status ENUM('available','reserved','occupied','dirty','cleaning','maintenance','out_of_service') NOT NULL DEFAULT 'available',
  operational_status ENUM('ready','needs_cleaning','cleaning_in_progress','under_repair','out_of_order') NOT NULL DEFAULT 'ready',
  price_per_night DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT
);

-- 10. AMENITIES
CREATE TABLE IF NOT EXISTS amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT 'Sparkles',
  description TEXT,
  category VARCHAR(50) DEFAULT 'general'
);

-- 11. ROOM_AMENITIES
CREATE TABLE IF NOT EXISTS room_amenities (
  room_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (room_id, amenity_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- 12. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  actual_check_in DATETIME,
  actual_check_out DATETIME,
  adults_count INT NOT NULL DEFAULT 1,
  children_count INT NOT NULL DEFAULT 0,
  nights_count INT NOT NULL DEFAULT 1,
  room_rate DECIMAL(10,2) NOT NULL,
  services_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','confirmed','checked_in','checked_out','cancelled','no_show') NOT NULL DEFAULT 'confirmed',
  payment_status ENUM('pending','partially_paid','paid','refunded') NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  checked_in_by INT,
  checked_out_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
  FOREIGN KEY (checked_in_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (checked_out_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. BOOKING_ROOMS
CREATE TABLE IF NOT EXISTS booking_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  room_id INT NOT NULL,
  night_rate DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- 14. BOOKING_GUESTS
CREATE TABLE IF NOT EXISTS booking_guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 15. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  payment_reference VARCHAR(100) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','card','bank_transfer','online') NOT NULL,
  status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'completed',
  notes TEXT,
  recorded_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 16. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  booking_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  balance_due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('unpaid','partially_paid','paid','cancelled') NOT NULL DEFAULT 'unpaid',
  due_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- 17. INVOICE_ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  item_type ENUM('room_charge','service','tax','discount','extra') DEFAULT 'room_charge',
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 18. HOTEL_SERVICES
CREATE TABLE IF NOT EXISTS hotel_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category ENUM('dining','spa','transport','laundry','conference','room_service','other') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Coffee',
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. SERVICE_ORDERS
CREATE TABLE IF NOT EXISTS service_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_time DATETIME,
  notes TEXT,
  ordered_by INT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES hotel_services(id) ON DELETE RESTRICT,
  FOREIGN KEY (ordered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 20. HOUSEKEEPING_TASKS
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  assigned_employee_id INT,
  task_type ENUM('standard_clean','deep_clean','turn_down','inspection','sanitization') NOT NULL DEFAULT 'standard_clean',
  priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  status ENUM('pending','in_progress','completed','verified') NOT NULL DEFAULT 'pending',
  instructions TEXT,
  scheduled_for DATE,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 21. MAINTENANCE_REQUESTS
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  reported_by INT NOT NULL,
  technician_id INT,
  issue_title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('reported','in_progress','resolved','cancelled') NOT NULL DEFAULT 'reported',
  estimated_cost DECIMAL(10,2) DEFAULT 0.00,
  actual_cost DECIMAL(10,2) DEFAULT 0.00,
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolution_notes TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (technician_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 22. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  booking_id INT,
  room_type_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL
);

-- 23. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info','success','warning','urgent') NOT NULL DEFAULT 'info',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  link_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 24. COMPLAINTS
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  booking_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  department_id INT,
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('open','under_investigation','resolved','closed') NOT NULL DEFAULT 'open',
  resolution_notes TEXT,
  resolved_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 25. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 26. HOTEL_SETTINGS
CREATE TABLE IF NOT EXISTS hotel_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  label VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for high-frequency queries
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_housekeeping_status ON housekeeping_tasks(status);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
