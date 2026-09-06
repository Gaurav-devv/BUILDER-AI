import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, ClockIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import moment from "moment"

const HomePage = () => {

  const navigate = useNavigate()
  const { user, projects, loadingProjects, loadProjects, handleDelete, logout } = useAppContext()

  // Simple state for the "New Project" modal
  const [showNewProject, setShowNewProject] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const { handleCreateProject } = useAppContext()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await handleCreateProject({ name: newName.trim(), description: newDesc.trim() })
    setShowNewProject(false)
    setNewName("")
    setNewDesc("")
  }

  return (
    <div className="h-screen overflow-y-scroll text-white font-sans bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat">
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="size-6" />
          <span className="text-xl font-semibold tracking-tight">Builder AI</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
          <span>{user?.name}</span>
          <button
            onClick={logout}
            className="py-1.5 px-3 border border-white/20 text-white hover:bg-white/10 text-xs rounded-md cursor-pointer bg-transparent"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 mt-8 xl:mt-28">
        <div className="w-full max-w-2xl flex flex-col items-center">

          {/* Badge */}
          <div className="flex items-center gap-2 p-1.5 pr-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[13px] text-white/90">
            <span className="px-3 py-1 text-[11px] bg-indigo-600 rounded-full font-medium tracking-wider">BUILDER AI</span>
            <span>Sovereign on-premise AI workbench for industrial work.</span>
          </div>

          {/* Title */}
          <h1 className="text-center text-4xl md:text-6xl font-medium mt-4 max-w-2xl text-white">
            Builder AI<br />Workbench
          </h1>
          <p className="text-center text-sm md:text-base max-w-xl mt-4 text-white/65 leading-relaxed">
            Private AI for confidential industrial work. Powered by local open-weight models via Ollama.<br/>Your data stays inside your infrastructure — always.
          </p>

          {/* New Project Button */}
          <button
            onClick={() => setShowNewProject(true)}
            className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
          >
            <PlusIcon size={16} />
            New Project
          </button>

          {/* New Project Modal */}
          {showNewProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <form
                onSubmit={handleCreate}
                className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <h2 className="text-white text-lg font-semibold mb-4">New Project</h2>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Project name *"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 mb-3 outline-none focus:border-white/30"
                />
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 mb-4 outline-none focus:border-white/30 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="flex-1 py-2.5 rounded-lg border border-white/10 text-zinc-300 text-sm hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-white/90 transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Projects List */}
          {!loadingProjects && projects.length > 0 && (
            <div className="mt-12 w-full">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <p className="text-xs font-medium uppercase text-zinc-100 tracking-widest">Projects</p>
                <span className="text-xs text-zinc-100 font-normal">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {projects.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between group hover:border-white/20 hover:bg-white/10 cursor-pointer backdrop-blur-md transition-all"
                    onClick={() => navigate(`/workbench/${p._id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-zinc-300 flex items-center gap-1">
                          <ClockIcon size={10} />
                          {moment(p.updatedAt || p.createdAt).fromNow()}
                        </span>
                        <span className="text-xs text-white/60 font-medium">v{p.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p._id);
                        }}
                        className="p-1.5 rounded-md text-zinc-200 hover:text-red-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2Icon size={14} />
                      </button>
                      <ArrowRightIcon size={14} className="text-zinc-200 group-hover:text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingProjects && projects.length === 0 && (
            <p className="mt-16 text-zinc-500 text-sm">No projects yet. Create one to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;