'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Loader2, Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      toast.error('Please enter username and password')
      return
    }

    setLoading(true)

    try {
      // Mock admin login for testing without backend
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        const mockAdmin = {
          id: '1',
          username: 'admin',
          email: 'admin@builder.com'
        }
        const mockToken = 'admin-mock-token-' + Date.now()

        localStorage.setItem('adminToken', mockToken)
        localStorage.setItem('adminUser', JSON.stringify(mockAdmin))
        toast.success('Admin login successful')
        router.push('/admin')
      } else {
        // Try real API login if mock fails
        const response = await axios.post('http://localhost:5000/api/admin/login', credentials)
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin))
        toast.success('Admin login successful')
        router.push('/admin')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h1>
        <p className="text-gray-400 text-center mb-8">Access the admin dashboard</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter admin username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter admin password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login to Admin Panel</span>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            Default credentials: <span className="text-blue-400 font-mono">admin / admin123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
