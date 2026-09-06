import { Router } from "express";
import {
    createProject,
    deleteProject,
    getProject,
    getPublicProject,
    listProjects,
    publishProject,
    updateProjectFiles,
} from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const projectRouter = Router();

// Public route
projectRouter.get("/public/:id", getPublicProject);

// Protect all following routes
projectRouter.use(authMiddleware);

projectRouter.post("/", createProject);
projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProject);
projectRouter.delete("/:id", deleteProject);
projectRouter.put("/:id/files", updateProjectFiles);
projectRouter.post("/:id/publish", publishProject);

// NOTE: Chat / revision endpoint removed.
// Your Python/Ollama backend should call PUT /api/projects/:id/files
// to push AI-generated or revised file contents.

export default projectRouter;