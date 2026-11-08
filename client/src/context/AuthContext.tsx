import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, NotificationItem } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: number | 'all') => Promise<void>;
  hotelSettings: Record<string, string>;
  currency: string;
  taxRate: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hotelSettings, setHotelSettings] = useState<Record<string, string>>({
    hotel_name: 'HABESHA-HOTEL',
    currency_symbol: '$',
    tax_rate: '12.0',
    hotel_phone: '+251 11 667 8000',
    hotel_email: 'reservations@habeshahotel.com',
    hotel_address: 'Bole Sub-City, Africa Avenue, Addis Ababa, Ethiopia',
    hotel_telegram: '@Abuzubeir1234',
    hotel_telegram_link: 'https://t.me/Abuzubeir1234',
    hotel_instagram: 'seyaman5825',
    hotel_instagram_link: 'https://instagram.com/seyaman5825',
  });

  const fetchSettings = async () => {
    try {
      const res = await api.get<{ settings: Record<string, string> }>('/settings');
      if (res?.settings) {
        setHotelSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (e) {
      console.warn('Could not load hotel settings:', e);
    }
  };

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await api.get<{ unread_count: number; notifications: NotificationItem[] }>('/notifications');
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (e) {
      // Ignored if unauthenticated
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      if (res?.user) {
        setUser(res.user);
        refreshNotifications();
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
      localStorage.removeItem('shms_token');
    } finally {
      setLoading(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    fetchSettings();
    const token = localStorage.getItem('shms_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('shms_token', res.token);
    setUser(res.user);
    refreshNotifications();
  };

  const register = async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', data);
    localStorage.setItem('shms_token', res.token);
    setUser(res.user);
    refreshNotifications();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('shms_token');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/demo-switch', { role });
      localStorage.setItem('shms_token', res.token);
      setUser(res.user);
      await refreshNotifications();
    } catch (error) {
      console.error('Demo switch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id: number | 'all') => {
    try {
      await api.patch(`/notifications/${id}/read`);
      await refreshNotifications();
    } catch (e) {
      console.error('markNotificationRead error:', e);
    }
  };

  const currency = hotelSettings.currency_symbol || '$';
  const taxRate = parseFloat(hotelSettings.tax_rate || '12.0') || 12.0;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        notifications,
        unreadCount,
        refreshNotifications,
        markNotificationRead,
        hotelSettings,
        currency,
        taxRate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
