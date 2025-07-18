import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
} from 'firebase/firestore'
import { auth, db } from '../../../firebase-config'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Icon from '../../assets/images/Icon.png'
import toast from 'react-hot-toast'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const getEmailFromUsername = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return null
    return querySnapshot.docs[0].data().email
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (isSignUp) {
        // Check if username already exists
        const q = query(collection(db, 'users'), where('username', '==', username))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          toast.error('Username already taken')
          return
        }

        const fakeEmail = `${username}@nutrifit.admin`
        const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password)
        const user = userCredential.user

       const userData = {
        username,
        email: fakeEmail,
        role: 'admin',
        }

        await setDoc(doc(db, 'users', user.uid), userData)

        localStorage.setItem('nutrifit_user', JSON.stringify({ username: userData.username, role: userData.role }))
        toast.success('Admin Created!')
        navigate('/dashboard')
      } else {
        // Login flow
        const email = await getEmailFromUsername(username)
        if (!email) {
          toast.error('Username not found')
          return
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        const userDoc = await getDoc(doc(db, 'users', user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.role === 'admin') {
            localStorage.setItem(
                'nutrifit_user',
                JSON.stringify({ username: userData.username, role: userData.role })
            )
            toast.success('Login successful!')
            navigate('/dashboard')
          } else {
            toast.error('Access denied: Not an admin')
          }
        } else {
          toast.error('User record not found')
        }
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Username already exists')
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password')
      } else if (error.code === 'auth/user-not-found') {
        toast.error('User not found')
      } else {
        toast.error(error.message || 'An error occurred')
      }
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div>
          <img className="mx-auto h-20 w-auto" src={Icon} alt="Nutrifit" />
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            {isSignUp ? 'Register' : 'Login'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full border-b border-gray-300 bg-transparent px-1 py-2 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-0"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full border-b border-gray-300 bg-transparent px-1 py-2 pr-10 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-indigo-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Toggle Mode */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </button>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              {isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
