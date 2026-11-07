import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'habesha_hotel_jwt_super_secret_key_2026_shms',
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shms',
  },
};

export default config;

