import http from 'http';
import { createServerApplication } from './app/index.js';
import { env } from './env.js';
import { connectDb } from './db/connection.js';


async function main() {
    try{
        await connectDb()
        const server =  http.createServer(createServerApplication())

        const PORT: number = env.PORT ? +env.PORT : 3000;

       server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
       });
    }
    catch(err){
        console.error('Error starting server:', err);
    }
}

main();