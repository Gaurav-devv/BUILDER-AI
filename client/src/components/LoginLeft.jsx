import React from 'react'
import { ShieldCheckIcon } from 'lucide-react'

const LoginLeft = () => {
  return (
    <div className="hidden lg:flex lg:w-2/5 bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat flex-col justify-between p-12 shrink-0 select-none">
        <div className='flex items-center gap-3'>
           <img src="/logo.svg" alt="Logo" className="size-9.5"/>
           <span className="text-4xl font-medium text-white">Builder AI</span>
        </div>
        <div>
            <h2 className='text-3xl text-white font-medium leading-snug mb-3 tracking-tight'>
              Private AI for<br/>Confidential Industrial Work
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              Builder AI keeps your sensitive engineering data inside your organization's
              infrastructure. Powered by local open-weight models — no data sent to cloud AI services.
            </p>

            {/* Features list */}
            <div className='mt-6 space-y-2'>
              {[
                'Local AI inference via Ollama',
                'No external AI API calls',
                'Secure on-premise architecture',
                'Built for industrial & enterprise use',
              ].map(f => (
                <div key={f} className='flex items-center gap-2 text-zinc-300 text-sm'>
                  <ShieldCheckIcon size={14} className='text-indigo-400 shrink-0'/>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <p className='text-zinc-400 text-sm mt-12'>Copyright {new Date().getFullYear()} Builder AI</p>
        </div>
    </div>
  )
}

export default LoginLeft