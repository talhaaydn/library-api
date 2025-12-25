import { createApp } from './app';
import { AppDataSource } from './config/database.config';
import { config } from './config/app.config';

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const app = createApp();
    const port = config.port;

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

