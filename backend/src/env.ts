import dotenv from "dotenv";
import {z} from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("3000"),
    GOOGLE_API_KEY: z.string(),
    GROQ_API_KEY: z.string(),
    ACCESS_TOKEN_CODE: z.string(),
    REFRESH_TOKEN_CODE: z.string(),
    MONGODB_URI: z.string(),
    RESEND_API_KEY: z.string(),
    EMAIL_FROM: z.string().default("noreply@resend.dev"),
    FRONTEND_URL: z.string().default("http://localhost:3001"),
})


function createEnv(env: NodeJS.ProcessEnv){

   const safeParseResult =  envSchema.safeParse(env);
   
   if(!safeParseResult.success) throw new Error(safeParseResult.error.message);
   
   return safeParseResult.data;

}

export const env = createEnv(process.env)