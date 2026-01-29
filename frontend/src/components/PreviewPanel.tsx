'use client'

import { useEffect, useRef, useState } from 'react'
import { Smartphone, Monitor, Tablet, RefreshCw } from 'lucide-react'

interface PreviewPanelProps {
  files: { [key: string]: string }
  type: 'website' | 'mobile-app'
}

export default function PreviewPanel({ files, type }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [key, setKey] = useState(0)

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' },
  }

  useEffect(() => {
    if (type === 'website' && iframeRef.current && files) {
      updatePreview()
    }
  }, [files, type])

  const updatePreview = () => {
    if (!iframeRef.current) return

    const html = files['index.html'] || files['App.js'] || ''
    const css = files['styles.css'] || files['style.css'] || ''
    const js = files['script.js'] || files['main.js'] || ''

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `

    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframeRef.current.src = url
  }

  const handleRefresh = () => {
    setKey((prev) => prev + 1)
    updatePreview()
  }

  if (type === 'mobile-app') {
    return (
      <div className="h-full bg-gray-900 text-white p-6 overflow-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Mobile App Preview</h3>
          <p className="text-sm text-gray-400">
            Mobile app preview requires a simulator. View the code in the editor.
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <pre className="text-sm overflow-auto">
            <code>{JSON.stringify(files, null, 2)}</code>
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded ${device === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded ${device === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Tablet"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded ${device === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div
          style={{
            width: deviceSizes[device].width,
            height: deviceSizes[device].height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          className="bg-white shadow-2xl rounded-lg overflow-hidden"
        >
          <iframe
            key={key}
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        </div>
      </div>
    </div>
  )
}
