import { useState, useRef, useEffect } from 'react'
import { NavLink,useNavigate } from 'react-router-dom'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
  UserIcon,
  ChevronDownIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import Icon from '../assets/images/admin.png'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase-config' 



const navItems = [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { name: 'Meals', to: '/meals', icon: ClipboardDocumentIcon, label: 'Meals' },
  { name: 'Delivery', to: '/delivery', icon: MapPinIcon, label: 'Delivery' },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon, label: 'Settings' }
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()


  const user = JSON.parse(localStorage.getItem('nutrifit_user')) || {}
  const { username, role } = user

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Toggle Button */}
      <button
        className="fixed top-4 left-4 z-30 p-2 bg-white border rounded-md shadow-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-20
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-center mb-8">
            <span className="ml-2 text-lg font-bold text-indigo-600">NutriFit Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map(({ name, to, icon: Icon, label }) => (
                <li key={name}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center p-2 rounded-md transition ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-600 font-semibold'
                          : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-600'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile + Dropdown */}
          <div
            ref={dropdownRef}
            className="mt-auto flex items-center justify-between p-2 border-t pt-4 relative"
          >
            <div className="flex items-center">
              <img
                src={Icon}
                alt="User Avatar"
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{username || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{role || 'No Role'}</p>
              </div>
            </div>

            {/* Dropdown toggle button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle user menu"
            >
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-600 transform transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <ul className="absolute bottom-full mb-2 right-0 w-48 bg-white border rounded-md shadow-lg text-gray-700 z-30">
                <li>
                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 hover:bg-indigo-100 transition"
                    onClick={() => {
                      setDropdownOpen(false)
                      alert('Go to Admin Settings')
                    }}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    Admin Settings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center w-full px-4 py-2 hover:bg-indigo-100 transition"
                  onClick={async () => {
                      setDropdownOpen(false)
                      try {
                        await signOut(auth)
                        localStorage.removeItem('nutrifit_user') // or clear() if you want to wipe all
                        navigate('/')
                      } catch (err) {
                        console.error('Logout failed:', err)
                      }
                    }}

                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
