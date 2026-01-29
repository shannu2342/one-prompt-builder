'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateApi, projectsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Sparkles, Loader2, ArrowLeft, Globe, Smartphone } from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    types: ['website'] as ('website' | 'mobile-app')[],
    framework: 'html',
  })

  const frameworks = {
    website: [
      { value: 'html', label: 'HTML/CSS/JS' },
      { value: 'react', label: 'React' },
      { value: 'nextjs', label: 'Next.js' },
      { value: 'vue', label: 'Vue.js' },
    ],
    'mobile-app': [
      { value: 'react-native', label: 'React Native' },
      { value: 'expo', label: 'Expo' },
    ],
  }

  const examplePrompts = {
    website: [
      'Create a modern portfolio website with dark theme, hero section, projects gallery, and contact form',
      'Build an e-commerce landing page for artisanal tea brand with product showcase and newsletter signup',
      'Design a SaaS landing page with pricing tables, feature comparison, and testimonials',
    ],
    'mobile-app': [
      'Create a fitness tracking app with workout logging, progress charts, and user profile',
      'Build a todo list app with categories, due dates, and priority levels',
      'Design a weather app with current conditions, 7-day forecast, and location search',
    ],
  }

  const handleGenerate = async () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
      toast.error('Please provide project name and prompt')
      return
    }

    setLoading(true)

    try {
      // Generate code using Grok AI
      const generatingMessage = formData.types.length > 1
        ? 'Generating website and mobile app with Grok AI...'
        : 'Generating your project with Grok AI...'
      
      toast.loading(generatingMessage, { id: 'generate' })
      
      const generatedCode = await generateApi.generate({
        prompt: formData.prompt,
        types: formData.types,
        framework: formData.framework,
      })

      toast.success('Code generated successfully!', { id: 'generate' })

      // Save project to database
      const project = await projectsApi.create({
        name: formData.name,
        description: formData.description,
        prompt: formData.prompt,
        type: formData.types.length > 1 ? 'both' : formData.types[0],
        framework: formData.framework,
        generatedCode,
        metadata: {
          types: formData.types,
          pages: generatedCode.structure?.length || 0,
          dependencies: Object.keys(generatedCode.dependencies || {}),
        },
      })

      toast.success('Project created successfully!')
      router.push(`/dashboard/projects/${project._id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate project', { id: 'generate' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600">Describe your project and let Grok AI generate the code</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="My Awesome Project"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="A brief description of your project"
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type * (Select one or both)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const newTypes = formData.types.includes('website')
                      ? formData.types.filter(t => t !== 'website')
                      : [...formData.types, 'website'] as ('website' | 'mobile-app')[]
                    setFormData({ ...formData, types: newTypes.length > 0 ? newTypes : ['website'] as ('website' | 'mobile-app')[] })
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.types.includes('website')
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Globe className={`h-8 w-8 mx-auto mb-2 ${formData.types.includes('website') ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="font-semibold">Website</div>
                  <div className="text-xs text-gray-500">Web application</div>
                  {formData.types.includes('website') && (
                    <div className="mt-2 text-xs font-semibold text-blue-600">✓ Selected</div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTypes = formData.types.includes('mobile-app')
                      ? formData.types.filter(t => t !== 'mobile-app')
                      : [...formData.types, 'mobile-app'] as ('website' | 'mobile-app')[]
                    setFormData({ ...formData, types: newTypes.length > 0 ? newTypes : ['mobile-app'] as ('website' | 'mobile-app')[] })
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.types.includes('mobile-app')
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className={`h-8 w-8 mx-auto mb-2 ${formData.types.includes('mobile-app') ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div className="font-semibold">Mobile App</div>
                  <div className="text-xs text-gray-500">iOS & Android</div>
                  {formData.types.includes('mobile-app') && (
                    <div className="mt-2 text-xs font-semibold text-purple-600">✓ Selected</div>
                  )}
                </button>
              </div>
              {formData.types.length === 2 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    🎉 Great! You'll get both a website and mobile app from one prompt!
                  </p>
                </div>
              )}
            </div>

            {/* Framework */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Framework (for website)
              </label>
              <select
                value={formData.framework}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={!formData.types.includes('website')}
              >
                {frameworks.website.map((fw) => (
                  <option key={fw.value} value={fw.value}>
                    {fw.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description / Prompt *
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Describe your project in detail. Include features, design preferences, colors, layout, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Be as specific as possible for better results
              </p>
            </div>

            {/* Example Prompts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Example Prompts
              </label>
              <div className="space-y-2">
                {formData.types.length === 2 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, prompt: 'Create a modern fitness tracking platform with a responsive website and companion mobile app. Include workout logging, progress charts, social features, and user profiles.' })}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      Create a modern fitness tracking platform with a responsive website and companion mobile app. Include workout logging, progress charts, social features, and user profiles.
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, prompt: 'Build an e-commerce platform for artisanal products with a web storefront and mobile shopping app. Include product catalog, cart, checkout, and order tracking.' })}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      Build an e-commerce platform for artisanal products with a web storefront and mobile shopping app. Include product catalog, cart, checkout, and order tracking.
                    </button>
                  </>
                ) : (
                  examplePrompts[formData.types[0] || 'website'].map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, prompt: example })}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {example}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating with Grok AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
