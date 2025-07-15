import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import indexRouter from './routes/index';
import adminRoutes from './routes/adminRoutes';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();

// Start the app after DB connection
connectDatabase().then(() => {
  const http = createServer(app);

  // CORS
  app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
  }));

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(fileUpload());
  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Static Files (adjust as needed)
  app.use(express.static(path.join(__dirname, 'public')));

  // Routes
  app.use('/', indexRouter);
  app.use('/admin', adminRoutes);
  app.use('/api', apiRoutes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Not Found' });
  });

  // Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  });

  // Start Server
  const PORT = process.env.PORT || 5002;
  http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}).catch((error) => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});

export default app;
