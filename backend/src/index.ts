import http from 'http';
import { createServerApplication } from './app/index.js';


async function main() {
    try{
       const server =  http.createServer(createServerApplication())
       server.listen(3000, () => {
        console.log('Server is running on port 3000');
       });
    }
    catch(err){
        console.error('Error starting server:', err);
    }
}

main();