# Dual Generation Feature - Website & Mobile App

## Overview
Users can now generate both a website AND a mobile app from a single prompt simultaneously!

## Changes Made

### Backend Changes

#### 1. `/backend/src/routes/generate.ts`
- Updated POST `/api/generate` endpoint to support multiple types
- Added support for `types` array parameter (e.g., `['website', 'mobile-app']`)
- Maintains backward compatibility with single `type` parameter
- Generates code for each selected type in parallel
- Returns results object with code for each type

**API Request Format:**
```json
{
  "prompt": "Create a fitness tracking platform...",
  "types": ["website", "mobile-app"],  // NEW: Array of types
  "framework": "react"
}
```

**API Response Format:**
```json
{
  "success": true,
  "generatedCode": {
    "website": { /* website code */ },
    "mobile-app": { /* mobile app code */ }
  },
  "types": ["website", "mobile-app"],
  "message": "Website and mobile app generated successfully"
}
```

### Frontend Changes

#### 1. `/frontend/src/lib/types.ts`
- Updated `GenerateRequest` interface to support both single and multiple types
- Updated `Project` interface to support `type: 'both'`
- Added `types` array to project metadata

#### 2. `/frontend/src/app/dashboard/create/page.tsx`
- Changed from single type selection to multi-select
- Users can now click both "Website" and "Mobile App" buttons
- Shows green success message when both are selected
- Updated example prompts for dual generation
- Framework selector disabled when website not selected

**UI Features:**
- ✅ Toggle selection for Website
- ✅ Toggle selection for Mobile App
- ✅ Visual indicators (✓ Selected) for each type
- ✅ Green banner when both selected: "🎉 Great! You'll get both a website and mobile app from one prompt!"
- ✅ Contextual example prompts based on selection

## Usage Example

### Single Type (Backward Compatible)
```typescript
await generateApi.generate({
  prompt: "Create a portfolio website",
  type: "website",
  framework: "react"
})
```

### Multiple Types (New Feature)
```typescript
await generateApi.generate({
  prompt: "Create a fitness tracking platform with web and mobile",
  types: ["website", "mobile-app"],
  framework: "react"
})
```

## Benefits

1. **Time Saving**: Generate both platforms from one prompt
2. **Consistency**: Ensures design and functionality consistency across platforms
3. **Efficiency**: Single AI call generates complementary codebases
4. **User Experience**: Simplified workflow for full-stack projects

## Example Prompts for Dual Generation

1. "Create a modern fitness tracking platform with a responsive website and companion mobile app. Include workout logging, progress charts, social features, and user profiles."

2. "Build an e-commerce platform for artisanal products with a web storefront and mobile shopping app. Include product catalog, cart, checkout, and order tracking."

3. "Design a task management system with web dashboard and mobile app. Include project boards, team collaboration, notifications, and calendar integration."

## Technical Implementation

### Backend Flow:
1. Receive request with `types` array
2. Validate each type
3. Loop through types and generate code for each
4. Return combined results object

### Frontend Flow:
1. User selects one or both types
2. Fills in project details and prompt
3. Clicks "Generate Project"
4. Backend generates code for selected types
5. Project saved with both artifacts
6. User redirected to project detail page

## Future Enhancements

- [ ] Side-by-side preview of website and mobile app
- [ ] Sync features between platforms
- [ ] Shared component library generation
- [ ] API generation for backend services
- [ ] Desktop app generation (Electron/Tauri)

## Testing

To test the feature:
1. Navigate to `/dashboard/create`
2. Click both "Website" and "Mobile App" buttons
3. Enter a prompt describing a full-stack project
4. Click "Generate Project"
5. Verify both website and mobile app code are generated

## API Key Required

Make sure to add your Grok API key to `backend/.env`:
```
GROK_API_KEY=your-grok-api-key-here
```

## Status

✅ Backend implementation complete
✅ Frontend UI complete
✅ Type definitions updated
✅ Backward compatibility maintained
🔄 Ready for testing with Grok API
