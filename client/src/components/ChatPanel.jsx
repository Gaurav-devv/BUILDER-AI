import { BotIcon, BotMessageSquareIcon, UserIcon } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import PromptInput from './PromptInput'

const ChatPanel = ({messages, onSend, loading}) => {

    const bottomRef = useRef(null)

    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior: "auto"})
    },[messages, loading])

  return (
    <div className="flex flex-col h-full" style={{background: 'transparent'}}>
         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
            {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                   <p className="text-xs text-center" style={{color: 'rgba(161,161,170,0.5)'}}>No messages yet.<br/>Your Python backend will populate chat here.</p> 
                </div>
            )}

            {messages.map((msg, i)=>(
                <div key={i}>
                    <div className="flex gap-2.5 items-start">
                        <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
                          style={{background: msg.role === 'user' ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.15)'}}>
                            {msg.role === "user" ? (
                                <UserIcon size={14} style={{color: 'rgba(161,161,170,0.7)'}}/>
                            ) : (
                                <BotMessageSquareIcon size={14} style={{color: '#a5b4fc'}}/>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                             <p className="text-[10px] font-medium mb-1 uppercase tracking-wider" style={{color: 'rgba(161,161,170,0.5)'}}>
                                {msg.role === "user" ? "You" : "AI"}
                            </p>
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap wrap-break-word" style={{color: '#d4d4d8'}}>
                                {msg.content}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            {loading && (
                <div className="flex gap-2.5 items-start">
                    <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
                      style={{background: 'rgba(99,102,241,0.15)'}}>
                        <BotIcon size={13} style={{color: '#a5b4fc'}}/>
                    </div>
                    <div className='flex-1'>
                        <p className="text-[10px] font-medium mb-2 uppercase tracking-wider" style={{color: 'rgba(161,161,170,0.5)'}}>AI</p>
                        <div className='dot-loader'>
                            <span style={{background: '#6366f1'}}></span>
                            <span style={{background: '#6366f1'}}></span>
                            <span style={{background: '#6366f1'}}></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={bottomRef}/>
         </div>

         {/* Input */}
         <div className="p-3 border-t" style={{borderColor: 'rgba(255,255,255,0.07)'}}>
            <PromptInput onSubmit={onSend} loading={loading} placeholder='Chat comes from your Python backend...' autoFocus/>
         </div>
    </div>
  )
}

export default ChatPanel