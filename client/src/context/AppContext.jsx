import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  // Auth states
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Project states
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(true);
  const [activeFile, setActiveFile] = useState("/App.js");
  const [showCode, setShowCode] = useState(false);

  // ─── Auth ───────────────────────────────────────────────────────────────────

  const checkSession = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const errMsg = err?.response?.data?.error || "Invalid email or password";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", { name, email, password });
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      const errMsg = err?.response?.data?.error || "Registration failed";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      setProjects([]);
      setActiveProject(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // ─── Projects ────────────────────────────────────────────────────────────────

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/api/projects");
      setProjects(data);
    } catch {
      toast.error("Failed to load projects list");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  const loadProject = useCallback(
    async (id, silent = false) => {
      if (!user) return;
      if (!silent) setLoadingActiveProject(true);
      try {
        const { data } = await api.get(`/api/projects/${id}`);
        setActiveProject(data);
        const files = Object.keys(data.files || {});
        if (files.length > 0) {
          setActiveFile((prev) => {
            if (files.includes(prev)) return prev;
            if (files.includes("/App.js")) return "/App.js";
            return files[0];
          });
        }
      } catch {
        if (!silent) {
          toast.error("Failed to load project details");
          navigate("/");
        }
      } finally {
        if (!silent) setLoadingActiveProject(false);
      }
    },
    [user, navigate]
  );

  // Create a new project (name + optional pre-built files).
  // Your Python backend can call POST /api/projects with files already generated,
  // or create an empty project and push files later via PUT /api/projects/:id/files.
  const handleCreateProject = useCallback(
    async ({ name, description, files }) => {
      if (!user) return;
      try {
        const { data } = await api.post("/api/projects", { name, description, files });
        toast.success("Project created!");
        navigate(`/builder/${data._id}`);
        return data;
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to create project");
      }
    },
    [navigate, user]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await api.delete(`/api/projects/${id}`);
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("Project deleted");
      } catch {
        toast.error("Failed to delete project");
      }
    },
    [user]
  );

  // Auto-save file edits from the Sandpack editor (debounced, 1 s)
  const debouncedSave = useMemo(
    () =>
      debounce(async (files, id) => {
        try {
          await api.put(`/api/projects/${id}/files`, { files });
        } catch {
          toast.error("Failed to save code modifications");
        }
      }, 1000),
    []
  );

  useEffect(() => {
    return () => { debouncedSave.flush(); };
  }, [debouncedSave]);

  const updateProjectFiles = useCallback(
    async (files) => {
      if (!activeProject || !user) return;
      debouncedSave(files, activeProject._id);
    },
    [activeProject, user, debouncedSave]
  );

  return (
    <AppContext.Provider
      value={{
        // auth
        user,
        loadingUser,
        login,
        register,
        logout,
        // projects
        projects,
        loadingProjects,
        activeProject,
        loadingActiveProject,
        activeFile,
        showCode,
        setActiveFile,
        setShowCode,
        loadProjects,
        loadProject,
        handleCreateProject,
        handleDelete,
        updateProjectFiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
