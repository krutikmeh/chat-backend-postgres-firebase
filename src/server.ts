import dotenv from 'dotenv';
import app from './app';
import { initDatabase, sequelize } from './models/index.js';
import { firestore } from './config/firebase.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Test PostgreSQL & sync Sequelize tables
    await initDatabase();
    console.log('Connected to PostgreSQL & synced Sequelize models');

    // 2. Test Firebase Firestore connection
    await firestore.listCollections();
    console.log('Connected to Firebase Firestore');

    // 3. Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down gracefully...');
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();