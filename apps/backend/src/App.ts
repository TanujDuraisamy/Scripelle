import "./config/env";
import express, { NextFunction, Request, Response } from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./utils/passport";
import { sessionSecret } from "./config/env";
import { rateLimit } from "./middlewares/rate-limit";
import AppRoot from "./routes";

export const app = express();
const origins = (process.env.CORS_ORIGINS || "http://localhost:5174,http://localhost:8080").split(",").map(s => s.trim());
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(session({
  secret: sessionSecret, resave: false, saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: "lax", maxAge: 10 * 60 * 1000 },
}));
app.use(passport.initialize());
app.get("/health", (_req, res) => { res.json({ status: "ok" }); });
app.use("/api/v1/auth", rateLimit(30));
app.use("/api/v1/admin/login", rateLimit(15));
app.use("/api/v1/ai", rateLimit(30));
app.use("/api/v1/autocompletion", rateLimit(60));
app.use("/api/v1", AppRoot);
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: status === 500 ? "Internal Server Error" : "Invalid request" });
});
if (require.main === module) {
  const port = Number(process.env.PORT || 5000);
  app.listen(port, process.env.HOST || "127.0.0.1", () => console.log(`API listening on port ${port}`));
}
