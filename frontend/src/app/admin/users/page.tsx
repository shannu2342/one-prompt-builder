'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, User, Calendar, Activity } from 'lucide-react'

interface UserData {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  projectCount: number
  activity: {
    totalGenerations: number
    prompts: any[]
    projects: string[]
    lastActive: string
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchUsers(token)
  }, [])

  const fetchUsers = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired')
        router.push('/admin/login')
      } else {
        toast.error('Failed to fetch users')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-gray-400 text-sm mt-1">
                {users.length} registered users
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">
                          Last active {new Date(user.activity.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/admin/users/${user._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div>
                  <p className="text-gray-400 text-sm">Projects</p>
                  <p className="text-2xl font-bold text-white mt-1">{user.projectCount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Generations</p>
                  <p className="text-2xl font-bold text-white mt-1">{user.activity.totalGenerations}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Prompts</p>
                  <p className="text-2xl font-bold text-white mt-1">{user.activity.prompts.length}</p>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
              <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
