import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fileUpload from "express-fileupload";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
 
import indexRouter from "./routes/index";
import adminRoutes from "./routes/adminRoutes";
import apiRoutes from "./routes/apiRoutes";
import { connectDatabase } from "./config/database";

const app = express();

dotenv.config({
  path: path.resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`
  ),
});
 
const serverRoute = process.env.SERVER_API_VERSION || "/api/v1";

connectDatabase()
.then(() => {
  const http = createServer(app);
  app.use(
    cors({
      origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
        "http://localhost:5002",
        "http://localhost:5173",
      ],
      credentials: true,
    })
  );
  app.use(`${serverRoute}/webhook`, express.raw({ type: "application/json" }));
 
  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
 
  // File upload middleware
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, "temp"),
      createParentPath: true,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      abortOnLimit: true,
      safeFileNames: true,
      preserveExtension: false, // Let our custom handler deal with extensions
    })
  );
 
  // Static files
  app.use(express.static(path.join(__dirname, "public")));
 
  app.use(`${serverRoute}/admin`, adminRoutes);
  app.use(`${serverRoute}`, apiRoutes);
  app.use("/", indexRouter);
 
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" });
  });
 
  app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  });
 
  const rawPort = process.env.PORT ?? process.env.WEBSITES_PORT ?? "5002";
  const PORT = parseInt(rawPort, 10);

  http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});
 
export default app;