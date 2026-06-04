import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { ToastContainer } from './Toast'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:pl-0">
        <div className="max-w-[1600px] mx-auto w-full">{children}</div>
      </main>
      <ToastContainer />
    </div>
  )
}
