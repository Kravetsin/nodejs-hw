//* Import dependencies
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';

//* Import database connection
import { connectMongoDB } from './db/connectMongoDB.js';

//* Import middleware
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

//* Import routes
import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

//* Initialize Express app
const app = express();
const PORT = process.env.PORT ?? 3000;

//* Global middleware
app.use(logger);
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//* Connect routes
app.use(authRoutes);
app.use(notesRoutes);
app.use(userRoutes);

//* 404 handler and error handler
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

//* Start the server
await connectMongoDB();

//* Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
