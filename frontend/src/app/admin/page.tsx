'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Users,
  FileText,
  Code,
  BarChart3,
  LogOut,
  Loader2,
  Globe,
  Smartphone,
  TrendingUp
} from 'lucide-react'

interface Analytics {
  totalUsers: number
  totalProjects: number
  totalGenerations: number
  recentActivity: Array<{
    projectId: string
    projectName: string
    userName: string
    type: string
    createdAt: string
  }>
  stats: {
    websiteProjects: number
    mobileProjects: number
    dualProjects: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')

    if (!token) {
      router.push('/admin/login')
      return
    }

    if (user) {
      setAdminUser(JSON.parse(user))
    }

    fetchAnalytics(token)
  }, [])

  const fetchAnalytics = async (token: string) => {
    try {
      // Mock analytics data for testing without backend
      if (token && token.includes('admin-mock-token')) {
        const mockAnalytics: Analytics = {
          totalUsers: 150,
          totalProjects: 280,
          totalGenerations: 520,
          recentActivity: [
            {
              projectId: '1',
              projectName: 'E-commerce Store',
              userName: 'John Doe',
              type: 'website',
              createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              projectId: '2',
              projectName: 'Task Manager',
              userName: 'Jane Smith',
              type: 'mobile-app',
              createdAt: new Date(Date.now() - 7200000).toISOString()
            },
            {
              projectId: '3',
              projectName: 'Weather App',
              userName: 'Mike Johnson',
              type: 'both',
              createdAt: new Date(Date.now() - 10800000).toISOString()
            }
          ],
          stats: {
            websiteProjects: 150,
            mobileProjects: 100,
            dualProjects: 30
          }
        }
        setAnalytics(mockAnalytics)
      } else {
        // Try real API call
        const response = await axios.get('http://localhost:5000/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAnalytics(response.data)
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        router.push('/admin/login')
      } else {
        toast.error('Failed to fetch analytics')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    toast.success('Logged out successfully')
    router.push('/admin/login')
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome back, {adminUser?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics?.totalUsers || 0}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics?.totalProjects || 0}</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Generations</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics?.totalGenerations || 0}</p>
              </div>
              <div className="bg-purple-600 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Dual Projects</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics?.stats.dualProjects || 0}</p>
              </div>
              <div className="bg-orange-600 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Project Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Website Projects</h3>
            </div>
            <p className="text-4xl font-bold text-blue-400">{analytics?.stats.websiteProjects || 0}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Smartphone className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Mobile App Projects</h3>
            </div>
            <p className="text-4xl font-bold text-purple-400">{analytics?.stats.mobileProjects || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors group"
          >
            <Users className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Manage Users</h3>
            <p className="text-gray-400 text-sm">View and manage all registered users</p>
          </Link>

          <Link
            href="/admin/prompts"
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-colors group"
          >
            <FileText className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">View Prompts</h3>
            <p className="text-gray-400 text-sm">See all prompts given by users</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors group"
          >
            <Code className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">View Code</h3>
            <p className="text-gray-400 text-sm">Access generated code for all projects</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {activity.type === 'website' ? (
                      <Globe className="h-5 w-5 text-blue-400" />
                    ) : activity.type === 'mobile-app' ? (
                      <Smartphone className="h-5 w-5 text-purple-400" />
                    ) : (
                      <BarChart3 className="h-5 w-5 text-orange-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{activity.projectName}</p>
                      <p className="text-gray-400 text-sm">by {activity.userName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                    <Link
                      href={`/admin/code/${activity.projectId}`}
                      className="text-blue-400 text-sm hover:underline"
                    >
                      View Code
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
