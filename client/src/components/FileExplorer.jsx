import { FileCodeIcon, FileTextIcon, FolderOpenIcon } from 'lucide-react';
import React, { useMemo } from 'react'

function buildTree(paths){
    const root = [];
    for (const filePath of paths.sort()) {
        const parts = filePath.split("/").filter(Boolean)
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const name = parts[i];
            const isLast = i === parts.length - 1;
            const fullPath = "/" + parts.slice(0, i + 1).join("/");
            let existing = current.find((n)=>n.name === name)
            if(!existing){
               existing = {
                name,
                path: fullPath,
                isDir: !isLast,
                children: [],
               } ;
               current.push(existing);
            }
            current = existing.children;
        }
    }
    return root;
}

function getFileIcon(name){
    if(name.endsWith(".css")) return <FileTextIcon size={14} className="text-sky-400"/>;
    if(name.endsWith(".jsx") || name.endsWith(".js")) return <FileCodeIcon size={14} className="text-amber-400"/>;
    if(name.endsWith(".json")) return <FileTextIcon size={14} className="text-emerald-400"/>;
    return <FileTextIcon size={14} className="text-zinc-500" />;
}

function TreeItem({node, activeFile, onFileSelect, depth = 0 }){
    const isActive = node.path === activeFile;

    if(node.isDir){
        return (
            <div>
                <div className="flex items-center gap-2 py-1 px-2 text-xs select-none" 
                style={{paddingLeft: `${depth * 12 + 8}px`, color: 'rgba(161,161,170,0.6)'}}>
                    <FolderOpenIcon size={14} style={{color: 'rgba(161,161,170,0.5)'}}/>
                    <span>{node.name}</span>
                </div>
                {node.children.map((child)=>(
                    <TreeItem key={child.path} node={child} activeFile={activeFile} onFileSelect={onFileSelect} depth={depth + 1}/>
                ))}
            </div>
        )
    }

    return (
        <button onClick={()=> onFileSelect(node.path)} 
        className="w-full flex items-center gap-2 py-1.5 px-2 text-xs transition-colors rounded-md cursor-pointer"
        style={{
            paddingLeft: `${depth * 12 + 8}px`,
            background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
            color: isActive ? '#a5b4fc' : 'rgba(161,161,170,0.75)',
            fontWeight: isActive ? 600 : 400,
        }}
        onMouseEnter={e => { if(!isActive){ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#e4e4e7' }}}
        onMouseLeave={e => { if(!isActive){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(161,161,170,0.75)' }}}>
            {getFileIcon(node.name)}
            <span className='truncate'>{node.name}</span>
        </button>
    )
}

const FileExplorer = ({files, activeFile, onFileSelect }) => {

    const tree = useMemo(()=> buildTree(Object.keys(files)), [files])
  return (
    <div className="py-2 overflow-y-auto hide-scrollbar h-full">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{color: 'rgba(161,161,170,0.4)'}}>Files</p>
            {tree.map((node)=>(
                <TreeItem key={node.path} node={node} activeFile={activeFile} onFileSelect={onFileSelect}/>
            ))}
    </div>
  )
}

export default FileExplorer