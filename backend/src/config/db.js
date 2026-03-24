import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinic_booking',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

const pool = mysql.createPool(connectionConfig);

function createDatabaseError(error, context) {
  const wrappedError = new Error(`Database error while ${context}.`);
  wrappedError.statusCode = error.code === 'ER_DUP_ENTRY' ? 409 : 500;
  wrappedError.cause = error;
  wrappedError.code = error.code;
  wrappedError.details = {
    dbCode: error.code,
  };
  return wrappedError;
}

export async function executeQuery(query, params = [], context = 'executing query') {
  try {
    const [result] = await pool.execute(query, params);
    return result;
  } catch (error) {
    console.error(`MySQL error (${context}):`, error.message);
    throw createDatabaseError(error, context);
  }
}

export async function runInTransaction(handler, context = 'executing transaction') {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const executor = async (query, params = [], queryContext = context) => {
      try {
        const [result] = await connection.execute(query, params);
        return result;
      } catch (error) {
        console.error(`MySQL error (${queryContext}):`, error.message);
        throw createDatabaseError(error, queryContext);
      }
    };

    const result = await handler(executor);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
  } catch (error) {
    console.error('Unable to connect to MySQL:', error.message);
    throw createDatabaseError(error, 'connecting to MySQL');
  }
}

export async function closeDatabaseConnection() {
  await pool.end();
}

export default pool;
