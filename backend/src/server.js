import dotenv from 'dotenv';
import app from './app.js';
import { closeDatabaseConnection, testDatabaseConnection } from './config/db.js';
import { initializeDatabase } from './config/initDb.js';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

async function bootstrap() {
  await testDatabaseConnection();
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
