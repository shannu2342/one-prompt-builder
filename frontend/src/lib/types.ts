export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface Project {
  _id: string
  userId: string
  name: string
  description?: string
  prompt: string
  type: 'website' | 'mobile-app' | 'both'
  framework: string
  generatedCode: GeneratedCode | any
  versions: ProjectVersion[]
  status: 'draft' | 'published' | 'archived'
  deploymentUrl?: string
  deploymentPlatform?: 'vercel' | 'netlify' | 'github'
  metadata: {
    types?: ('website' | 'mobile-app')[]
    pages?: number
    components?: number
    dependencies?: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface ProjectVersion {
  code: any
  timestamp: string
  description?: string
}

export interface GeneratedCode {
  type: string
  framework: string
  files: {
    [key: string]: string
  }
  dependencies?: {
    [key: string]: string
  }
  structure?: string[]
  instructions?: string
}

export interface GenerateRequest {
  prompt: string
  type?: 'website' | 'mobile-app'  // For backward compatibility
  types?: ('website' | 'mobile-app')[]  // New: support multiple types
  framework?: string
  features?: string[]
}

export interface DeployRequest {
  projectId?: string
  projectName: string
  files: {
    [key: string]: string
  }
}

export interface DeployResponse {
  success: boolean
  url?: string
  deploymentId?: string
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  details?: string
}
