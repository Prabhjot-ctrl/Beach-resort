/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../middleware/winston.logger');

// Singleton Prisma Client instance
let prisma;

const connectDatabase = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.APP_NODE_ENV === 'development'
        ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' }
        ]
        : [{ emit: 'event', level: 'error' }]
    });

    // Log queries in development
    if (process.env.APP_NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        logger.info(`Query: ${e.query} — Duration: ${e.duration}ms`);
      });
    }

    prisma.$on('error', (e) => {
      logger.error('Prisma error: ', e.message);
    });

    prisma.$on('warn', (e) => {
      logger.warn('Prisma warning: ', e.message);
    });

    // Verify connection
    prisma.$connect()
      .then(() => {
        logger.info('Connection established to PostgreSQL database successful!');
      })
      .catch((error) => {
        logger.error('Error connecting to PostgreSQL: ', error);
      });
  }

  return prisma;
};

// Initialize and export the singleton
const prismaClient = connectDatabase();

module.exports = prismaClient;
