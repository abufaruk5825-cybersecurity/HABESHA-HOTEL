# HABESHA-HOTEL SHMS - API Reference

# Base URL
`/api`

## Core Endpoints

# Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - Guest registration
- `GET /api/auth/me` - Current session user profile
- `POST /api/auth/logout` - Clear authentication session
- `POST /api/auth/demo-switch` - 1-click role switcher (Admin, Manager, Reception, Housekeeper, Customer)

### Rooms & Inventory
- `GET /api/rooms` - All hotel rooms with statuses
- `GET /api/rooms/types` - Room type catalog (Deluxe, Executive, Presidential, etc.)
- `GET /api/rooms/available` - Filtered date range availability search
- `PATCH /api/rooms/:id/status` - Update operational or cleanliness state

### Bookings & Folios
- `GET /api/bookings` - All reservations ledger
- `POST /api/bookings` - Create new reservation
- `POST /api/bookings/:id/check-in` - Front-desk check in
- `POST /api/bookings/:id/check-out` - Front-desk check out
- `GET /api/invoices/:id` - Official tax folio and printable invoice

### Housekeeping & Maintenance
- `GET /api/housekeeping/tasks` - Priority room turnover queue
- `GET /api/maintenance` - Engineering work orders & defect tickets
- `POST /api/maintenance` - Log maintenance defect
- `PATCH /api/maintenance/:id/resolve` - Clear repair and restore room to service

