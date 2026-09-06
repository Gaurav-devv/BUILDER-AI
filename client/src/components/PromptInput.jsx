import React, { useEffect, useRef, useState } from 'react'
import {ArrowRightIcon, CloudUploadIcon, Loader2Icon, MicIcon} from 'lucide-react'

const PromptInput = ({onSubmit, loading = false, placeholder = "Describe the website you want to build...", large = false, autoFocus = false, variant = "default"}) => {

    const [value, setValue] = useState("");
    const textareaRef = useRef(null)

    useEffect(()=>{
        if(autoFocus && textareaRef.current){
            textareaRef.current.focus();
        }
    },[autoFocus])

    const handleSubmit = (e)=>{
        if(e) e.preventDefault()
        const trimmed = value.trim()
        if(!trimmed || loading) return;
        onSubmit(trimmed)
        setValue("")
    }

    const handleKeyDown = (e)=>{
        if(e.key === "Enter" &&  !e.shiftKey){
            e.preventDefault();
            handleSubmit()
        }
    }

if(variant === "glass"){
    return (
        <form onSubmit={handleSubmit} className='max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-xl ring-1 ring-white/25 focus-within:ring-2 focus-within:ring-white/30 overflow-hidden mt-6 transition'>

            <textarea ref={textareaRef} value={value} onChange={(e)=>setValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={loading}
                rows={3} className='w-full p-4 pb-2 resize-none placeholder:text-white/60 outline-none bg-transparent text-white text-base'/>

            <div className='flex items-center justify-between pb-3 px-3 gap-2'>
                <label htmlFor="file" className="border border-white/20 text-white/80 hover:text-white hover:border-white/30 p-1.5 rounded-md cursor-pointer flex items-center justify-center">
                    <input type="file" id='file' hidden/>
                    <CloudUploadIcon size={18}/>
                </label>
                <div className='flex items-center justify-end gap-2'>
                    <button type='button' className="flex items-center justify-center p-1 text-white/70 hover:text-white cursor-pointer">
                        <MicIcon size={18}/>
                    </button>

                    <button type='submit' 
                    disabled={!value.trim() || loading}
                    className="flex items-center justify-center p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer">
                        {loading ? <Loader2Icon size={18} className="animate-spin"/> : <ArrowRightIcon size={18}/>}
                    </button>
                </div>
            </div>

        </form>
    )
}

  return (
    <div className={`bg-[#18181b] border border-white/10 rounded-2xl flex flex-col focus-within:ring-1 focus-within:ring-indigo-500/50 transition shadow-sm ${large ? "p-4" : "p-3"}`}>

        <textarea ref={textareaRef} 
        value={value} 
        onChange={(e)=>setValue(e.target.value)} 
        onKeyDown={handleKeyDown} 
        placeholder={placeholder} 
        disabled={loading}
        rows={large ? 5 : Math.max(1, Math.min(5, value.split('\n').length))} 
        className={`w-full bg-transparent border-none outline-none resize-none text-zinc-200 placeholder:text-zinc-500 mb-2 ${large ? "text-base" : "text-[13px]"}`}/>

        <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
                <button type="button" className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-full transition-colors cursor-pointer" title="Attach file">
                    <CloudUploadIcon size={16}/>
                </button>
                <button type="button" className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-full transition-colors cursor-pointer" title="Voice input">
                    <MicIcon size={16}/>
                </button>
            </div>

            <button
            onClick={()=> handleSubmit()}
            disabled={!value.trim() || loading}
            className='inline-flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer rounded-full shrink-0 transition-colors'
            style={{
                width: large ? 36 : 28,
                 height: large ? 36 : 28,
            }}>
                {loading ? <Loader2Icon size={large ? 20 : 14} className="animate-spin"/> : <ArrowRightIcon size={large ? 20 : 14}/>}
            </button>
        </div>
    </div>
  )
}

export default PromptInput