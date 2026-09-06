import React, { useState } from 'react'
import LoginLeft from '../components/LoginLeft';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AuthPage = ({ mode }) => {

  const { login, register } = useAppContext()
  const navigate = useNavigate()

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      navigate("/")
    } catch (err) {
      setError(err.message || (mode === "login" ? "Invalid email or password" : "Registration failed"));
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-[#f6fefd] auth-page-wrapper">
      {/* Left Panel - Branding (Desktop only) */}
      <LoginLeft />

      {/* Right Panel - Form Wrapper */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        
        {/* ========================================================== */}
        {/* MOBILE VIEW (Dark Theme) - Only visible < 768px            */}
        {/* ========================================================== */}
        <div className="w-full max-w-md relative z-10 md:hidden text-zinc-200">
          
          {/* Ambient background glows */}
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-10 rounded-2xl border border-white/[0.08] shadow-2xl relative z-10">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-medium tracking-tight text-white mb-2 font-sans">
                  {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className='text-sm text-zinc-400'>
                {isLogin ? "Enter your credentials to access your AI workbench." : "Join Builder AI — your on-premise AI workbench."}
              </p>
            </div>

            {error && <div className='mb-6 p-3 border border-red-500/20 bg-red-500/10 text-red-400 text-xs rounded-lg text-center'>{error}</div>}

            <form className='space-y-5' onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
                    Full Name
                  </label>
                  <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required 
                    className='w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm text-zinc-100 bg-black/20 placeholder-zinc-600 transition-all' 
                    placeholder='John Doe'/>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required 
                  className='w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm text-zinc-100 bg-black/20 placeholder-zinc-600 transition-all' 
                  placeholder="you@example.com"/>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
                  Password
                </label>
                <div className='relative'>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required 
                    className='w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm text-zinc-100 bg-black/20 placeholder-zinc-600 transition-all pr-12' 
                  placeholder="••••••••"/>
                  <button type="button" onClick={()=> setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors p-1">
                      {showPassword ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} 
              className='w-full py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center cursor-pointer mt-6 rounded-xl transition-all shadow-lg shadow-indigo-500/25'>
                {loading ? <Loader2Icon className="animate-spin h-4 w-4 mr-2"/> : null}
                {isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className='mt-8 pt-6 border-t border-white/10 text-center'>
              <p className='text-sm text-zinc-400 font-sans'>
                {isLogin ? (
                  <>
                    New to Builder AI?{" "}
                    <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors" >
                      Create an account
                    </Link>
                  </>
                ) : (
                  <>
                  Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors" >
                    Sign in here
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* DESKTOP VIEW (Light Theme) - Visible >= 768px              */}
        {/* ========================================================== */}
        <div className="w-full max-w-sm relative z-10 hidden md:block text-zinc-900">
          
          <div className="mb-10">
            <h1 className="text-3xl font-medium tracking-tight text-zinc-900 mb-1.5 font-sans">
              {isLogin ? "Sign in" : "Create an account"}
            </h1>
            <p className='text-sm text-zinc-400'>
              {isLogin ? "Enter your credentials to access your AI workbench." : "Create your account to get started."}
            </p>
          </div>

          {error && <div className='mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded'>{error}</div>}

          <form className='space-y-6' onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required className='w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 transition-colors' placeholder='John Doe'/>
              </div>
            )}
            <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className='w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 transition-colors' placeholder="you@example.com"/>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className='relative'>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required className='w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 pr-8' 
                  placeholder="••••••••"/>
                  <button type="button" onClick={()=> setShowPassword(!showPassword)}className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors">
                      {showPassword ? <EyeOffIcon size={14}/> : <EyeIcon size={14}/>}
                  </button>
                </div>
                
            </div>

            <button type="submit" disabled={loading} 
            className='w-full py-2.5 bg-linear-to-br from-red-600 to-amber-600 text-white font-semibold hover:scale-102 disabled:opacity-40 flex items-center justify-center cursor-pointer mt-2 rounded-lg transition-all'>
              {loading && <Loader2Icon className="animate-spin h-3.5 w-3.5 mr-2"/>}
              {isLogin ? "Sign in" : "Sign up"}
            </button>
            
          </form>

          <p className='text-sm text-zinc-400 mt-8 pt-6 border-t border-zinc-100 font-sans'>
            {isLogin ? (
              <>
                New to Builder AI?{" "}
                <Link to="/register" className="text-zinc-900 font-medium hover:underline" >
                  Create an account
                </Link>
              </>
            ) : (
              <>
              Already have an account?{" "}
                <Link to="/login" className="text-zinc-900 font-medium hover:underline" >
                Sign in here
                </Link>
              </>
            )}
          </p>

        </div>

      </div>
    </div>
  )
}

export default AuthPage