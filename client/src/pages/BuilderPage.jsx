import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import BuilderHeader from '../components/BuilderHeader';
import { FolderTreeIcon, MessageSquareIcon } from 'lucide-react';
import ChatPanel from '../components/ChatPanel';
import FileExplorer from '../components/FileExplorer';
import PreviewPanel from '../components/PreviewPanel';
import PublishModal from '../components/PublishModal';
import api from '../api/api';
import toast from 'react-hot-toast';

const BuilderPage = () => {

  const { id } = useParams()
  const navigate = useNavigate()
  const [leftTab, setLeftTab] = useState("files");
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState(null);

  const {
    activeProject,
    loadingActiveProject,
    activeFile,
    showCode,
    setActiveFile,
    setShowCode,
    loadProject,
    logout,
  } = useAppContext();

  useEffect(() => {
    if (!id) return;
    loadProject(id);
  }, [id]);

  const handleOpenPreview = () => {
    if (!id) return;
    window.open(`/preview/${id}`, "_blank");
  };

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`;
      setPublishUrl(url);
      toast.success("Project published successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loadingActiveProject || !activeProject) {
    return <Loading />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f14 0%, #13131a 50%, #0d1117 100%)' }}>

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
      </div>

      {/* Top Bar */}
      <div className="relative z-20">
        <BuilderHeader
          projectName={activeProject.name}
          version={activeProject.version}
          showCode={showCode}
          publishing={publishing}
          onToggleShowCode={() => setShowCode(!showCode)}
          onOpenPreview={handleOpenPreview}
          onPublish={handlePublish}
          onBack={() => navigate("/")}
          onLogout={logout}
        />
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10 builder-layout">

        {/* Left Sidebar */}
        <div className="w-[300px] shrink-0 flex flex-col border-r builder-sidebar"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>

          {/* Tabs */}
          <div className="flex border-b builder-sidebar-tabs" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <button
              onClick={() => setLeftTab("chat")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer transition-colors"
              style={{
                color: leftTab === "chat" ? '#e4e4e7' : 'rgba(161,161,170,0.6)',
                borderBottom: leftTab === "chat" ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              <MessageSquareIcon size={13} /> Chat
            </button>
            <button
              onClick={() => setLeftTab("files")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer transition-colors"
              style={{
                color: leftTab === "files" ? '#e4e4e7' : 'rgba(161,161,170,0.6)',
                borderBottom: leftTab === "files" ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              <FolderTreeIcon size={13} /> Files
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden builder-sidebar-content">
            {leftTab === "chat" ? (
              <ChatPanel
                messages={activeProject.messages || []}
                loading={false}
              />
            ) : (
              <FileExplorer
                files={activeProject.files}
                activeFile={activeFile}
                onFileSelect={(path) => {
                  setActiveFile(path);
                  setShowCode(true);
                }}
              />
            )}
          </div>
        </div>

        {/* Preview / Code Area */}
        <div className="flex-1 overflow-hidden rounded-tl-lg builder-preview-area"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <PreviewPanel
            project={activeProject}
            activeFile={activeFile}
            showCode={showCode}
          />
        </div>
      </div>

      {publishUrl && <PublishModal publishUrl={publishUrl} onClose={() => setPublishUrl(null)} />}
    </div>
  );
};

export default BuilderPage;