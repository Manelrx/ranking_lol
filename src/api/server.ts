import fastify from 'fastify';
import cors from '@fastify/cors';
import { rankingRoutes } from './routes';

const server = fastify({ logger: true });

// Register CORS
server.register(cors, {
    origin: '*', // Allow all for dev
    methods: ['GET']
});

// Register Routes
server.register(rankingRoutes);

const start = async () => {
    try {
        const port = 3002; // Moved from 3001 due to zombie process lock
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
