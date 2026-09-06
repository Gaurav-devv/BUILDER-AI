import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import { FolderTreeIcon, MessageSquareIcon, BotIcon, UserIcon, BotMessageSquareIcon, Loader2Icon, ArrowLeftIcon, ShieldCheckIcon, WifiOffIcon } from 'lucide-react';
import FileExplorer from '../components/FileExplorer';
import PromptInput from '../components/PromptInput';
import toast from 'react-hot-toast';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className="flex gap-2.5 items-start">
      <div
        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
        style={{ background: isUser ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.15)' }}
      >
        {isUser
          ? <UserIcon size={13} style={{ color: 'rgba(161,161,170,0.7)' }} />
          : <BotMessageSquareIcon size={13} style={{ color: '#a5b4fc' }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'rgba(161,161,170,0.5)' }}>
          {isUser ? 'You' : 'Builder AI'}
        </p>
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: '#d4d4d8' }}>
          {msg.content}
        </p>
      </div>
    </div>
  );
}

// ── Local AI status pill ────────────────────────────────────────────────────
function LocalAIBadge({ connected }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest"
      style={{
        background: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${connected ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
        color: connected ? '#4ade80' : '#f87171',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: connected ? '#22c55e' : '#ef4444', boxShadow: connected ? '0 0 4px #22c55e' : 'none' }}
      />
      {connected ? 'Local AI · Online' : 'Local AI · Offline'}
    </div>
  );
}

// ── Main WorkbenchPage ──────────────────────────────────────────────────────
const WorkbenchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leftTab, setLeftTab] = useState('chat'); // chat opens by default
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiConnected, setAiConnected] = useState(null); // null = checking
  const bottomRef = useRef(null);

  const {
    activeProject,
    loadingActiveProject,
    activeFile,
    setActiveFile,
    loadProject,
    logout,
  } = useAppContext();

  // Load project on mount
  useEffect(() => {
    if (!id) return;
    loadProject(id);
  }, [id]);

  // Auto-open chat (already default, but explicit for clarity)
  useEffect(() => {
    setLeftTab('chat');
  }, []);

  // Check AI service availability on mount
  useEffect(() => {
    const checkAI = async () => {
      try {
        const res = await fetch(`${AI_SERVICE_URL}/api/ai/status`);
        const data = await res.json();
        setAiConnected(data.ollama_connected === true);
      } catch {
        setAiConnected(false);
      }
    };
    checkAI();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Send message to FastAPI → Ollama
  const handleSend = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `AI service error (${res.status})`);
      }

      const data = await res.json();
      const aiMsg = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMsg]);
      setAiConnected(true);
    } catch (err) {
      const errMsg = err.message || 'Local AI is unavailable.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ ${errMsg}` }]);
      if (err.message?.includes('unavailable') || err.message?.includes('fetch')) {
        setAiConnected(false);
        toast.error('Local AI is unavailable. Please start Ollama.');
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingActiveProject || !activeProject) {
    return <Loading />;
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f14 0%, #13131a 50%, #0d1117 100%)' }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="h-12 shrink-0 flex items-center justify-between px-3 relative z-20"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-md transition-colors cursor-pointer"
            style={{ color: 'rgba(161,161,170,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e4e4e7'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(161,161,170,0.7)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <ArrowLeftIcon size={15} />
          </button>

          <img src="/logo.svg" alt="" className="size-5 opacity-80" style={{ filter: 'invert(1) brightness(0.9)' }} />

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-200 leading-tight">
              {activeProject.name}
            </span>
            <span className="text-[9px] text-zinc-500 leading-tight hidden md:block">Builder AI Workbench</span>
          </div>

          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium hidden md:inline"
            style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            v{activeProject.version}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {aiConnected !== null && <LocalAIBadge connected={aiConnected} />}
          <button
            onClick={logout}
            className="hidden md:inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg cursor-pointer transition-all ml-1"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main Layout ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* ── Left Sidebar ──────────────────────────────────────────────── */}
        <div
          className="builder-sidebar flex flex-col w-full md:w-[300px] md:shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          {/* Tabs */}
          <div className="flex border-b builder-sidebar-tabs" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <button
              onClick={() => setLeftTab('chat')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer transition-colors"
              style={{
                color: leftTab === 'chat' ? '#e4e4e7' : 'rgba(161,161,170,0.6)',
                borderBottom: leftTab === 'chat' ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              <MessageSquareIcon size={13} /> Chat
            </button>
            <button
              onClick={() => setLeftTab('files')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer transition-colors"
              style={{
                color: leftTab === 'files' ? '#e4e4e7' : 'rgba(161,161,170,0.6)',
                borderBottom: leftTab === 'files' ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              <FolderTreeIcon size={13} /> Files
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-hidden flex flex-col builder-sidebar-content">
            {leftTab === 'chat' ? (
              // ── Chat Panel ────────────────────────────────────────────
              <div className="flex flex-col h-full" style={{ background: 'transparent' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4 hide-scrollbar">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
                      >
                        <BotIcon size={22} style={{ color: '#a5b4fc' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-300 mb-1">Builder AI</p>
                        <p className="text-xs text-center leading-relaxed" style={{ color: 'rgba(161,161,170,0.5)' }}>
                          On-premise AI assistant.<br />
                          Your data stays local.
                        </p>
                      </div>

                      {/* AI offline warning */}
                      {aiConnected === false && (
                        <div
                          className="flex items-start gap-2 p-3 rounded-lg text-xs w-full"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                        >
                          <WifiOffIcon size={13} className="shrink-0 mt-0.5" />
                          <span>
                            Local AI is offline. Start Ollama and make sure your model is pulled.<br />
                            <code className="text-red-300 text-[10px]">ollama pull qwen3:8b</code>
                          </span>
                        </div>
                      )}

                      {/* Sovereignty badge */}
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}
                      >
                        <ShieldCheckIcon size={11} />
                        No data leaves your infrastructure
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} />
                  ))}

                  {loading && (
                    <div className="flex gap-2.5 items-start">
                      <div
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
                        style={{ background: 'rgba(99,102,241,0.15)' }}
                      >
                        <BotIcon size={13} style={{ color: '#a5b4fc' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(161,161,170,0.5)' }}>
                          Builder AI
                        </p>
                        <div className="dot-loader">
                          <span style={{ background: '#6366f1' }} />
                          <span style={{ background: '#6366f1' }} />
                          <span style={{ background: '#6366f1' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <PromptInput
                    onSubmit={handleSend}
                    loading={loading}
                    placeholder="Ask anything — engineering, analysis, documents..."
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              // ── File Explorer ─────────────────────────────────────────
              <FileExplorer
                files={activeProject.files}
                activeFile={activeFile}
                onFileSelect={(path) => setActiveFile(path)}
              />
            )}
          </div>
        </div>

        {/* ── Right: Workbench Info Panel (desktop only) ────────────────── */}
        <div
          className="hidden md:flex flex-col flex-1 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.01)' }}
        >
          {/* Info area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">

            {/* Status card */}
            <div
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(161,161,170,0.5)' }}>
                System Status
              </p>
              <div className="space-y-2.5">
                {[
                  { label: 'AI Inference', value: 'Local · On-Premise', ok: true },
                  { label: 'Runtime', value: 'Ollama', ok: true },
                  { label: 'External AI Calls', value: '0', ok: true },
                  { label: 'Cloud LLM Calls', value: '0', ok: true },
                  { label: 'Ollama Model', value: 'Local Open-Weight LLM', ok: aiConnected },
                ].map(({ label, value, ok }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span style={{ color: 'rgba(161,161,170,0.6)' }}>{label}</span>
                    <span
                      className="flex items-center gap-1.5 font-medium"
                      style={{ color: ok ? '#4ade80' : ok === false ? '#f87171' : '#a5b4fc' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: ok ? '#22c55e' : ok === false ? '#ef4444' : '#6366f1' }}
                      />
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture diagram */}
            <div
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(161,161,170,0.5)' }}>
                Request Flow
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Browser', sub: 'React Frontend' },
                  { label: 'FastAPI', sub: 'AI Service · Port 8000' },
                  { label: 'Ollama', sub: 'Local Runtime · Port 11434' },
                  { label: 'Local Model', sub: 'Open-Weight LLM' },
                ].map((item, i, arr) => (
                  <div key={item.label}>
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
                    >
                      <span className="font-semibold" style={{ color: '#a5b4fc' }}>{item.label}</span>
                      <span style={{ color: 'rgba(161,161,170,0.5)' }}>{item.sub}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <span style={{ color: 'rgba(161,161,170,0.25)' }}>↓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-center leading-relaxed max-w-xs" style={{ color: 'rgba(161,161,170,0.3)' }}>
              Builder AI brings AI into your organization's environment.<br />
              Sensitive data never leaves your infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkbenchPage;
