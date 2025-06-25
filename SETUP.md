# SundayL Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file and fill in your API keys:
```bash
cp env.example .env.local
```

**Required API Keys:**
- **Supabase**: Create a project at [supabase.com](https://supabase.com)
- **Clerk**: Set up authentication at [clerk.com](https://clerk.com)
- **Gmail API**: Create credentials in [Google Cloud Console](https://console.cloud.google.com)
- **OpenAI/Anthropic**: Get API keys for AI processing

### 3. Initialize Next.js App
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### 4. Start Development Server
```bash
npm run dev
```

## Project Structure

```
sundayl/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript definitions
│   └── hooks/               # Custom React hooks
├── docs/                    # Documentation
├── plan.md                  # Development roadmap
├── next-steps.md           # Immediate next steps
└── SETUP.md                # This file
```

## Key Files Created

- **`README.md`**: Project overview and documentation
- **`plan.md`**: Comprehensive development roadmap
- **`next-steps.md`**: Immediate action items
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration
- **`tailwind.config.js`**: Styling configuration
- **`src/types/`**: TypeScript type definitions
- **`src/lib/supabase.ts`**: Database client setup

## Next Steps

1. **Set up external services** (Supabase, Clerk, Gmail API)
2. **Create database schema** in Supabase
3. **Build basic UI components**
4. **Implement Gmail API integration**
5. **Add AI processing capabilities**

## Development Workflow

1. Check `plan.md` for overall roadmap
2. Review `next-steps.md` for immediate tasks
3. Update progress in `plan.md` as you complete items
4. Use TypeScript for all new code
5. Follow the established file structure

## Getting Help

- Check the `plan.md` file for detailed technical specifications
- Review `next-steps.md` for immediate action items
- All TypeScript types are defined in `src/types/`
- Database operations are handled in `src/lib/supabase.ts` 