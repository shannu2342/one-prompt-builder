'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { projectsApi } from '@/lib/api'
import type { Project } from '@/lib/types'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Save,
  Download,
  Rocket,
  Code,
  Eye,
  Loader2,
  FileCode,
} from 'lucide-react'
import CodeEditor from '@/components/CodeEditor'
import PreviewPanel from '@/components/PreviewPanel'
import DeployDialog from '@/components/DeployDialog'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [files, setFiles] = useState<{ [key: string]: string }>({})
  const [showDeployDialog, setShowDeployDialog] = useState(false)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const data = await projectsApi.getById(projectId)
      setProject(data)
      
      // Handle both old format (single type) and new format (dual generation)
      let projectFiles: { [key: string]: string } = {}
      
      if (data.type === 'both' && data.generatedCode.website && data.generatedCode['mobile-app']) {
        // Dual generation: combine files from both
        projectFiles = {
          ...data.generatedCode.website.files,
          ...data.generatedCode['mobile-app'].files,
        }
      } else if (data.generatedCode.files) {
        // Single type: use files directly
        projectFiles = data.generatedCode.files
      } else {
        // Fallback: empty files
        projectFiles = {}
      }
      
      setFiles(projectFiles)
      
      // Set first file as selected
      const fileNames = Object.keys(projectFiles)
      if (fileNames.length > 0) {
        setSelectedFile(fileNames[0])
      }
    } catch (error) {
      toast.error('Failed to load project')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!project) return

    setSaving(true)
    try {
      await projectsApi.update(projectId, {
        generatedCode: {
          ...project.generatedCode,
          files,
        },
      })
      toast.success('Project saved successfully')
    } catch (error) {
      toast.error('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await projectsApi.exportProject(projectId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project?.name || 'project'}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Project exported successfully')
    } catch (error) {
      toast.error('Failed to export project')
    }
  }

  const handleFileChange = (filename: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: content,
    }))
  }

  const handleDeploySuccess = async (url: string, platform: string) => {
    if (!project) return
    
    await projectsApi.update(projectId, {
      deploymentUrl: url,
      deploymentPlatform: platform as any,
      status: 'published',
    })
    
    setProject({
      ...project,
      deploymentUrl: url,
      deploymentPlatform: platform as any,
      status: 'published',
    })
  }

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      html: 'html',
      css: 'css',
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      md: 'markdown',
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  const fileNames = Object.keys(files)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowDeployDialog(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Rocket className="h-4 w-4" />
                <span>Deploy</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'code'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="h-4 w-4" />
              <span>Code Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'code' ? (
          <>
            {/* File Sidebar */}
            <div className="w-64 bg-white border-r overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FileCode className="h-4 w-4 mr-2" />
                  Files
                </h3>
                <div className="space-y-1">
                  {fileNames.map((filename) => (
                    <button
                      key={filename}
                      onClick={() => setSelectedFile(filename)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedFile === filename
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {filename}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 bg-gray-900">
              {selectedFile && (
                <CodeEditor
                  value={files[selectedFile] || ''}
                  onChange={(value) => handleFileChange(selectedFile, value)}
                  language={getLanguageFromFilename(selectedFile)}
                  height="100%"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1">
            <PreviewPanel 
              files={files} 
              type={project.type === 'both' ? 'website' : project.type} 
            />
          </div>
        )}
      </div>

      {/* Deploy Dialog */}
      <DeployDialog
        isOpen={showDeployDialog}
        onClose={() => setShowDeployDialog(false)}
        projectId={projectId}
        projectName={project.name}
        files={files}
        onDeploySuccess={handleDeploySuccess}
      />
    </div>
  )
}
