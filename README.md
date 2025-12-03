# 📘 Code Canva – AI-Powered Collaborative Coding Workspace

Code Canva is a modern, cloud-powered collaborative IDE built with **Next.js**, **AI-driven developer tools**, and a sleek **shadcn/ui** interface.  
It enables developers to write, understand, and execute code directly in the browser with intelligent AI assistance.

---

## 🚀 Features

### 🔹 AI Developer Tools
- Code Completion Suggestions  
- Code Execution Runtime  
- Code Explanation on Hover  
- Modular AI pipeline (`src/ai/flows/`)

### 🔹 Cloud IDE Capabilities
- In-browser code editor  
- Live preview (depending on runtime integration)  
- Canvas workspace page  
- Optimized developer-friendly UI

### 🔹 Authentication & UI
- Clean login flow  
- Modern layout with sidebar/header/user nav  
- Rich UI with shadcn components  

### 🔹 Dark & Light Mode
- Full theme switching with custom `theme-provider`

---

## 🧩 Tech Stack

- **Next.js 14+** (App Router)
- **Tailwind CSS v4**
- **TypeScript**
- **shadcn/ui**
- **Genkit** (AI Flows)
- **Vercel-ready deployment**

---

## 📂 Directory Structure
```bash
└── arjung352-code-canva/
    ├── README.md                         # Main project documentation
    ├── components.json                   # shadcn/ui component registry
    ├── next.config.ts                    # Next.js configuration
    ├── package.json                      # Project dependencies & scripts
    ├── postcss.config.mjs                # PostCSS configuration
    ├── tailwind.config.ts                # TailwindCSS configuration
    ├── tsconfig.json                     # TypeScript configuration
    ├── .modified                         # Internal file for tracking changes
    ├── docs/
    │   └── blueprint.md                  # High-level project blueprint and architecture notes
    └── src/
        ├── ai/
        │   ├── dev.ts                    # Dev-mode AI utilities
        │   ├── genkit.ts                 # Genkit core configuration
        │   └── flows/
        │       ├── code-completion-suggestions.ts # AI flow for code suggestions
        │       ├── code-execution.ts              # AI-powered code execution handler
        │       └── code-explanation-on-hover.ts   # Hover-to-explain AI functionality
        ├── app/
        │   ├── globals.css               # Global styles
        │   ├── layout.tsx                # Root layout for the Next.js app
        │   ├── page.tsx                  # Home/Landing page
        │   ├── canvas/
        │   │   ├── layout.tsx            # Layout wrapper for the code canvas
        │   │   └── page.tsx              # Main code editor/canvas page
        │   ├── contact/
        │   │   └── page.tsx              # Contact page
        │   └── login/
        │       └── page.tsx              # Login interface page
        ├── components/
        │   ├── logo.tsx                  # Application logo component
        │   ├── theme-provider.tsx        # Theme provider for dark/light mode
        │   ├── theme-toggle.tsx          # UI toggle for switching theme
        │   ├── auth/
        │   │   └── login-form.tsx        # Login form UI
        │   ├── editor/
        │   │   └── code-editor.tsx       # Core code editor component
        │   ├── Footer/
        │   │   └── Footer.tsx            # Footer section
        │   ├── layout/
        │   │   ├── app-header-content.tsx # Content inside the header
        │   │   ├── app-sidebar.tsx        # Sidebar navigation
        │   │   ├── header.tsx             # Main header component
        │   │   └── user-nav.tsx           # User profile dropdown navigation
        │   ├── notifications/
        │   │   └── notification-center.tsx # Notification system UI
        │   ├── OurServices/
        │   │   └── OurServices.tsx        # Services section for marketing
        │   ├── Testimonals/
        │   │   └── Testimonials.tsx       # Testimonials UI section
        │   └── ui/                        # shadcn/ui components
        │       ├── accordion.tsx          # Accordion component
        │       ├── alert-dialog.tsx       # Alert dialog
        │       ├── alert.tsx              # Alert component
        │       ├── animated-testimonials.tsx # Animated testimonials
        │       ├── avatar.tsx             # Avatar component
        │       ├── badge.tsx              # Badge UI
        │       ├── button.tsx             # Button component
        │       ├── calendar.tsx           # Calendar UI
        │       ├── card.tsx               # Card component
        │       ├── carousel.tsx           # Carousel UI
        │       ├── chart.tsx              # Chart wrapper
        │       ├── checkbox.tsx           # Checkbox component
        │       ├── collapsible.tsx        # Collapsible UI
        │       ├── dialog.tsx             # Dialog window
        │       ├── dropdown-menu.tsx      # Dropdown menu UI
        │       ├── form.tsx               # Form utilities
        │       ├── input.tsx              # Input field component
        │       ├── label.tsx              # Label UI
        │       ├── menubar.tsx            # Menubar UI
        │       ├── popover.tsx            # Popover element
        │       ├── progress.tsx           # Progress indicator
        │       ├── radio-group.tsx        # Radio group component
        │       ├── scroll-area.tsx        # Scrollable area UI
        │       ├── select.tsx             # Select dropdown
        │       ├── separator.tsx          # Separator/divider UI
        │       ├── sheet.tsx              # Sheet/slide-over component
        │       ├── sidebar.tsx            # Sidebar container
        │       ├── skeleton.tsx           # Skeleton loader
        │       ├── slider.tsx             # Range slider
        │       ├── spotlight-new.tsx      # Spotlight search component
        │       ├── switch.tsx             # Toggle switch
        │       ├── table.tsx              # Table UI component
        │       ├── tabs.tsx               # Tabs UI
        │       ├── textarea.tsx           # Textarea component
        │       ├── toast.tsx              # Toast notification UI
        │       ├── toaster.tsx            # Toaster wrapper
        │       └── tooltip.tsx            # Tooltip component
        ├── hooks/
        │   ├── use-mobile.tsx             # Mobile viewport detection hook
        │   └── use-toast.ts               # Custom toast hook
        └── lib/
            ├── placeholder-images.json    # Sample placeholder images
            └── utils.ts                   # Helper utility functions

```
---

## 🛠️ Installation

Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```
## 🎨 Theme support

Theme switching is handled via:

`src/components/theme-provider.tsx`
`src/components/theme-toggle.tsx`

Fully compatible with Tailwind’s dark mode.
