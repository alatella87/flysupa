# FlySupa Project Guide

## Build/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript type check)
- `npm run lint` - Run ESLint on all files
- `npm test` - Run all tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:run` - Run tests once without watch mode
- `npm test -- -t "test name"` - Run a specific test

## Code Style Guidelines
- TypeScript with strict typing; any is allowed (@typescript-eslint/no-explicit-any is off)
- React components use functional style with hooks
- Path aliases: import from '@/components', '@/lib/utils', etc.
- UI components use shadcn/ui style (see components/ui)
- Component naming: PascalCase for components, camelCase for functions/variables
- Form validation: Uses react-hook-form with zod resolvers

## Project Structure
- Components use shadcn/ui patterns and Tailwind CSS
- Authentication via Supabase
- UI state management through React context (UserContext)
- Follow existing import ordering: React, libraries, local component

## Environment Variables
- Environment variables must be prefixed with `VITE_` to be exposed to the client
- Store sensitive variables in `.env` file (not committed to git)
- Reference variables using `import.meta.env.VITE_VARIABLE_NAME`
- Required environment variables:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- For deployment, add these environment variables in Vercel dashboard

## Features
 
Qualifies:

  11.   Upload Licence  
  7.    Search and filtering capabilities
  12.   Usernames fix (nome/cognome insieme)

  8.    Calendar view for lesson scheduling
  10.   Lesson template system
  4.    Enhanced student dashboard views

Maybe Later
  1.    Admin Dashboard implementation
  2.    License management functionality
  3.    Student progress analytics
  5.    Report/certificate generation
  6.    Notification system
  9.    Payment processing integration
