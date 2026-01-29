'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { projectsApi } from '@/lib/api'
import type { Project } from '@/lib/types'
import toast from 'react-hot-toast'
import { 
  Sparkles, 
  Plus, 
  FolderOpen, 
  Clock, 
  Globe, 
  Smartphone,
  LogOut,
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadProjects()
  }, [isAuthenticated, router])

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch (error: any) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectsApi.delete(id)
      toast.success('Project deleted')
      loadProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">One-Prompt Builder</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">Create and manage your AI-generated projects</p>
          </div>
          <Link
            href="/dashboard/create"
            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first AI-generated project</p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {project.type === 'website' ? (
                        <Globe className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-purple-600" />
                      )}
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {project.type === 'website' ? 'Website' : 'Mobile App'}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {project.name}
                  </h3>
                  
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDateTime(project.updatedAt)}
                  </div>

                  {project.deploymentUrl && (
                    <a
                      href={project.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 mb-4"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Live</span>
                    </a>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/projects/${project._id}`}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-center"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
