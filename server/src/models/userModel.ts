import { query, queryOne, execute } from '../config/database.ts';

export const UserModel = {
  async findById(id: number) {
    return queryOne('SELECT id, email, role, full_name, phone, avatar_url, is_active, created_at FROM users WHERE id = ?', [id]);
  },

  async findByEmail(email: string) {
    return queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  },

  async findAll() {
    return query('SELECT id, email, role, full_name, phone, avatar_url, is_active, created_at FROM users ORDER BY id ASC');
  },
};

