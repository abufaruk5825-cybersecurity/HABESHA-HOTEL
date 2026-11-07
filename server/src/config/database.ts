import 'dotenv/config';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the root .env is loaded as the single source of truth
const rootEnvPath = path.resolve(process.cwd(), '.env');
const fallbackRootEnv = path.resolve(__dirname, '../../../.env');
const serverEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
} else if (fs.existsSync(fallbackRootEnv)) {
  dotenv.config({ path: fallbackRootEnv, override: true });
} else if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
} else {
  dotenv.config({ override: true });
}

// Create a MySQL connection pool
export const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT)  || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'shms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true, // needed to run the schema SQL in one exec
});

// Helper: run a single query and return all rows
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params ?? []);
  return rows as T[];
}

// Helper: run a single query and return the first row (or null)
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return (rows as any[])[0] ?? null;
}

// Helper: run an INSERT / UPDATE / DELETE and return the result metadata
export async function execute(sql: string, params?: any[]) {
  const [result] = await pool.execute(sql, params ?? []);
  return result as mysql.ResultSetHeader;
}

// Initialize schema (run once on server start)
export async function initDatabase() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'server', 'db', 'schema.sql'),
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '..', 'schema.sql'),
    path.resolve(__dirname, '..', '..', 'db', 'schema.sql'),
  ];
  const schemaPath = possiblePaths.find(p => fs.existsSync(p));
  if (schemaPath && fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    // Split on semicolons and run each statement individually to stay
    // compatible with mysql2 (multipleStatements is enabled but CREATE INDEX
    // IF NOT EXISTS needs individual execution on some MySQL versions)
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err: any) {
        // Ignore duplicate index or table errors on re-runs
        if (
          err.code === 'ER_DUP_KEYNAME' ||
          err.code === 'ER_TABLE_EXISTS_ERROR' ||
          err.errno === 1061 ||
          err.errno === 1050
        ) {
          continue;
        }
        throw err;
      }
    }
  }
}

export default pool;
