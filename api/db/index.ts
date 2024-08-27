import mongoose from "mongoose";
import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import { DB_NAME } from "../constants";

/**
 * Loading .env file
 */
const myEnv = dotenv.config()
dotenvExpand.expand(myEnv);

const uri = String(process.env.MONGODB_URL);

/**
 * Connect to MongoDB
 */
export default async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`);
        await connectionInstance.connection.db.admin().command({ ping: 1 });
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}