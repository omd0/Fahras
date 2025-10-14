# UI Documentation

This directory contains comprehensive documentation for the Fahras project's user interface components, themes, and patterns.

## Documentation Structure

- **[UI Overview](./ui-overview.md)** - High-level overview of the UI architecture and design system
- **[Theme System](./theme-system.md)** - Material-UI theme configuration and customization
- **[Grid System](./grid-system.md)** - Responsive grid layouts and spacing patterns
- **[Components](./components.md)** - Custom components and their usage patterns
- **[Pages](./pages.md)** - Page layouts and navigation patterns
- **[UI Patterns](./ui-patterns.md)** - Common patterns and best practices

## Technology Stack

- **React 19.1.1** - Frontend framework
- **Material-UI v7.3.2** - Component library and design system
- **TypeScript 4.9.5** - Type safety and development experience  bf
- **React Router v7.9.1** - Client-side routing
- **Zustand 5.0.8** - State management
- **Axios 1.12.2** - HTTP client

## Quick Reference

### Key UI Principles
1. **Consistency** - Use Material-UI components consistently across the application
2. **Accessibility** - Follow Material-UI's accessibility guidelines
3. **Responsiveness** - Design mobile-first with responsive breakpoints
4. **Performance** - Optimize component rendering and bundle size
5. **Maintainability** - Keep components modular and reusable

### Common Patterns
- Use `Grid` with `size` prop for responsive layouts
- Always provide fallbacks for arrays and API responses
- Use Material-UI's `sx` prop for styling
- Implement proper loading and error states
- Follow the established navigation patterns

## Getting Started

1. Read the [UI Overview](./ui-overview.md) to understand the architecture
2. Review the [Theme System](./theme-system.md) for styling guidelines
3. Check [Components](./components.md) for available reusable components
4. Follow [UI Patterns](./ui-patterns.md) for common use cases

## Contributing

When adding new UI components or patterns:
1. Follow existing conventions and patterns
2. Update relevant documentation files
3. Ensure accessibility compliance
4. Test responsive behavior
5. Add TypeScript types for all props
