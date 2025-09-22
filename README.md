# Task Management Board

A modern, responsive task management application built with React, TypeScript, and Zustand. Features drag-and-drop functionality, real-time filtering, task history tracking, and mobile-responsive design.

## Time spent

~5 Hours

## Shortcuts Taken

### AI Agents

I've used Cursor to write a large portion of the tests as well as some UI elements and this README.md.

I considered using a JSON api(to be fancy), but due to time constraints I decided to only use Zustand's built-in helper for local persistance.

Backwards compatibility for the local storage schema was considered, but again due to time constraints, the implementation is not currently backwards compatible.

The App is currently responsive, but I think there are a lot of improvement that could be made to improve the user experience if they use a mobile device.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ferdipret/cred-task
   cd cred-task
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Run ESLint

## Architecture

### Tech Stack

- **React 19** - UI framework with hooks
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **@atlaskit/pragmatic-drag-and-drop** - Drag and drop functionality
- **Heroicons** - Icon library
- **Vitest** - Testing framework

### State Management

The application uses **Zustand** for state management with the following key features:

- **Persistent Storage**: State automatically persists to localStorage
- **History Tracking**: Maintains last 5 actions for undo functionality
- **Filtering**: Global search and status-based filtering

### Core Components

#### Store (`src/store/`)

- `index.ts` - Main Zustand store with actions and persistence
- `types.ts` - TypeScript interfaces and types
- `store.test.ts` - Comprehensive unit tests

#### UI Components

- `Board.tsx` - Main board container with drag-and-drop logic
- `Column.tsx` - Individual task columns (Todo, In Progress, Done)
- `TaskCard.tsx` - Individual task cards with inline editing
- `TaskHistory.tsx` - History log display component
- `FilterBar.tsx` - Search and filter controls
- `AddTaskButton.tsx` - Task creation with lightbox
- `EditTaskLightbox.tsx` - Task editing modal
- `Lightbox.tsx` - Reusable modal wrapper

### Key Features

#### Drag and Drop

- Cross-column task movement
- Within-column reordering
- Touch-friendly mobile support

#### Task Management

- Inline title editing
- Full task editing via lightbox
- Task deletion with confirmation
- Real-time character counting

#### Filtering & Search

- Global search across titles and descriptions
- Status-based filtering (show/hide columns)
- Visual feedback for active filters
- Clear filters functionality

#### Responsive Design

- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-optimized interactions
- Responsive lightboxes and modals

#### Data Persistence

- Automatic localStorage persistence
- Data migration for backward compatibility
- History tracking with configurable limits
- Error handling for storage failures

### File Structure

```
src/
├── components/          # React components
├── store/              # Zustand store and types
├── constants.ts        # Application constants
└── main.tsx           # Application entry point
```

### Testing

The application includes comprehensive unit tests covering:

- Store actions and state management
- Task CRUD operations
- Filter functionality
- History management
- Error handling

Run tests with `pnpm test` or `pnpm test:watch` for development.
