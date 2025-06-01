import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let db: Db | null = null;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// For dev: use global variable to preserve client across hot reloads
if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// connectToDatabase function to get connected db instance
export async function connectToDatabase() {
  if (!db) {
    const client = await clientPromise;
    db = client.db('secureDB');  // your database name here
  }
  return { db };
}

// export clientPromise in case you want to use directly
export default clientPromise;
