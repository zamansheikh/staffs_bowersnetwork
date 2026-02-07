# Copilot Instructions for Staffs Bowersnetwork

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
Staffs Bowersnetwork is a staff management portal for BowlersNetwork operations. This portal allows staff members to access administrative tools, manage events, and oversee bowling center operations.

## Tech Stack
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: JWT-based with token stored in localStorage

## Architecture Guidelines
- Use Next.js App Router structure (`/src/app`)
- Implement client components with `'use client'` directive when needed
- Create reusable components in `/components` directory
- Use TypeScript interfaces for type safety
- Follow RESTful API patterns for data fetching

## Color Theme
- **Background**: White (#FFFFFF)
- **Text**: Black (#171717)
- **Links/URLs**: Green (#22C55E)
- **Buttons**: Black with white text

## Authentication Flow
1. Staff login via `/api/auth/login/staff` (proxies to backend)
2. Token stored in localStorage
3. Profile fetched from `https://test.bowlersnetwork.com/api/profile/data`
4. Protected routes redirect to signin if not authenticated

## Component Naming Conventions
- Use PascalCase for component names
- Use descriptive names that indicate functionality

## Styling Guidelines
- Use Tailwind CSS utility classes
- Implement responsive design (mobile-first approach)
- Maintain black/white/green color scheme throughout
- Use modern, clean UI design principles

## API Integration
- Use Axios for HTTP requests
- Create API utilities in `/lib` directory
- Implement error handling for all API calls

## Code Quality
- Write clean, readable code with proper TypeScript typing
- Use meaningful variable and function names
- Handle loading states and errors gracefully
