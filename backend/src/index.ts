import http from 'http';
import { createServerApplication } from './app/index.js';
import { env } from 'process';


async function main() {
    try{
       
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