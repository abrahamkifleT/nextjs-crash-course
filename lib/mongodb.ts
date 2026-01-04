import mongoose from "mongoose";

// Ensure MONGODB_URI is defined
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

/**
 * Interface to define the shape of the cached mongoose connection.
 * @property conn - The established mongoose connection interface or null
 * @property promise - The pending connection promise or null
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global interface augmentation to add `mongoose` to the NodeJS `global` object.
 * This ensures the cache persists across hot reloads in development.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

/**
 * Initialize the cached connection variable.
 * If strictly in a production environment where global scope might be reset or restricted,
 * you might treat this differently, but for Next.js this pattern is standard.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to the MongoDB database.
 *
 * This function implements a caching strategy to prevent creating multiple
 * database connections in a serverless/Next.js environment, which can
 * exhaust database connection limits.
 *
 * @returns {Promise<typeof mongoose>} The Mongoose connection instance.
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // If a connection is already cached, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create a new one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection promise to ensure the connection is ready.
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, reset the promise to allow retring.
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
