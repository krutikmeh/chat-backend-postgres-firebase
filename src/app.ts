import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import chatRoutes from './routes/chat.route';
import { swaggerDocument } from './config/swagger.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Interactive API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/', chatRoutes);
app.use(errorHandler);

export default app;