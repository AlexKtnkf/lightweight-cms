# Quick Start Guide - Domain-Oriented Architecture

## Tech Stack Summary

- **Backend**: JavaScript (`.js`) - Plain JavaScript, no TypeScript
- **Admin Frontend**: TypeScript (`.ts`/`.tsx`) - Full TypeScript for React
- **Public Frontend**: EJS templates (unchanged)

## Setup Commands

### 1. Create Admin Directory with TypeScript

```bash
cd lightweight-cms
mkdir admin
cd admin

# Initialize Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install @tanstack/react-query react-router-dom zod react-hook-form @hookform/resolvers
npm install axios

# Install UI dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input textarea select card table form label
```

### 2. Backend Structure (JavaScript)

```bash
cd .. # back to lightweight-cms root

# Create domain structure
mkdir -p src/domain/{content,media,settings,auth}/{domain,application,infrastructure}
mkdir -p src/infrastructure/{database,static,storage}
mkdir -p src/presentation/{api/{admin,public},web}
mkdir -p src/shared/{errors,utils}
```

### 3. Update Root Package.json

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:admin\"",
    "dev:server": "node server.js",
    "dev:admin": "cd admin && npm run dev",
    "build:admin": "cd admin && npm run build",
    "start": "NODE_ENV=production node server.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

## File Extensions

- **Backend**: All `.js` files (JavaScript)
- **Admin**: All `.ts` or `.tsx` files (TypeScript)
- **Public**: `.ejs` templates (unchanged)

## Type Safety

- **Backend ↔ Admin**: Type safety via TypeScript types in admin
- **API Contracts**: Defined in `admin/src/domain/*/types.ts`
- **Runtime Validation**: Zod schemas in admin for form validation

## Next Steps

1. Follow `REWORK_IMPLEMENTATION.md` for detailed code
2. Start with domain models (JavaScript)
3. Then build React admin (TypeScript)
4. Wire everything together
