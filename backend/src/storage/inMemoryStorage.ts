// In-memory storage for development without MongoDB
interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

interface Project {
  _id: string;
  userId: string;
  name: string;
  type: string;
  prompt: string;
  generatedCode: any;
  versions: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface Admin {
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

interface AdminSession {
  adminId: string;
  token: string;
  expiresAt: Date;
}

interface UserActivity {
  userId: string;
  prompts: Array<{
    id: string;
    text: string;
    timestamp: Date;
    projectId: string;
  }>;
  projects: string[];
  totalGenerations: number;
  lastActive: Date;
}

class InMemoryStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private admins: Map<string, Admin> = new Map();
  private adminSessions: Map<string, AdminSession> = new Map();
  private userActivity: Map<string, UserActivity> = new Map();
  private userIdCounter = 1;
  private projectIdCounter = 1;
  private adminIdCounter = 1;

  // User methods
  createUser(userData: Omit<User, '_id' | 'createdAt'>): User {
    const user: User = {
      _id: String(this.userIdCounter++),
      ...userData,
      createdAt: new Date(),
    };
    this.users.set(user._id, user);
    return user;
  }

  findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  // Project methods
  createProject(projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Project {
    const project: Project = {
      _id: String(this.projectIdCounter++),
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project._id, project);
    return project;
  }

  findProjectById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  findProjectsByUserId(userId: string): Project[] {
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updated = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Admin methods
  createAdmin(adminData: Omit<Admin, 'id' | 'createdAt'>): Admin {
    const admin: Admin = {
      id: String(this.adminIdCounter++),
      ...adminData,
      createdAt: new Date(),
    };
    this.admins.set(admin.id, admin);
    return admin;
  }

  findAdminByUsername(username: string): Admin | undefined {
    return Array.from(this.admins.values()).find(a => a.username === username);
  }

  findAdminById(id: string): Admin | undefined {
    return this.admins.get(id);
  }

  updateAdminLastLogin(id: string): void {
    const admin = this.admins.get(id);
    if (admin) {
      admin.lastLogin = new Date();
      this.admins.set(id, admin);
    }
  }

  // Admin session methods
  createAdminSession(session: AdminSession): void {
    this.adminSessions.set(session.token, session);
  }

  getAdminSession(token: string): AdminSession | undefined {
    return this.adminSessions.get(token);
  }

  deleteAdminSession(token: string): boolean {
    return this.adminSessions.delete(token);
  }

  // Activity tracking methods
  trackUserActivity(userId: string, activity: Partial<UserActivity>): void {
    const existing = this.userActivity.get(userId) || {
      userId,
      prompts: [],
      projects: [],
      totalGenerations: 0,
      lastActive: new Date(),
    };
    
    const updated = {
      ...existing,
      ...activity,
      lastActive: new Date(),
    };
    
    this.userActivity.set(userId, updated);
  }

  addPromptToActivity(userId: string, prompt: { id: string; text: string; projectId: string }): void {
    const activity = this.userActivity.get(userId) || {
      userId,
      prompts: [],
      projects: [],
      totalGenerations: 0,
      lastActive: new Date(),
    };
    
    activity.prompts.push({
      ...prompt,
      timestamp: new Date(),
    });
    activity.totalGenerations++;
    activity.lastActive = new Date();
    
    if (!activity.projects.includes(prompt.projectId)) {
      activity.projects.push(prompt.projectId);
    }
    
    this.userActivity.set(userId, activity);
  }

  getUserActivity(userId: string): UserActivity | undefined {
    return this.userActivity.get(userId);
  }

  getAllUsersActivity(): UserActivity[] {
    return Array.from(this.userActivity.values());
  }
}

export const storage = new InMemoryStorage();
export type { User, Project, Admin, AdminSession, UserActivity };
