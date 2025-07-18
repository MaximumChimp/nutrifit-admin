import Sidebar from '../../components/Sidebar'
import Dashboard from '../Dashboard/Dashboard'

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen p-6">
        <Dashboard />
      </main>
    </div>
  )
}
