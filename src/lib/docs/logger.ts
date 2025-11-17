/* eslint-disable no-unused-vars */
import winston from 'winston'; // Import winston for logging
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs
import DailyRotateFile from 'winston-daily-rotate-file'; // Import DailyRotateFile for log rotation

import { dateFormat, unixFormat, logLevel, logFileEnabled, logDirectory, keepLogsFor, storageDateFormat, nodeEnv } from '@/lib/config/env.config';

// Define custom colors for log levels
const customColors = {
  trace: 'blue',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'magenta',
  crit: 'black',
  fatal: 'red'
};

// Define custom log levels
const logLevels = {
  trace: 6,
  debug: 5,
  info: 4,
  warn: 3,
  error: 2,
  crit: 1,
  fatal: 0
} as const; // Ensure TypeScript treats this as a fixed object

// Create a logger instance with custom log levels
const logger = winston.createLogger({ levels: logLevels });

// Check if logs should be output to the console
logger.add(new winston.transports.Console({
  level: logLevel, // Set default log level
  format: winston.format.combine(
    winston.format.colorize(), // Add colorization to logs
    winston.format.timestamp({ format: dateFormat }), // Add timestamp in specified format
    winston.format.printf(({ timestamp, level, message }) => {
      // Optionally add Unix timestamp
      const unixTime = unixFormat ? ` ${Math.floor(new Date(timestamp as string).getTime() / 1000)}` : '';
      return `[${timestamp}${unixTime}] ${level}: ${message}`; // Format log message
    }),
  ),
}));

// Check if logs should be output to a file and if logs should be kept in production
if (logFileEnabled) {
  logger.add(new DailyRotateFile({
    level: logLevel, // Set log level
    dirname: logDirectory, // Directory from .env
    filename: '%DATE%.log', // Filename pattern: LOG-YYYY-MM-DD.log
    datePattern: storageDateFormat, // Rotate log files daily
    zippedArchive: true, // Compress old logs (e.g., .gz)
    maxFiles: `${keepLogsFor}`, // Retain logs for the last 90 days
    format: winston.format.combine(
      winston.format.timestamp({ format: dateFormat }), // Add timestamp in specified format
      winston.format.printf(({ timestamp, level, message }) => {
        // Optionally add Unix timestamp
        const unixTime = unixFormat ? ` ${Math.floor(new Date(timestamp as string).getTime() / 1000)}` : '';
        return `[${timestamp}${unixTime}] ${level}: ${message}`; // Format log message
      })
    ),
  }));
}

// Add custom colors to winston
winston.addColors(customColors);

// Extend the Logger interface to include custom methods
declare module 'winston' {
  interface Logger {
    logWithErrorHandling(msg: any, error: any, hasSecret?: boolean, level?: string): void; // Method to log errors with handling
    routeStart(req: any): string; // Method to log the start of a route
    routeEnd(req: any, res: any, id: string, durationInMs: number): void; // Method to log the end of a route
    trackOperationTime<T>(operation: Promise<T>, operationName: string): Promise<T>; // Method to track operation time
  }
}

// Implement routeStart method to log the start of a route
logger.routeStart = function (req: any): string {
  const requestId = uuidv4(); // Generate a unique ID for the request
  req.requestId = requestId; // Attach requestId to the request object

  // Log request start with headers and method
  logger.info(`${req.protocol.toUpperCase()}/${req.httpVersion} ${req.method} ${req.originalUrl} - Request ID: ${requestId} with headers: ${JSON.stringify(req.headers)} and body: ${JSON.stringify(req.body)}`);

  return requestId; // Return request ID for later use in routeEnd
};

// Implement routeEnd method to log the end of a route
logger.routeEnd = function (req: any, res: any, id: string, durationInMs: number): void {
  const statusCode = res.statusCode; // Get the status code
  const headers = res.getHeaders(); // Get the response headers

  // Log request end with status code, request ID, duration, and response headers
  logger.info(`${req.protocol.toUpperCase()}/${req.httpVersion} ${req.method} ${req.originalUrl} - Request ID: ${id} - Status: ${statusCode}, DurationTotal: ${durationInMs}ms, Response Headers: ${JSON.stringify(headers)} and body: ${JSON.stringify(res.body)}`);
};

// Implement logWithErrorHandling method to handle errors properly
logger.logWithErrorHandling = function(msg: any, error: any, hasSecret: boolean = false, level: string = 'error'): void {
  if (hasSecret && nodeEnv !== 'development') {
    return; // Do not log if hasSecret is true and not in development environment
  } else {
    // If the message is an error, log the stack trace
    if (error instanceof Error) {
      this.log(level, `${msg}: ${error.stack}`);
    } else {
      this.log(level, `${msg}: ${JSON.stringify(error)}`);
    }
  }
};

// Implement trackOperationTime method to track the time taken by an operation
logger.trackOperationTime = async function<T>(operation: Promise<T>, operationName: string): Promise<T> {
  const start = process.hrtime(); // Start time

  // Get the stack trace to extract file and function name
  const stack = new Error().stack || '';
  const stackLines = stack.split('\n');
  const callerLine = stackLines[2] || ''; // The 2nd line of the stack trace is where the function was called from

  // Extract file and function name from the stack trace line
  const match = callerLine.match(/at\s+([^(]+)\s+\(([^:]+):(\d+):(\d+)\)/);
  const functionName = match ? match[1] : 'unknownFunction';
  const fileName = match ? match[2] : 'unknownFile';

  const result = await operation; // Await the operation
  const end = process.hrtime(); // End time
  const durationInMs = (end[0] * 1e9 + end[1] - (start[0] * 1e9 + start[1])) / 1e6; // Calculate duration in milliseconds

  // Log the operation with the file and function name
  logger.info(`${operationName} took ${durationInMs}ms, called from ${functionName} in ${fileName}`);

  return result; // Return the result of the operation
};

export default logger; // Export the logger instance