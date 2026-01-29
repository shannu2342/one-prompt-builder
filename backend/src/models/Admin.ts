export interface Admin {
  id: string
  username: string
  password: string // hashed
  email: string
  createdAt: Date
  lastLogin?: Date
}

export interface AdminSession {
  adminId: string
  token: string
  expiresAt: Date
}
