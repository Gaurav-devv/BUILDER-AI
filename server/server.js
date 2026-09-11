import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import dns from "dns";


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

await connectToDatabase();

// 1. Production / extra origins from env (comma-separated)
const configuredOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",").map((o) => o.trim().replace(/\/$/, ""))
  : [];

// 2. Dynamic origin validator — never breaks when Vite auto-picks a new port.
//    • Always allows localhost ports 5173–5200 (Vite's auto-increment range).
//    • Also allows anything listed in ORIGINS env var (for staging/production).
const isAllowedOrigin = (origin) => {
  if (!origin) return false;

  // Allow any localhost:51xx port that Vite might auto-assign
  const viteLocalhost = /^http:\/\/localhost:(51[7-9]\d|5[2-9]\d{2}|5200)$/.test(origin);
  if (viteLocalhost) return true;

  // Allow explicitly configured origins
  if (configuredOrigins.includes(origin)) return true;

  return false;
};

// 3. Log the policy once at startup so it's easy to diagnose future issues
const startupOriginList = [
  "http://localhost:5173–5200 (Vite range, dynamic)",
  ...configuredOrigins,
];

// 4. Wire up cors with the dynamic function — handles preflight automatically
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl requests that send no Origin header
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 204,
  })
);

// 3. Parsers
app.use(cookieParser());
app.use(express.json());

// 4. Routes
app.get("/", (req, res) => res.send("Server is Live!"));
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);

// 5. Centralized error handler — MUST have exactly 4 parameters for Express to
//    recognise it as an error handler (the leading `err` arg).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[Server Error]`, err);

  if (res.headersSent) {
    return next(err); // delegate to Express default if headers already sent
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Allowed CORS origins:`, startupOriginList);
});
