import bcrypt from 'bcryptjs';
import { UserModel } from '../models/userModel.ts';
import { generateToken } from '../middleware/auth.ts';

export const AuthService = {
  async authenticateUser(email: string, pass: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) return null;
    if (!user.is_active) throw new Error('Account is deactivated');
    const valid = await bcrypt.compare(pass, user.password_hash);
    if (!valid) return null;
    const authUser = { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
    const token = generateToken(authUser);
    return { user: authUser, token };
  },
};

