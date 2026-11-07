import { Request } from 'express';

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'receptionist' | 'housekeeper' | 'accountant' | 'customer';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

