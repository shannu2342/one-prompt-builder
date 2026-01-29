# Full Redesign Implementation Guide

## Overview
This guide provides complete implementation details for the redesign with:
- **GrapesJS Visual Editor** (no code editor for users)
- **Separate Admin Panel** (user tracking, prompts, code viewing)
- **Both built in parallel**

---

## Part 1: Backend - Admin System

### 1.1 Install Additional Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### 1.2 Update In-Memory Storage for Admin
Add to `backend/src/storage/inMemoryStorage.ts`:

```typescript
// Add admin storage
private admins: Map<string, Admin> = new Map()
private adminSessions: Map<string, AdminSession> = new Map()
private userActivity: Map<string, UserActivity> = new Map()

// Admin methods
createAdmin(admin: Admin): Admin {
  this.admins.set(admin.id, admin)
  return admin
}

getAdminByUsername(username: string): Admin | undefined {
  return Array.from(this.admins.values()).find(a => a.username === username)
}

createAdminSession(session: AdminSession): void {
  this.adminSessions.set(session.token, session)
}

getAdminSession(token: string): AdminSession | undefined {
  return this.adminSessions.get(token)
}

// Activity tracking
trackUserActivity(userId: string, activity: any): void {
  const existing = this.userActivity.get(userId) || {
    userId,
    prompts: [],
    projects: [],
    totalGenerations: 0
  }
  this.userActivity.set(userId, { ...existing, ...activity })
}

getUserActivity(userId: string): UserActivity | undefined {
  return this.userActivity.get(userId)
}

getAllUsersActivity(): UserActivity[] {
  return Array.from(this.userActivity.values())
}
```

### 1.3 Create Admin Routes
Create `backend/src/routes/admin.ts`:

```typescript
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { storage } from '../storage/inMemoryStorage'
import { adminAuthMiddleware } from '../middleware/adminAuth'

const router = Router()

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  
  const admin = storage.getAdminByUsername(username)
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const validPassword = await bcrypt.compare(password, admin.password)
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET || 'admin-secret', {
    expiresIn: '24h'
  })
  
  storage.createAdminSession({
    adminId: admin.id,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
  
  res.json({ success: true, token, admin: { id: admin.id, username: admin.username } })
})

// Get all users
router.get('/users', adminAuthMiddleware, (req, res) => {
  const users = storage.getAllUsers()
  const usersWithActivity = users.map(user => ({
    ...user,
    activity: storage.getUserActivity(user.id)
  }))
  res.json(usersWithActivity)
})

// Get user details
router.get('/users/:id', adminAuthMiddleware, (req, res) => {
  const user = storage.getUserById(req.params.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  const projects = storage.getProjectsByUserId(user.id)
  const activity = storage.getUserActivity(user.id)
  
  res.json({ user, projects, activity })
})

// Get all prompts
router.get('/prompts', adminAuthMiddleware, (req, res) => {
  const allProjects = storage.getAllProjects()
  const prompts = allProjects.map(p => ({
    id: p._id,
    userId: p.userId,
    prompt: p.prompt,
    type: p.type,
    createdAt: p.createdAt,
    projectName: p.name
  }))
  res.json(prompts)
})

// Get project code
router.get('/code/:projectId', adminAuthMiddleware, (req, res) => {
  const project = storage.getProjectById(req.params.projectId)
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }
  res.json({ project, code: project.generatedCode })
})

// Analytics
router.get('/analytics', adminAuthMiddleware, (req, res) => {
  const users = storage.getAllUsers()
  const projects = storage.getAllProjects()
  const activities = storage.getAllUsersActivity()
  
  res.json({
    totalUsers: users.length,
    totalProjects: projects.length,
    totalGenerations: activities.reduce((sum, a) => sum + (a.totalGenerations || 0), 0),
    recentActivity: activities.slice(0, 10)
  })
})

export default router
```

### 1.4 Create Admin Auth Middleware
Create `backend/src/middleware/adminAuth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { storage } from '../storage/inMemoryStorage'

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret') as any
    const session = storage.getAdminSession(token)
    
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session expired' })
    }
    
    req.adminId = decoded.adminId
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid admin token' })
  }
}
```

### 1.5 Update server.ts
Add admin routes to `backend/src/server.ts`:

```typescript
import adminRoutes from './routes/admin'

// Add after other routes
app.use('/api/admin', adminRoutes)
```

### 1.6 Create Default Admin
Add initialization script to create default admin:

```typescript
// In server.ts or separate init script
import bcrypt from 'bcryptjs'

async function createDefaultAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  storage.createAdmin({
    id: 'admin-1',
    username: 'admin',
    password: hashedPassword,
    email: 'admin@builder.com',
    createdAt: new Date()
  })
  console.log('Default admin created: username=admin, password=admin123')
}

createDefaultAdmin()
```

---

## Part 2: Frontend - Admin Panel

### 2.1 Create Admin Pages Structure
```
frontend/src/app/admin/
├── login/
│   └── page.tsx
├── page.tsx (dashboard)
├── users/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── prompts/
│   └── page.tsx
└── code/
    └── [projectId]/
        └── page.tsx
```

### 2.2 Admin Login Page
Create `frontend/src/app/admin/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', credentials)
      localStorage.setItem('adminToken', response.data.token)
      toast.success('Admin login successful')
      router.push('/admin')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### 2.3 Admin Dashboard
Create `frontend/src/app/admin/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalytics(response.data)
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{analytics?.totalUsers || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 mb-2">Total Projects</h3>
          <p className="text-4xl font-bold">{analytics?.totalProjects || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 mb-2">Total Generations</h3>
          <p className="text-4xl font-bold">{analytics?.totalGenerations || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Link href="/admin/users" className="bg-blue-600 p-6 rounded-xl hover:bg-blue-700">
          <h3 className="text-2xl font-bold">Manage Users</h3>
          <p className="text-gray-200 mt-2">View and manage all users</p>
        </Link>
        <Link href="/admin/prompts" className="bg-purple-600 p-6 rounded-xl hover:bg-purple-700">
          <h3 className="text-2xl font-bold">View Prompts</h3>
          <p className="text-gray-200 mt-2">See all user prompts</p>
        </Link>
      </div>
    </div>
  )
}
```

### 2.4 Users List Page
Create `frontend/src/app/admin/users/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      router.push('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Users Management</h1>
      
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Projects</th>
              <th className="p-4 text-left">Joined</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-gray-700">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.activity?.projects?.length || 0}</td>
                <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <Link href={`/admin/users/${user.id}`} className="text-blue-400 hover:underline">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## Part 3: Frontend - Visual Editor with GrapesJS

### 3.1 Install GrapesJS
```bash
cd frontend
npm install grapesjs grapesjs-react react-color
```

### 3.2 Create Visual Editor Component
Create `frontend/src/components/VisualEditor.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'

interface VisualEditorProps {
  initialHtml?: string
  initialCss?: string
  onSave: (html: string, css: string) => void
}

export default function VisualEditor({ initialHtml, initialCss, onSave }: VisualEditorProps) {
  const editorRef = useRef<any>(null)

  useEffect(() => {
    const editor = grapesjs.init({
      container: '#gjs',
      height: '100vh',
      width: 'auto',
      storageManager: false,
      panels: { defaults: [] },
      blockManager: {
        appendTo: '#blocks',
        blocks: [
          {
            id: 'section',
            label: 'Section',
            content: '<section><h1>Section</h1></section>',
            category: 'Basic'
          },
          {
            id: 'text',
            label: 'Text',
            content: '<div>Insert your text here</div>',
            category: 'Basic'
          },
          {
            id: 'image',
            label: 'Image',
            content: { type: 'image' },
            category: 'Basic'
          },
          {
            id: 'button',
            label: 'Button',
            content: '<button>Click me</button>',
            category: 'Basic'
          }
        ]
      },
      layerManager: {
        appendTo: '#layers'
      },
      styleManager: {
        appendTo: '#styles',
        sectors: [
          {
            name: 'General',
            properties: ['display', 'position', 'top', 'right', 'left', 'bottom']
          },
          {
            name: 'Dimension',
            properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding']
          },
          {
            name: 'Typography',
            properties: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align']
          },
          {
            name: 'Decorations',
            properties: ['background-color', 'border-radius', 'border', 'box-shadow']
          }
        ]
      },
      traitManager: {
        appendTo: '#traits'
      }
    })

    if (initialHtml) {
      editor.setComponents(initialHtml)
    }
    if (initialCss) {
      editor.setStyle(initialCss)
    }

    editorRef.current = editor

    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      const html = editor.getHtml()
      const css = editor.getCss()
      onSave(html, css)
    }, 30000)

    return () => {
      clearInterval(interval)
      editor.destroy()
    }
  }, [])

  const handleSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHtml()
      const css = editorRef.current.getCss()
      onSave(html, css)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
        <h3 className="text-white font-bold mb-4">Blocks</h3>
        <div id="blocks"></div>
        <h3 className="text-white font-bold mb-4 mt-6">Layers</h3>
        <div id="layers"></div>
      </div>
      
      <div className="flex-1">
        <div className="bg-gray-700 p-2 flex justify-between items-center">
          <h2 className="text-white font-bold">Visual Editor</h2>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
        <div id="gjs"></div>
      </div>
      
      <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
        <h3 className="text-white font-bold mb-4">Styles</h3>
        <div id="styles"></div>
        <h3 className="text-white font-bold mb-4 mt-6">Traits</h3>
        <div id="traits"></div>
      </div>
    </div>
  )
}
```

### 3.3 Update Project Detail Page
Replace `frontend/src/app/dashboard/projects/[id]/page.tsx` with visual editor:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const VisualEditor = dynamic(() => import('@/components/VisualEditor'), { ssr: false })

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const data = await projectsApi.getById(projectId)
      setProject(data)
    } catch (error) {
      toast.error('Failed to load project')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (html: string, css: string) => {
    try {
      await projectsApi.update(projectId, {
        generatedCode: {
          ...project.generatedCode,
          files: {
            ...project.generatedCode.files,
            'index.html': html,
            'styles.css': css
          }
        }
      })
      toast.success('Changes saved')
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  if (loading) return <div>Loading...</div>

  const initialHtml = project?.generatedCode?.files?.['index.html'] || ''
  const initialCss = project?.generatedCode?.files?.['styles.css'] || ''

  return (
    <VisualEditor
      initialHtml={initialHtml}
      initialCss={initialCss}
      onSave={handleSave}
    />
  )
}
```

---

## Part 4: Testing & Deployment

### 4.1 Test Admin Panel
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login to admin: http://localhost:3000/admin/login
   - Username: `admin`
   - Password: `admin123`
4. Test user management
5. Test prompt viewing
6. Test code viewer

### 4.2 Test Visual Editor
1. Create a new project
2. Open project detail page
3. Use GrapesJS to edit visually
4. Test drag-and-drop
5. Test style changes
6. Test save functionality

---

## Summary

This guide provides complete implementation for:
✅ Admin authentication with separate login
✅ Admin panel with user tracking
✅ Prompt viewing and management
✅ Code viewer for admins
✅ GrapesJS visual editor for users
✅ No code editor for end users
✅ Visual editing with drag-and-drop
✅ Color and style customization

**Estimated Implementation Time: 3-4 hours**

**Next Steps:**
1. Implement backend admin routes
2. Create admin frontend pages
3. Install and configure GrapesJS
4. Update project detail page
5. Test all features
6. Deploy to production
