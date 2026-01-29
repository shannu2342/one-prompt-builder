import axios, { AxiosError } from 'axios'
import type {
  AuthResponse,
  User,
  Project,
  GenerateRequest,
  GeneratedCode,
  DeployRequest,
  DeployResponse,
  ApiError,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    return data
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<{ success: boolean; user: User }>('/auth/me')
    return data.user
  },
}

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get<{ success: boolean; projects: Project[] }>('/projects')
    return data.projects
  },

  getById: async (id: string): Promise<Project> => {
    const { data } = await api.get<{ success: boolean; project: Project }>(`/projects/${id}`)
    return data.project
  },

  create: async (projectData: Partial<Project>): Promise<Project> => {
    const { data } = await api.post<{ success: boolean; project: Project }>('/projects', projectData)
    return data.project
  },

  update: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const { data } = await api.put<{ success: boolean; project: Project }>(`/projects/${id}`, projectData)
    return data.project
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },

  getVersions: async (id: string): Promise<any[]> => {
    const { data } = await api.get<{ success: boolean; versions: any[] }>(`/projects/${id}/versions`)
    return data.versions
  },

  exportProject: async (id: string): Promise<Blob> => {
    const { data } = await api.post(`/deploy/export/${id}`, {}, { responseType: 'blob' })
    return data
  },
}

// Generate API
export const generateApi = {
  generate: async (request: GenerateRequest): Promise<GeneratedCode> => {
    const { data } = await api.post<{ success: boolean; generatedCode: GeneratedCode }>('/generate', request)
    return data.generatedCode
  },

  enhance: async (existingCode: any, enhancementPrompt: string): Promise<GeneratedCode> => {
    const { data } = await api.post<{ success: boolean; enhancedCode: GeneratedCode }>('/generate/enhance', {
      existingCode,
      enhancementPrompt,
    })
    return data.enhancedCode
  },
}

// Deploy API
export const deployApi = {
  deployToVercel: async (request: DeployRequest): Promise<DeployResponse> => {
    const { data } = await api.post<DeployResponse>('/deploy/vercel', request)
    return data
  },

  deployToNetlify: async (request: DeployRequest): Promise<DeployResponse> => {
    const { data } = await api.post<DeployResponse>('/deploy/netlify', request)
    return data
  },

  exportProject: async (projectId: string): Promise<Blob> => {
    const { data } = await api.post(`/deploy/export/${projectId}`, {}, { responseType: 'blob' })
    return data
  },
}

export default api
