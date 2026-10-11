import { Router } from "express";
import { pingPong } from "../controllers/tester";
import authRoutes from "./auth.routes";
import AIRoutes from "./ai.routes";
import documentRoutes from "./document.routes";
import autocompletionRoutes from "./autocompletion.routes";
import adminRoutes from "./admin.routes";
import creditRoutes from "./credit.routes";
import analyticsRoutes from "./analytics.routes";

const AppRoot = Router();

AppRoot.get("/ping", pingPong);

AppRoot.use("/auth", authRoutes);
AppRoot.use("/ai/", AIRoutes);
AppRoot.use("/documents", documentRoutes);
AppRoot.use("/autocompletion", autocompletionRoutes);
AppRoot.use("/admin", adminRoutes);
AppRoot.use("/credits", creditRoutes);
AppRoot.use("/analytics", analyticsRoutes);


export default AppRoot;
