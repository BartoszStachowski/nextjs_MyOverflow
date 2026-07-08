import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export const mongoClient = client;
export const db = client.db("MyOverflow");
