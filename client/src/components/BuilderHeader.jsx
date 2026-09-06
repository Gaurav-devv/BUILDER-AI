import { ArrowLeftIcon, Code2Icon, ExternalLinkIcon, EyeIcon, GlobeIcon, Loader2Icon, MenuIcon, XIcon, MessageSquareIcon } from 'lucide-react'
import React, { useState } from 'react'

const BuilderHeader = ({
    projectName,
    version,
    showCode,
    publishing,
    onToggleShowCode,
    onOpenPreview,
    onPublish,
    onBack,
    onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>

      {/* Left — logo + project name */}
      <div className="flex items-center gap-2">
        <button onClick={onBack}
          className="p-1.5 rounded-md transition-colors cursor-pointer"
          style={{ color: 'rgba(161,161,170,0.7)' }}
          onMouseEnter={e => { e.currentTarget.style.color='#e4e4e7'; e.currentTarget.style.background='rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color='rgba(161,161,170,0.7)'; e.currentTarget.style.background='transparent' }}>
          <ArrowLeftIcon size={15} />
        </button>

        <img src="/logo.svg" alt="" className="size-5 opacity-80" style={{ filter: 'invert(1) brightness(0.9)' }} />

        <span className="text-sm font-semibold truncate max-w-38 md:max-w-52 text-zinc-200">{projectName}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
          v{version}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">

        {/* Mobile Open Preview */}
        <button onClick={onOpenPreview}
          className="md:hidden inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg cursor-pointer transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#e4e4e7' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#a1a1aa' }}>
          <ExternalLinkIcon size={13} /> Preview
        </button>

        {/* Hamburger Menu Toggle (Mobile) */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors">
          {mobileMenuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
        </button>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1.5">
          <button onClick={onToggleShowCode}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg cursor-pointer transition-all"
            style={{
              background: showCode ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
              border: showCode ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: showCode ? '#a5b4fc' : '#a1a1aa',
            }}
            onMouseEnter={e => e.currentTarget.style.background = showCode ? 'rgba(99,102,241,0.28)' : 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = showCode ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}>
            {showCode ? <><EyeIcon size={13}/> Preview</> : <><Code2Icon size={13}/> Code</>}
          </button>

          <button onClick={onOpenPreview}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#e4e4e7' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#a1a1aa' }}>
            <ExternalLinkIcon size={13} /> Open Preview
          </button>

          <button onClick={onPublish} disabled={publishing}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}
            onMouseEnter={e => { if(!publishing){ e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#e4e4e7' }}}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#a1a1aa' }}>
            {publishing ? <Loader2Icon size={13} className="animate-spin" /> : <GlobeIcon size={13} />} Publish
          </button>

          <button onClick={onLogout}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg cursor-pointer transition-all ml-1"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.2)'; e.currentTarget.style.color='#fca5a5' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#f87171' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[48px] right-2 w-48 bg-[#13131a] border border-white/10 rounded-lg p-2 flex flex-col gap-2 z-50 shadow-xl">
          <button onClick={() => { onToggleShowCode(); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 w-full py-2 px-3 text-sm font-medium rounded-md text-zinc-300 hover:bg-white/5 transition-colors">
            {showCode ? <><EyeIcon size={15}/> Preview</> : <><Code2Icon size={15}/> Code</>}
          </button>
          
          <button onClick={() => { onOpenPreview(); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 w-full py-2 px-3 text-sm font-medium rounded-md text-zinc-300 hover:bg-white/5 transition-colors">
            <ExternalLinkIcon size={15} /> Open Preview
          </button>
          
          <button onClick={() => { onPublish(); setMobileMenuOpen(false); }} disabled={publishing}
            className="flex items-center gap-2 w-full py-2 px-3 text-sm font-medium rounded-md text-zinc-300 hover:bg-white/5 transition-colors">
            {publishing ? <Loader2Icon size={15} className="animate-spin" /> : <GlobeIcon size={15} />} Publish
          </button>

          <div className="h-px w-full bg-white/10 my-1"></div>

          <button onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 w-full py-2 px-3 text-sm font-medium rounded-md text-red-400 hover:bg-red-500/10 transition-colors">
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}

export default BuilderHeader