# Metronic Theme Integration for Job Genie

This document outlines the complete integration of the Metronic theme into the Job Genie application, providing a modern, professional UI with dark/light mode support, internationalization, and comprehensive component library.

## 🎨 What Has Been Integrated

### 1. **Theme System**
- **Dark/Light Mode**: Full theme switching with system preference detection
- **CSS Variables**: Comprehensive design token system using CSS custom properties
- **Color Palette**: Professional color scheme with proper contrast ratios
- **Typography**: Consistent font hierarchy and spacing

### 2. **Component Library**
- **UI Components**: Button, Card, Input, Select, Dialog, Toast, Badge, and more
- **Form Elements**: Input, Textarea, Select, Label with proper validation states
- **Layout Components**: Cards, Grids, and responsive containers
- **Interactive Elements**: Dropdowns, Modals, and Toast notifications

### 3. **Internationalization (i18n)**
- **Multi-language Support**: English, Spanish, French, German, Arabic, Chinese
- **Translation Hooks**: Easy-to-use `useTranslation` hook
- **Dynamic Language Switching**: Runtime language changes
- **Comprehensive Coverage**: All UI text is translatable

### 4. **State Management**
- **React Query**: Efficient data fetching and caching
- **Theme Context**: Global theme state management
- **Toast System**: Global notification system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run postinstall

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file with your database configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/job_genie"
DIRECT_URL="postgresql://username:password@localhost:5432/job_genie"
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles with Metronic theme
│   └── layout.tsx         # Root layout with providers
├── components/            # UI components
│   └── ui/               # Metronic theme components
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization
│   └── messages/          # Translation files
├── lib/                   # Utility functions
├── providers/             # Context providers
└── types/                 # TypeScript type definitions
    ├── api.ts            # API types
    └── database.ts       # Database schema types
```

## 🎯 Key Features

### Theme Toggle
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

// Automatically handles light/dark/system themes
<ThemeToggle />
```

### Internationalization
```tsx
import { useTranslation } from "@/hooks/useTranslation"

function MyComponent() {
  const { t, changeLanguage, currentLanguage } = useTranslation()
  
  return (
    <div>
      <h1>{t("navigation.dashboard")}</h1>
      <button onClick={() => changeLanguage("es")}>
        Switch to Spanish
      </button>
    </div>
  )
}
```

### UI Components
```tsx
import { Button, Card, Badge } from "@/components/ui"

// Professional button variants
<Button variant="default" size="lg">Primary Action</Button>
<Button variant="outline" size="sm">Secondary Action</Button>
<Button variant="destructive">Delete</Button>

// Card layouts
<Card>
  <CardHeader>
    <CardTitle>Job Title</CardTitle>
    <CardDescription>Job description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Rejected</Badge>
```

## 🌐 Available Languages

| Language | Code | File |
|----------|------|------|
| English | `en` | `en.json` |
| Spanish | `es` | `es.json` |
| French | `fr` | `fr.json` |
| German | `de` | `de.json` |
| Arabic | `ar` | `ar.json` |
| Chinese | `ch` | `ch.json` |

## 🎨 Theme Customization

### CSS Variables
The theme system uses CSS custom properties for easy customization:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(27.4% 0.006 286.033);
  --primary: #1379f0;
  --primary-foreground: oklch(1 0 0);
  --border: oklch(94% 0.004 286.32);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(14.1% 0.005 285.823);
  --foreground: oklch(98.5% 0 0);
  /* ... other dark theme variables */
}
```

### Component Variants
Components support multiple variants for different use cases:

```tsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Badge variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
```

## 📱 Responsive Design

The theme includes responsive utilities and components:

```tsx
// Responsive grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content adapts to screen size */}
</div>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding increases with screen size */}
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-4xl lg:text-6xl">
  {/* Text scales with screen size */}
</h1>
```

## 🔧 Development Workflow

### Adding New Components
1. Create component in `src/components/ui/`
2. Follow the established pattern with proper TypeScript types
3. Use the `cn()` utility for class merging
4. Include proper variants and props
5. Add to the component exports

### Adding New Translations
1. Add keys to `src/i18n/messages/en.json`
2. Add corresponding translations to other language files
3. Use the `t()` function in components

### Theme Customization
1. Modify CSS variables in `src/app/globals.css`
2. Update component variants as needed
3. Test in both light and dark modes

## 🧪 Testing

### Component Testing
```bash
# Run component tests
npm test

# Run with coverage
npm test -- --coverage
```

### Theme Testing
- Test components in both light and dark modes
- Verify proper contrast ratios
- Check responsive behavior
- Validate accessibility features

## 📚 Additional Resources

### Metronic Theme Documentation
- [Metronic UI Components](https://preview.keenthemes.com/metronic8/demo1/)
- [Design System Guidelines](https://preview.keenthemes.com/metronic8/demo1/documentation/)

### Next.js Integration
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Variables Support](https://tailwindcss.com/docs/customizing-colors#using-css-variables)

## 🤝 Contributing

When contributing to the theme integration:

1. **Follow the established patterns** for components and styling
2. **Maintain type safety** - no `any` types allowed
3. **Test in both themes** - light and dark modes
4. **Update translations** for all supported languages
5. **Document changes** in this README

## 🐛 Troubleshooting

### Common Issues

**Theme not switching:**
- Check if `ThemeProvider` is properly wrapped around your app
- Verify `next-themes` is installed and configured

**Translations not working:**
- Ensure `I18nProvider` is in the provider chain
- Check if translation keys exist in language files

**Styles not applying:**
- Verify `globals.css` is imported in the root layout
- Check if Tailwind CSS is properly configured

**Component errors:**
- Ensure all required dependencies are installed
- Check TypeScript types and imports

### Getting Help
- Check the component documentation
- Review the existing implementations
- Consult the Metronic theme documentation
- Open an issue with detailed error information

## 📄 License

This integration follows the same license as the Job Genie application. The Metronic theme components are adapted for internal use and follow best practices for modern web development.

---

**Note**: This integration provides a solid foundation for a professional job platform UI. All components are built with accessibility, performance, and maintainability in mind. The theme system is designed to be easily extensible for future requirements.
