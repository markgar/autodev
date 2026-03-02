import { Router, Request, Response } from "express";
import { healthRouter } from "./health.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);

apiRouter.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

export { apiRouter };
