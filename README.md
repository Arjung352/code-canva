# Code Canva

Code Canva is a collaborative coding workspace designed for teams to build, review, and run code together in a browser-based environment. The project combines a modern Next.js frontend with AI-powered coding assistance, collaborative editing patterns, and a scalable backend architecture for multi-user workspaces.

## Overview

This application aims to provide:

- Collaborative code editing with real-time workspace awareness
- Team-based project organization and permission management
- AI-powered code completion, explanation, and execution support
- A developer-friendly interface inspired by modern coding platforms
- Flexible data models for workspaces, files, comments, presence, and version history

---

## System Architecture

```text
                              ┌───────────────────────┐
                              │       USERS           │
                              │                       │
                              │  Browser A  Browser B │
                              └───────────┬───────────┘
                                          │
                              HTTPS / WebSocket
                                          │
                                          ▼
                    ┌─────────────────────────────────────┐
                    │          NEXT.JS FRONTEND            │
                    │                                     │
                    │  ┌──────────┐  ┌───────────────┐   │
                    │  │Monaco    │  │File Explorer  │   │
                    │  │Editor    │  │Workspace UI   │   │
                    │  └──────────┘  └───────────────┘   │
                    │                                     │
                    │  Chat │ Video │ Terminal │ Presence │
                    └───────────────┬─────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                       REST                  WebSocket
                       HTTP                 Socket.IO
                         │                     │
                         ▼                     ▼
              ┌─────────────────────────────────────────┐
              │             Next.JS SERVER            │
              │                                         │
              │  ┌────────────────────────────────────┐ │
              │  │          MIDDLEWARE LAYER          │ │
              │  │                                    │ │
              │  │ Auth │ CORS │ Rate Limit │ Zod     │ │
              │  │ Error Handler │ Logger │ RBAC       │ │
              │  └──────────────────┬─────────────────┘ │
              │                     │                   │
              │  ┌──────────────────▼─────────────────┐ │
              │  │             API ROUTES             │ │
              │  │                                    │ │
              │  │ /auth                             │ │
              │  │ /users                            │ │
              │  │ /workspaces                       │ │
              │  │ /files                            │ │
              │  │ /comments                         │ │
              │  │ /versions                         │ │
              │  │ /execution                        │ │
              │  └──────────────────┬─────────────────┘ │
              │                     │                   │
              │  ┌──────────────────▼─────────────────┐ │
              │  │           CONTROLLERS              │ │
              │  │                                    │ │
              │  │ AuthController                     │ │
              │  │ WorkspaceController                │ │
              │  │ FileController                     │ │
              │  │ ExecutionController                │ │
              │  └──────────────────┬─────────────────┘ │
              │                     │                   │
              │  ┌──────────────────▼─────────────────┐ │
              │  │             SERVICES               │ │
              │  │                                    │ │
              │  │ AuthService                        │ │
              │  │ WorkspaceService                   │ │
              │  │ FileService                        │ │
              │  │ CollaborationService               │ │
              │  │ ExecutionService                   │ │
              │  │ VersionService                     │ │
              │  └───────────────┬────────────────────┘ │
              │                  │                       │
              │  ┌───────────────▼────────────────────┐ │
              │  │          SOCKET.IO LAYER            │ │
              │  │                                    │ │
              │  │ workspace:join                    │ │
              │  │ editor:update                     │ │
              │  │ cursor:update                     │ │
              │  │ presence:update                   │ │
              │  │ chat:message                      │ │
              │  │ video:signal                      │ │
              │  └───────────────┬────────────────────┘ │
              └──────────────────┼──────────────────────┘
                                 │
              ┌──────────────────┼────────────────────────┐
              │                  │                        │
              ▼                  ▼                        ▼
      ┌───────────────┐  ┌────────────────┐      ┌───────────────┐
      │  PostgreSQL   │  │     Redis      │      │ Object Store  │
      │               │  │                │      │     S3        │
      │ Users         │  │ Presence       │      │               │
      │ Workspaces    │  │ Pub/Sub        │      │ Project files │
      │ Members       │  │ Socket adapter │      │ Assets        │
      │ Files         │  │ Sessions       │      │ Snapshots     │
      │ Versions      │  │ Rate limiting  │      │               │
      │ Messages      │  │                │      └───────────────┘
      └───────────────┘  └────────────────┘
                                 │
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │   COLLABORATION ENGINE │
                     │                        │
                     │      Yjs / CRDT        │
                     │                        │
                     │ Shared Documents       │
                     │ Conflict Resolution    │
                     │ Document Sync           │
                     └────────────┬───────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │   EXECUTION SERVICE    │
                     │                        │
                     │ Queue / Worker         │
                     │                        │
                     │      Docker            │
                     │   ┌──────────────┐     │
                     │   │ Java         │     │
                     │   │ JavaScript   │     │
                     │   │ Python       │     │
                     │   │ C/C++        │     │
                     │   └──────────────┘     │
                     │                        │
                     │ CPU / RAM / Timeout    │
                     │ Isolation              │
                     └────────────────────────┘
```

---

## Folder Structure

```text
code-canva/
├── README.md                               # Project overview, setup steps, and architecture docs
├── components.json                         # shadcn/ui configuration and component registry
├── docs/                                   # Design notes and product blueprint
│   └── blueprint.md                        # Product/feature blueprint and architecture ideas
├── prisma/                                 # Database and Prisma-related files
│   ├── schema.prisma                       # Prisma schema for application data models
│   └── migrations/                         # SQL migration history for the database
│       └── ...
├── public/                                 # Static assets served by Next.js (images, icons, etc.)
├── src/                                    # Main application source code
│   ├── ai/                                 # AI assistant features and Genkit flow logic
│   │   ├── dev.ts                          # Local AI/dev tooling setup
│   │   ├── genkit.ts                       # Genkit configuration and initialization
│   │   └── flows/                          # AI workflows for coding assistance
│   │       ├── code-completion-suggestions.ts  # Suggests code completions
│   │       ├── code-execution.ts               # Runs or prepares code execution logic
│   │       └── code-explanation-on-hover.ts    # Explains code when hovered over
│   ├── app/                                # Next.js App Router pages and API routes
│   │   ├── api/                            # Server-side API endpoints
│   │   │   ├── invites/                    # Invite flows and invitations API
│   │   │   ├── teams/                      # Team-related API routes
│   │   │   └── webhooks/                   # Webhook handlers for external events
│   │   ├── canvas/                         # Collaborative coding workspace page
│   │   │   ├── layout.tsx                  # Canvas-specific layout wrapper
│   │   │   └── page.tsx                    # Main editor/canvas experience
│   │   ├── contact/                        # Public contact page
│   │   │   └── page.tsx                    # Contact page UI
│   │   ├── globals.css                     # Global styling and theme layers
│   │   ├── layout.tsx                      # Root app layout and shell
│   │   ├── page.tsx                        # Landing/home page
│   │   └── teams/                          # Team management and team pages
│   │       ├── create/                     # Team creation flow
│   │       └── [teamId]/                   # Team-specific dashboard/page routes
│   ├── components/                         # Reusable UI components for the app
│   │   ├── editor/                         # Editor-related UI components
│   │   │   └── code-editor.tsx             # Monaco-based code editor component
│   │   ├── Footer/                         # Footer UI section
│   │   │   └── Footer.tsx                  # Website footer markup
│   │   ├── HeroSection/                    # Marketing/landing banner section
│   │   │   └── HeroSection.tsx             # Hero section UI
│   │   ├── OurServices/                    # Services/features section
│   │   │   └── OurServices.tsx             # Services display component
│   │   ├── Roadmap/                        # Product roadmap UI
│   │   │   └── Roadmap.tsx                 # Roadmap timeline section
│   │   ├── Testimonals/                    # Testimonial section
│   │   │   └── Testimonials.tsx            # Customer testimonial cards
│   │   ├── layout/                         # App shell: header, sidebar, nav
│   │   │   ├── app-header-content.tsx      # Header content area logic
│   │   │   ├── app-sidebar.tsx             # Main sidebar navigation
│   │   │   ├── header.tsx                  # Top header component
│   │   │   ├── NavbarWrapper.tsx           # Navbar wrapper for layout behavior
│   │   │   └── user-nav.tsx                # User profile menu and actions
│   │   ├── notifications/                  # Notification center UI
│   │   │   └── notification-center.tsx     # In-app notifications panel
│   │   ├── ui/                             # Reusable shadcn/ui primitives
│   │   │   └── ...shadcn/ui components     # Buttons, cards, dialogs, inputs, etc.
│   │   ├── logo.tsx                        # Brand/logo component
│   │   ├── theme-provider.tsx              # Theme context for Dark/Light mode
│   │   └── theme-toggle.tsx                # Theme switch control
│   ├── generated/                          # Generated Prisma client files
│   │   └── prisma/                          # Auto-generated Prisma models and types
│   │       └── ...generated Prisma client files
│   ├── hooks/                              # Reusable React hooks
│   │   ├── use-mobile.tsx                  # Detects mobile viewport state
│   │   └── use-toast.ts                    # Toast notification helper hook
│   ├── lib/                                # Shared utilities and app libraries
│   │   ├── placeholder-images.json         # Placeholder media dataset
│   │   ├── prisma.ts                       # Prisma client singleton
│   │   └── utils.ts                        # Common helper functions
│   ├── middleware.ts                       # Next.js middleware logic (auth, routing, security)
│   ├── proxy.ts                            # Proxy layer or request forwarding logic
│   └── schemaValidation/                   # Input validation schemas
│       └── authSchemaValidation.ts         # Validation rules for auth-related requests
├── next-env.d.ts                           # Next.js TypeScript environment declarations
├── next.config.ts                          # Next.js framework configuration
├── package.json                            # Project scripts and dependencies
├── postcss.config.mjs                      # PostCSS processing configuration
├── prisma.config.ts                        # Prisma runtime configuration
├── tailwind.config.ts                     # Tailwind CSS configuration
├── tsconfig.json                           # TypeScript compiler settings
├── .gitignore                              # Git ignore rules
└── .env.example or .env.local             # Environment variables (if present in your setup)
```

---

## Key Technology Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Monaco Editor
- Genkit AI flows
- shadcn/ui component library
- Clerk for authentication workflows
- Redis for real-time collaboration support

---

## Data Models

The database is designed around shared workspaces, collaborative files, users, presence, messages, and version tracking.

```sql
users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now()
)

workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
)

workspace_members (
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id),
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
)

nodes (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  parent_id UUID REFERENCES nodes(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('file', 'folder')),
  language TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
)

file_documents (
  file_id UUID PRIMARY KEY REFERENCES nodes(id),
  content TEXT,
  crdt_state BYTEA,
  updated_at TIMESTAMP DEFAULT now()
)

file_versions (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES nodes(id),
  content TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
)

workspace_presence (
  workspace_id UUID,
  user_id UUID,
  status TEXT,
  cursor_position JSONB,
  last_seen TIMESTAMP,
  PRIMARY KEY (workspace_id, user_id)
)

comments (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES nodes(id),
  user_id UUID REFERENCES users(id),
  content TEXT,
  line_number INT,
  created_at TIMESTAMP DEFAULT now()
)

workspace_messages (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT now()
)
```

### Data Model Notes

- `users` stores account and profile information.
- `workspaces` represents a collaborative project space.
- `workspace_members` manages access and permissions for each user in a workspace.
- `nodes` supports file and folder hierarchy inside a workspace.
- `file_documents` keeps the live document state and snapshot content.
- `file_versions` stores change history for revisions and auditing.
- `workspace_presence` tracks online status and editor cursor state.
- `comments` adds contextual feedback tied to a file and line number.
- `workspace_messages` stores team chat messages within a workspace.

---

## Getting Started

Install dependencies:

```bash
npm install
```

Generate Prisma client and prepare the database:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

The app will be available locally through the configured Next.js port.

---

## Project Goals

Code Canva is intended to become a browser-based collaborative coding platform with features similar to a modern remote IDE, including:

- multi-user editing
- workspace-level collaboration
- AI support for coding tasks
- version history and file snapshots
- execution environments for code compilation and testing

---

## Notes

This repository is currently structured as a modern Next.js application foundation for collaborative coding workflows. Additional backend services, real-time collaboration infrastructure, execution workers, and production deployment configuration can be layered on top of the existing front-end and Prisma foundation.
