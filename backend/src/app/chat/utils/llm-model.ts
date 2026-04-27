import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../../../env.js";
import { ChatGroq } from "@langchain/groq";

// export const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash",
//     apiKey: env.GOOGLE_API_KEY
// })

export const model = new ChatGroq({
    model: "llama-3.1-8b-instant" ,
    apiKey: env.GROQ_API_KEY,
})
