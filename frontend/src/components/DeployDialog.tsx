'use client'

import { useState } from 'react'
import { deployApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { X, Loader2, ExternalLink, CheckCircle } from 'lucide-react'

interface DeployDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  files: { [key: string]: string }
  onDeploySuccess: (url: string, platform: string) => void
}

export default function DeployDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
  files,
  onDeploySuccess,
}: DeployDialogProps) {
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState<'vercel' | 'netlify'>('vercel')
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)

  if (!isOpen) return null

  const handleDeploy = async () => {
    setLoading(true)

    try {
      let result
      if (platform === 'vercel') {
        result = await deployApi.deployToVercel({
          projectId,
          projectName,
          files,
        })
      } else {
        result = await deployApi.deployToNetlify({
          projectId,
          projectName,
          files,
        })
      }

      if (result.success && result.url) {
        setDeployedUrl(result.url)
        toast.success(`Successfully deployed to ${platform}!`)
        onDeploySuccess(result.url, platform)
      } else {
        toast.error(result.error || 'Deployment failed')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Deployment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Deploy Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {deployedUrl ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Deployment Successful!
              </h3>
              <p className="text-gray-600 mb-4">Your project is now live</p>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <span>{deployedUrl}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Choose a platform to deploy your project
              </p>

              {/* Platform Selection */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPlatform('vercel')}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                    platform === 'vercel'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Vercel</div>
                  <div className="text-sm text-gray-500">
                    Fast, reliable hosting with automatic HTTPS
                  </div>
                </button>

                <button
                  onClick={() => setPlatform('netlify')}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                    platform === 'netlify'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Netlify</div>
                  <div className="text-sm text-gray-500">
                    Powerful platform with continuous deployment
                  </div>
                </button>
              </div>

              {/* Deploy Button */}
              <button
                onClick={handleDeploy}
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Deploying to {platform}...</span>
                  </>
                ) : (
                  <span>Deploy to {platform}</span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {deployedUrl && (
          <div className="p-6 border-t">
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
