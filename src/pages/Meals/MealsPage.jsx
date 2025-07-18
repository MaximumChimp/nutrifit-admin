import Sidebar from '../../components/Sidebar'
import Meals from './Meals'

export default function MealsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen p-6">
        <Meals />
      </main>
    </div>
  )
}
