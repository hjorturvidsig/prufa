// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const options = {
  tls: true,
};

let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Vinsamlegast settu MONGODB_URI í .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Í development getur verið gott að geyma tenginguna í global scope
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {

  clientPromise = new MongoClient(uri, options).connect();

}

export default clientPromise;

