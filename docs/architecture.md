# HABESHA-HOTEL SHMS - Architecture Documentation

## Overview
HABESHA-HOTEL Smart Hotel Management System (SHMS) is an enterprise hospitality platform built with a decoupled React 19 frontend and an Express.js / TypeScript backend powered by MySQL.

## Structure
- `/client`
  - `/public`: Icons, branding, static assets
  - `/src`: React components, contextual state, role-based dashboards (`admin`, `manager`, `receptionist`, `housekeeping`, `maintenance`, `customer`), services, types, and utility functions
- `/server`
  - `/src`: Controllers, routes, middleware, models, services, config, validators, utils, types, and `server.ts`
  - `/db`: Database schema (`schema.sql`), migrations (`migrations/`), and seeds (`seeds/`)
  - `/tests`: Database health and migration test scripts (`test-db.ts`)
- `/public`: Root static assets (favicons, icons)
- `/docs`: Project architecture and API documentation

