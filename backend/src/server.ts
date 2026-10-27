import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import { Category } from './models/Category';
import { ALL_DEFAULT_CATEGORIES } from './constants/categories';

async function bootstrap() {
  try {
    await connectDatabase();

    // Ensure default system categories exist
    const defaultCount = await Category.countDocuments({ isDefault: true, userId: null });
    if (defaultCount === 0) {
      const systemCategories = ALL_DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        userId: null,
        isDefault: true,
        isActive: true,
      }));
      await Category.insertMany(systemCategories, { ordered: false }).catch(() => {});
      logger.info('Default Indian spending & income categories seeded successfully.');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Finly API server running on http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`📖 Interactive API Docs available at http://localhost:${env.PORT}/api-docs`);
      logger.info(`❤️ Health check endpoint at http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Closing server gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error({ error }, 'Failed to start Finly server');
    process.exit(1);
  }
}

bootstrap();

