import { Router, type Request, type Response } from "express";
import { healthRouter } from "./health.js";
import { projectsRouter } from "./projects.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/projects", projectsRouter);

apiRouter.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

export { apiRouter };
