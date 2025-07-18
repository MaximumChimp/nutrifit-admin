import { useState } from 'react'
import toast from 'react-hot-toast'

export default function UserOrdersOverview() {
  const [activeTab, setActiveTab] = useState('Orders')

  const [orders, setOrders] = useState([
    {
      id: 1,
      user: 'Arvin Cabrera',
      food: 'Grilled Salmon',
      location: 'Brgy. Darasa, Tanauan City',
      phone: '0917-123-4567',
      instruction: 'No lemon sauce',
      status: 'Orders',
    },
    {
      id: 2,
      user: 'Ronnie Dela Cruz',
      food: 'Chicken Adobo',
      location: 'Brgy. Janopol, Tanauan City',
      phone: '0918-456-7890',
      instruction: 'Extra rice',
      status: 'Preparing',
      prepTime: '',
    },
    {
      id: 3,
      user: 'Ella Reyes',
      food: 'Veggie Bowl',
      location: 'Brgy. Balele, Tanauan City',
      phone: '0916-987-6543',
      instruction: 'Less salt',
      status: 'Deliver',
    },
  ])

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [tempPrepTime, setTempPrepTime] = useState('')

  const handleReceive = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'Preparing' } : order
      )
    )
    toast.success('Order Received!')
    setSelectedOrder(null)
  }

  const handleSetPrepTime = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, prepTime: tempPrepTime } : order
      )
    )
    toast.success('Time Set!')
    setSelectedOrder(null)
    setTempPrepTime('')
  }

  const markAsDone = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'Deliver' } : order
      )
    )
    toast.success('Order Marked as Done!')
  }

  const handleDeliver = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'Out for Delivery' } : order
      )
    )
    toast.success('Order is Out for Delivery!')
    setSelectedOrder(null)
  }

  const markAsDelivered = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'Done' } : order
      )
    )
    toast.success('Order Delivered Successfully!')
    setSelectedOrder(null)
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Deliver') {
      return order.status === 'Deliver' || order.status === 'Out for Delivery'
    }
    return order.status === activeTab
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">User Orders Overview</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['Orders', 'Preparing', 'Deliver', 'Done'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md font-semibold ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm border border-gray-200 rounded-md">
          <thead className="bg-indigo-50 text-indigo-700">
            <tr>
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Food</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Instruction</th>
              {activeTab !== 'Preparing' && (
                <th className="px-4 py-2 border">Status</th>
              )}
              {activeTab === 'Preparing' && (
                <>
                  <th className="px-4 py-2 border">Prep Time</th>
                  <th className="px-4 py-2 border">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No orders in this tab.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="text-gray-700 cursor-pointer hover:bg-indigo-50"
                  onDoubleClick={() => {
                    setSelectedOrder(order)
                    setTempPrepTime(order.prepTime || '')
                  }}
                >
                  <td className="px-4 py-2 border">{order.user}</td>
                  <td className="px-4 py-2 border">{order.food}</td>
                  <td className="px-4 py-2 border">{order.location}</td>
                  <td className="px-4 py-2 border">{order.phone}</td>
                  <td className="px-4 py-2 border">{order.instruction}</td>
                  {activeTab !== 'Preparing' && (
                    <td className="px-4 py-2 border text-center">
                      {order.status === 'Out for Delivery'
                        ? 'Out for Delivery'
                        : order.status === 'Deliver'
                        ? 'For Pickup'
                        : order.status}
                    </td>
                  )}

                  {activeTab === 'Preparing' && (
                    <>
                      <td className="px-4 py-2 border text-center">
                        {order.prepTime ? `${order.prepTime} min` : 'Not set'}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsDone(order.id)
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Ready for Pickup
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4 text-gray-700">
              <p><strong>User:</strong> {selectedOrder.user}</p>
              <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              <p><strong>Food:</strong> {selectedOrder.food}</p>
              <p><strong>Location:</strong> {selectedOrder.location}</p>
              <p><strong>Instruction:</strong> {selectedOrder.instruction}</p>

              {selectedOrder.status === 'Orders' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleReceive(selectedOrder.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Receive Order
                  </button>
                </div>
              )}

              {selectedOrder.status === 'Preparing' && (
                <div className="w-full mt-4">
                  <label className="block mb-2 text-sm font-medium">Set Prep Time (in minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={tempPrepTime}
                    onChange={(e) => setTempPrepTime(e.target.value)}
                    className={`border p-2 rounded w-full mb-4 ${
                      selectedOrder.prepTime ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 30"
                    disabled={!!selectedOrder.prepTime}
                  />
                  <button
                    onClick={() => handleSetPrepTime(selectedOrder.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full disabled:opacity-50"
                    disabled={!!selectedOrder.prepTime}
                  >
                    Set Time
                  </button>

                </div>
              )}

              {selectedOrder.status === 'Deliver' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDeliver(selectedOrder.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Deliver
                  </button>
                </div>
              )}

              {selectedOrder.status === 'Out for Delivery' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => markAsDelivered(selectedOrder.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
