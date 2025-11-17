// Import the PrismaClient class from the @prisma/client package
import { PrismaClient } from '@prisma/client';

// Import the server and app instances from the express setup
import { app, closeServer } from '@/lib/express';

// Middleware to automatically update the `UpdatedAt` field before update operations
const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

// Function to test the database connection
async function testDbConnection() {
    try {
        // Attempt to connect to the database
        await prisma.$connect();
        // Log a success message if the connection is successful
        app.logger.debug('Database connection successful');
    } catch (error) {
        // Log an error message if the connection fails
        app.logger.logWithErrorHandling('Database connection failed', error, true);
        // Log a critical error message and close the server
        app.logger.crit('Exiting due to database connection failure');
        closeServer();
    }
}

// Test the database connection immediately when the application starts
testDbConnection();

// Schedule the testDbConnection function to run every hour (3600000 milliseconds)
setInterval(testDbConnection, 60 * 60 * 1000);

// Export the prisma instance for use in other parts of the application
export default prisma;