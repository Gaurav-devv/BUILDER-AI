import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {GuestLayout, AuthLayout} from './pages/Layout'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import WorkbenchPage from './pages/WorkbenchPage'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <>
    <Toaster />
    <Routes>
      {/* Auth Routes */}
      <Route element={<GuestLayout/>}>
        <Route path='/login' element={<AuthPage mode="login"/>}/>
        <Route path='/register' element={<AuthPage mode="register"/>}/>
      </Route>

      {/* Protected Routes */}
      <Route element={<AuthLayout/>}>
        <Route path='/' element={<HomePage />}/>
        <Route path='/workbench/:id' element={<WorkbenchPage />}/>
      </Route>

      {/* Catch-all */}
      <Route path='*' element={<Navigate to="/" replace />}/>
    </Routes>
    </>
  )
}

export default App