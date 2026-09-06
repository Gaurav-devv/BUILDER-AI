import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from '@codesandbox/sandpack-react'
import { detectDependencies, sanitizeFilesForSandpack } from '../utils/sandpackUtils';
import { useAppContext } from '../context/AppContext';
import SandpackErrorMonitor from './SandpackErrorMonitor';
import { RefreshCwIcon, LockIcon, MonitorIcon } from 'lucide-react';

// Watches for file edits inside Sandpack editor and saves changes to DB & live state
function SandpackFileWatcher({ onLiveFilesChange }) {
    const { sandpack } = useSandpack();
    const { files } = sandpack;
    const { activeProject, updateProjectFiles } = useAppContext();
    const activeProjectRef = useRef(activeProject);

    useEffect(() => {
        activeProjectRef.current = activeProject;
    }, [activeProject]);

    useEffect(() => {
        const project = activeProjectRef.current;
        if (!project) return;

        const updatedFiles = {};
        let hasChanges = false;

        for (const [path, fileObj] of Object.entries(files)) {
            const fileCode = fileObj.code;
            updatedFiles[path] = fileCode;
            const originalContent =
                typeof project.files[path] === "string"
                    ? project.files[path]
                    : project.files[path]?.content;
            if (originalContent !== undefined && originalContent !== fileCode) {
                hasChanges = true;
            }
        }

        onLiveFilesChange(updatedFiles);
        if (hasChanges) {
            updateProjectFiles(updatedFiles);
        }
    }, [files]);

    return null;
}

// Fake browser chrome bar above the preview iframe
function BrowserChrome({ onRefresh }) {
    return (
        <div className="flex items-center gap-2 px-3 h-9 shrink-0 select-none"
            style={{
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', opacity: 0.7 }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b', opacity: 0.7 }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e', opacity: 0.7 }} />
            </div>

            {/* URL bar */}
            <div className="flex-1 flex items-center gap-1.5 px-2.5 h-5 rounded-md mx-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <LockIcon size={9} style={{ color: 'rgba(161,161,170,0.5)', flexShrink: 0 }} />
                <span className="text-[10px] truncate" style={{ color: 'rgba(161,161,170,0.5)' }}>
                    localhost · preview
                </span>
            </div>

            {/* Refresh */}
            <button onClick={onRefresh}
                className="p-1 rounded cursor-pointer transition-colors"
                style={{ color: 'rgba(161,161,170,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#e4e4e7'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(161,161,170,0.5)'}>
                <RefreshCwIcon size={11} />
            </button>

            <MonitorIcon size={12} style={{ color: 'rgba(161,161,170,0.25)', marginLeft: 2 }} />
        </div>
    );
}

const PreviewPanel = ({ project, activeFile, showCode }) => {
    const [showErrorOverlay, setShowErrorOverlay] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [liveFiles, setLiveFiles] = useState(project.files);
    const [prevProjectKey, setPrevProjectKey] = useState(`${project._id}-${project.version}`);

    const currentKey = `${project._id}-${project.version}`;
    if (prevProjectKey !== currentKey) {
        setPrevProjectKey(currentKey);
        setLiveFiles(project.files);
    }

    const handleLiveFilesChange = (newFiles) => {
        setLiveFiles((prev) => {
            let changed = false;
            for (const [p, code] of Object.entries(newFiles)) {
                if (prev[p] !== code) { changed = true; break; }
            }
            return changed ? newFiles : prev;
        });
    };

    const sandpackFiles = useMemo(() => {
        const spFiles = {};
        for (const [path, content] of Object.entries(liveFiles)) {
            const fileCode = typeof content === "string" ? content : content?.content || "";
            spFiles[path] = { code: fileCode, active: path === activeFile };
        }
        return sanitizeFilesForSandpack(spFiles);
    }, [liveFiles, activeFile]);

    const dependencies = useMemo(() => detectDependencies(liveFiles), [liveFiles]);

    return (
        <div className="h-full w-full flex flex-col" style={{ background: 'transparent' }}>
            <SandpackProvider
                key={`${project._id}-${refreshKey}`}
                template="react"
                files={sandpackFiles}
                customSetup={{ dependencies }}
                options={{
                    externalResources: [
                        "https://cdn.tailwindcss.com",
                        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
                    ],
                    classes: {
                        "sp-wrapper": "sp-wrapper",
                        "sp-layout": "sp-layout",
                        "sp-preview": "sp-preview",
                    },
                    logLevel: 0,
                }}
                theme={{
                    colors: {
                        // Dark IDE palette
                        surface1: "#0f0f14",      // editor bg
                        surface2: "#13131a",      // tabs / header bg
                        surface3: "#1c1c26",      // selected tab / hover
                        clickable: "#71717a",     // icons, inactive text
                        base: "#d4d4d8",          // main text
                        disabled: "#52525b",
                        hover: "#e4e4e7",
                        accent: "#6366f1",        // indigo accent (cursor, selection)
                        error: "#f87171",
                        errorSurface: "#1a0f0f",
                    },
                    font: {
                        body: "'Urbanist', system-ui, -apple-system, sans-serif",
                        mono: "'Geist Mono', ui-monospace, monospace",
                        size: "13px",
                        lineHeight: "1.65",
                    },
                }}
            >
                <SandpackFileWatcher onLiveFilesChange={handleLiveFilesChange} />
                <SandpackErrorMonitor onErrorChange={setShowErrorOverlay} />

                <SandpackLayout style={{ height: "100%", border: "none", borderRadius: 0, background: "transparent" }}>

                    {/* Code editor pane */}
                    {showCode && (
                        <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
                            <SandpackCodeEditor
                                showTabs
                                showLineNumbers
                                showInlineErrors
                                wrapContent
                                style={{ height: "100%", flex: 1, minWidth: 0 }}
                            />
                        </div>
                    )}

                    {/* Preview pane with fake browser chrome */}
                    <div style={{ flex: showCode ? 1 : 2, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                        <BrowserChrome onRefresh={() => setRefreshKey(k => k + 1)} />

                        {/* iframe wrapper — white background is intentional here (renders the user's website) */}
                        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                            <SandpackPreview
                                showNavigator={false}
                                showRefreshButton={false}
                                showOpenInCodeSandbox={false}
                                showSandpackErrorOverlay={showErrorOverlay}
                                style={{ height: "100%", width: "100%" }}
                            />
                        </div>
                    </div>

                </SandpackLayout>
            </SandpackProvider>
        </div>
    );
};

export default PreviewPanel;