import mongoose from "mongoose"
import { env } from "../env.js";

export const connectDb = async ()=>{
    try {
       const connectionInstance =  await mongoose.connect(env.MONGODB_URI);
       console.log("MongoDB CONNECTED >>> :",connectionInstance.connection.host)
    } catch (error) {
        console.log("MongoDB connection Failed!", error)
        process.exit(1)
    }
}