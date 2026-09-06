import { Project } from "../models/Project.js";
import crypto from "crypto";

function hashContent(content) {
    return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

// POST /api/projects
// Create a new project.
// Body: { name, description, files }
// The `files` object is optional — your Python AI backend can POST files later
// via PUT /api/projects/:id/files.
export async function createProject(req, res) {
    const { name, description, files } = req.body;

    if (!name || typeof name !== "string") {
        res.status(400).json({ error: "name is required" });
        return;
    }

    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // Build file map if files were supplied upfront
    const fileMap = {};
    if (files && typeof files === "object") {
        for (const [path, content] of Object.entries(files)) {
            if (typeof content === "string") {
                fileMap[path] = { content, hash: hashContent(content) };
            }
        }
    }

    const project = await Project.create({
        name,
        description: description || name,
        files: fileMap,
        messages: [],
        version: Object.keys(fileMap).length > 0 ? 1 : 0,
        owner: req.user.userId,
        status: "completed",
        filesPlanned: [],
        filesGenerated: Object.keys(fileMap),
        currentFile: null,
        error: null,
    });

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files)) {
        filesObj[path] = entry.content;
    }

    res.status(201).json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version,
        status: project.status,
        filesPlanned: project.filesPlanned,
        filesGenerated: project.filesGenerated,
        currentFile: project.currentFile,
        error: project.error,
        createdAt: project.createdAt,
    });
}

// GET /api/projects
// List all projects owned by the user (summary only, no file contents).
export async function listProjects(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const projects = await Project.find(
        { owner: req.user.userId },
        { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 }
    ).sort({ updatedAt: -1 });

    res.json(projects);
}

// GET /api/projects/:id
// Get full project details.
export async function getProject(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });

    if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
    }

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files)) {
        filesObj[path] = entry.content;
    }

    res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version,
        status: project.status,
        filesPlanned: project.filesPlanned,
        filesGenerated: project.filesGenerated,
        currentFile: project.currentFile,
        error: project.error,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    });
}

// DELETE /api/projects/:id
export async function deleteProject(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const result = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!result) {
        res.status(404).json({ error: "Project not found" });
        return;
    }
    res.json({ success: true });
}

// PUT /api/projects/:id/files
// Update project files (manual edits from Sandpack editor, or from Python backend).
export async function updateProjectFiles(req, res) {
    const { files } = req.body;
    if (!files || typeof files !== "object") {
        res.status(400).json({ error: "files object is required" });
        return;
    }

    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });

    if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
    }

    const newFiles = {};
    for (const [path, content] of Object.entries(files)) {
        if (typeof content === "string") {
            newFiles[path] = { content, hash: hashContent(content) };
        }
    }

    project.files = newFiles;
    project.filesGenerated = Object.keys(newFiles);
    project.version += 1;
    project.markModified("files");
    await project.save();

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files)) {
        filesObj[path] = entry.content;
    }

    res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    });
}

// POST /api/projects/:id/publish
export async function publishProject(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.userId },
        { published: true },
        { returnDocument: "after" }
    );

    if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
    }

    res.json({ success: true, published: project.published });
}

// GET /api/projects/public/:id
export async function getPublicProject(req, res) {
    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
    }

    if (!project.published) {
        res.status(403).json({ error: "Project is not published yet" });
        return;
    }

    const filesObj = {};
    for (const [path, entry] of Object.entries(project.files)) {
        filesObj[path] = entry.content;
    }

    res.json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        version: project.version,
    });
}
