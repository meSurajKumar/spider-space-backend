import express from 'express';
import envVariables from './src/common/envConfig.js';
import {createServer} from 'node:http';
import expressMiddlewares from './src/startup/middlewares.js';
// Database setup here
// Routes setup here
import initSearch from './src/startup/createIndex.js';
import startupRoutes from './src/startup/router.js'
import errorHandler from './src/middlewares/errorHandler.js';

const app = express();
const port = envVariables.PORT;
const server = createServer(app);

// Middleware
expressMiddlewares(app);
initSearch(); // creating search index;
startupRoutes(app);


app.use(errorHandler);
server.listen(port , ()=>console.log(`Backend Service is Listening on Port : ${port}`));

