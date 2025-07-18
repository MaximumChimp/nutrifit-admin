export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-indigo-600">Users Summary</h2>
          <p className="text-sm text-gray-600 mt-2">Placeholder for chart</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-indigo-600">Meal Stats</h2>
          <p className="text-sm text-gray-600 mt-2">Placeholder for another chart</p>
        </div>
      </div>
    </div>
  )
}
