# Command Palette

A global command palette component that provides quick access to navigation and actions throughout the Fahras application.

## Features

- **Global Keyboard Shortcut**: Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac) to open the command palette from anywhere
- **Quick Navigation**: Instantly navigate to any page in the application
- **Smart Search**: Fuzzy search with support for both English and Arabic
- **Role-Based Commands**: Only shows commands relevant to the user's role and authentication state
- **Categorized Commands**: Commands are organized by category for easy browsing
- **Bilingual Support**: Full support for English and Arabic with localized labels

## Usage

### Opening the Command Palette

Press `Ctrl+K` (or `Cmd+K` on Mac) to open the command palette. Press `Escape` to close it.

### Searching

Start typing to filter commands. The search supports:
- Command names (English and Arabic)
- Keywords
- Fuzzy matching

### Navigation

Use arrow keys to navigate through commands, then press `Enter` to execute the selected command.

## Available Commands

### Navigation Commands
- Go to Home
- Explore Projects
- Go to Dashboard (requires auth)
- My Bookmarks
- My Profile (requires auth)
- Settings (requires auth)
- Notifications (requires auth)

### Action Commands
- Create New Project (requires auth)

### Student Commands (Student Role Only)
- My Projects

### Faculty Commands (Faculty Role Only)
- Advisor Projects
- Pending Approvals
- Evaluations

### Admin Commands (Admin Role Only)
- User Management
- Project Approvals
- Admin Projects
- Access Control
- Milestone Templates
- Analytics

### Account Commands (Guest Only)
- Login
- Register

## Implementation Details

### Component Structure

```typescript
<CommandPalette 
  open={boolean} 
  onClose={() => void} 
/>
```

### Integration

The command palette is integrated at the App level and listens for the global `Ctrl+K` / `Cmd+K` keyboard shortcut.

### Role-Based Filtering

Commands automatically filter based on:
1. Authentication state (`requiresAuth` property)
2. User roles (`allowedRoles` property)

### Adding New Commands

To add a new command, add an entry to the `allCommands` array in `CommandPalette.tsx`:

```typescript
{
  id: 'unique-command-id',
  label: 'English Label',
  labelAr: 'Arabic Label',
  icon: <IconComponent fontSize="small" />,
  onSelect: () => { navigate('/path'); onClose(); },
  category: 'Category Name',
  categoryAr: 'Category Name in Arabic',
  keywords: ['keyword1', 'keyword2', 'arabic', 'keywords'],
  requiresAuth?: true,  // Optional
  allowedRoles?: ['role1', 'role2'],  // Optional
}
```

## Dependencies

- `cmdk`: Command palette component library (v1.0.0+)
- `@mui/material`: Material-UI components for styling
- `react-router-dom`: For navigation
- `zustand`: For auth state management

## Accessibility

- Full keyboard navigation support
- Proper ARIA labels
- Screen reader friendly
- Focus management

## Performance

- Memoized command filtering
- Efficient search algorithm
- Minimal re-renders with React.memo patterns
- Lazy command evaluation
