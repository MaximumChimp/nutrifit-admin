import Sidebar from '../../components/Sidebar'
import Dashboard from '../Delivery/Delivery'

export default function Delivery() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen p-6">
        <Dashboard />
      </main>
    </div>
  )
}
