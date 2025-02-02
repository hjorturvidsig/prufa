// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const options = {
  tls: true,
  tlsAllowInvalidCertificates: true, // Notaðu þetta aðeins í þróun!
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Vinsamlegast settu MONGODB_URI í .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Í development getur verið gott að geyma tenginguna í global scope
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}
client.connect().then(client => console.log("MongoDB tenging opnuð")).catch(err => console.error("Villa í tengingu:", err));

export default clientPromise;

