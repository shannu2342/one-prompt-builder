# Redesign Plan - Visual Editor & Admin Backend

## Overview
Redesigning the application to separate user-facing visual editing from admin code management.

## Architecture Changes

### Frontend (User-Facing) - Visual Editor Only
**Remove:**
- ❌ Code editor (Monaco Editor)
- ❌ File sidebar
- ❌ Raw code display

**Add:**
- ✅ Visual preview with interactive editing
- ✅ Drag-and-drop for elements
- ✅ Color picker for theme changes
- ✅ Icon/image replacement
- ✅ Text editing inline
- ✅ Layout adjustments
- ✅ Style customization panel

**Pages:**
1. `/dashboard/projects/[id]` - Visual editor with preview
2. `/dashboard/projects/[id]/preview` - Full preview mode

### Backend (Admin Panel) - Code & Analytics
**New Admin Routes:**
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/users/[id]` - User details with prompts
- `/admin/prompts` - All prompts across users
- `/admin/code/[projectId]` - View generated code

**Features:**
1. User Details:
   - User info (name, email, registration date)
   - Total projects created
   - Total prompts given
   - Activity timeline

2. Prompts Management:
   - List all prompts by user
   - View prompt text
   - View generated output
   - Regeneration history

3. Code Viewer:
   - View generated code for any project
   - Syntax highlighting
   - Download code
   - Code diff between versions

## Implementation Steps

### Phase 1: Backend Admin Panel
1. Create admin routes and middleware
2. Add admin authentication
3. Build user analytics endpoints
4. Create prompt tracking system
5. Add code viewing endpoints

### Phase 2: Frontend Visual Editor
1. Remove code editor components
2. Create visual editing toolbar
3. Implement drag-and-drop
4. Add color picker
5. Add icon/image uploader
6. Implement inline text editing
7. Create style customization panel

### Phase 3: Integration
1. Connect visual changes to code updates
2. Auto-save visual edits
3. Sync changes to backend
4. Update preview in real-time

## Technical Stack

### Visual Editor:
- **GrapesJS** or **Craft.js** - Visual page builder
- **react-color** - Color picker
- **react-dnd** - Drag and drop
- **Fabric.js** - Canvas manipulation

### Admin Panel:
- **React Admin** or custom admin UI
- **Recharts** - Analytics charts
- **Monaco Editor** (admin only) - Code viewing

## File Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── users.ts
│   │   │   ├── prompts.ts
│   │   │   ├── code.ts
│   │   │   └── analytics.ts
│   │   └── ...
│   ├── middleware/
│   │   └── adminAuth.ts
│   └── ...

frontend/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── page.tsx (admin dashboard)
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── prompts/page.tsx
│   │   │   └── code/[projectId]/page.tsx
│   │   ├── dashboard/
│   │   │   └── projects/[id]/
│   │   │       └── page.tsx (visual editor)
│   │   └── ...
│   ├── components/
│   │   ├── VisualEditor/
│   │   │   ├── Toolbar.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── IconPicker.tsx
│   │   │   ├── DragLayer.tsx
│   │   │   └── StylePanel.tsx
│   │   └── admin/
│   │       ├── UserTable.tsx
│   │       ├── PromptList.tsx
│   │       └── CodeViewer.tsx
│   └── ...
```

## Data Models

### User Activity Tracking
```typescript
interface UserActivity {
  userId: string
  promptsGiven: Prompt[]
  projectsCreated: number
  lastActive: Date
  totalGenerations: number
}

interface Prompt {
  id: string
  userId: string
  text: string
  timestamp: Date
  projectId: string
  generatedCode: any
  editHistory: Edit[]
}

interface Edit {
  timestamp: Date
  type: 'visual' | 'code'
  changes: any
  before: any
  after: any
}
```

## Visual Editor Features

### 1. Element Manipulation
- Drag and drop elements
- Resize elements
- Delete elements
- Duplicate elements

### 2. Style Editing
- Background color
- Text color
- Font family
- Font size
- Padding/Margin
- Border styles

### 3. Content Editing
- Inline text editing
- Image upload/replace
- Icon selection
- Link editing

### 4. Layout Control
- Grid/Flexbox controls
- Alignment tools
- Spacing adjustments
- Responsive breakpoints

## Admin Panel Features

### 1. User Management
- View all users
- User details page
- Activity timeline
- Project history

### 2. Prompt Analytics
- All prompts across platform
- Most common requests
- Success rate
- Generation time stats

### 3. Code Management
- View generated code
- Download code
- Compare versions
- Regenerate from prompt

## Next Steps
1. Confirm this redesign approach
2. Choose visual editor library (GrapesJS vs Craft.js)
3. Implement admin authentication
4. Build admin panel first
5. Then rebuild frontend with visual editor
