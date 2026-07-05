import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import AiChat from '../AiChat'
import CrisisButton from '../CrisisButton'
import OfflineBanner from '../OfflineBanner'
import { usePresenceHeartbeat } from '../../hooks/usePresence'

export default function Layout() {
  usePresenceHeartbeat()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <OfflineBanner />
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — always visible on desktop, drawer on mobile */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-250 ease-in-out
          md:relative md:translate-x-0 md:flex md:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>

        <AiChat />
        <CrisisButton />
      </div>
    </>
  )
}
