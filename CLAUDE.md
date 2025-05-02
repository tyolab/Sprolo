# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **Imports**: Use absolute imports with @ alias (e.g., @/components/ui/button)
- **Types**: Always use TypeScript types/interfaces; export from lib/types.ts
- **Components**: 
  - Use "use client" directive for client components
  - Prefer functional components with explicit type definitions
- **Error Handling**: Use try/catch with specific error messages in console.error
- **Naming**: Use camelCase for variables/functions, PascalCase for components/interfaces
- **Formatting**: Follow Next.js conventions with 2-space indentation
- **UI Components**: Use components from @/components/ui/ with tailwind classes
- **Utilities**: Common utility functions belong in lib/utils.ts
- **Data Handling**: Use proper validation before processing user inputs