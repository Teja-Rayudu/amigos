# 🎨 Dietamigo Theme System Guide

## Overview
This guide explains how to use the shadcn theme system consistently throughout your Dietamigo application without changing any colors. Your app will automatically adapt between light and dark modes while maintaining your brand identity.

## 🎯 Key Principles

### ✅ DO: Use Theme Variables
- Always use CSS custom properties (theme variables)
- Use semantic color names instead of specific colors
- Let the theme system handle light/dark mode transitions

### ❌ DON'T: Use Hardcoded Colors
- Avoid hex colors like `#5ea500` or `#000000`
- Don't use fixed Tailwind colors like `bg-green-500`
- Don't use inline styles for colors

## 🎨 Theme Color System

### Background Colors
```jsx
// Page backgrounds
className="bg-background"           // Main app background
className="bg-card"                 // Card/panel backgrounds  
className="bg-popover"              // Modal/dropdown backgrounds
className="bg-sidebar"              // Sidebar background
```

### Text Colors
```jsx
// Text colors
className="text-foreground"         // Primary text
className="text-muted-foreground"   // Secondary text
className="text-card-foreground"    // Text on cards
className="text-sidebar-foreground" // Sidebar text
```

### Interactive Elements
```jsx
// Buttons and interactive elements
className="bg-primary text-primary-foreground"           // Primary buttons
className="bg-secondary text-secondary-foreground"       // Secondary buttons
className="bg-accent text-accent-foreground"             // Accent elements
className="hover:bg-accent hover:text-accent-foreground" // Hover states
```

### Borders and Separators
```jsx
// Borders
className="border-border"           // Standard borders
className="border-input"            // Input field borders
className="border-sidebar-border"   // Sidebar borders
```

## 🚀 Implementation Examples

### Dashboard Page Structure
```jsx
function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-background/95 backdrop-blur border-b border-border">
        <h1 className="text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Subtitle text</p>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <Card className="bg-card text-card-foreground border-border">
          <CardContent>
            <p className="text-foreground">Main content</p>
            <p className="text-muted-foreground">Secondary text</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
```

### Button Variations
```jsx
// Primary action
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Save Changes
</Button>

// Secondary action  
<Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Cancel
</Button>

// Ghost/subtle action
<Button className="hover:bg-accent hover:text-accent-foreground">
  Learn More
</Button>
```

### Form Elements
```jsx
<div className="space-y-4">
  <label className="text-foreground font-medium">
    Email Address
  </label>
  <input 
    className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
    placeholder="Enter your email"
  />
  <p className="text-muted-foreground text-sm">
    We'll never share your email
  </p>
</div>
```

### Status Indicators (Theme-Aware)
```jsx
// Success state (works in both light/dark)
<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
  Success
</Badge>

// Warning state
<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
  Warning
</Badge>

// Error state  
<Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
  Error
</Badge>
```

## 🎨 Brand Color Integration

### Your Green Brand Color
For your signature green color (#5ea500), use these theme-aware classes:
```jsx
// Light mode: green-600, Dark mode: green-400
<span className="text-green-600 dark:text-green-400">I</span>

// For backgrounds
<div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
  Success message
</div>
```

### Logo Text (Theme-Aware)
```jsx
<h1 className="text-sidebar-foreground">
  <span className="text-sidebar-foreground">DIETAM</span>
  <span className="text-green-600 dark:text-green-400">I</span>
  <span className="text-sidebar-foreground">GO</span>
</h1>
```

## 🔧 Theme Toggle Implementation

Your app now includes a theme toggle in the user menu with options for:
- **Light mode**: Uses your light theme colors
- **Dark mode**: Uses your dark theme colors  
- **System**: Follows user's OS preference

## 📱 Page-Specific Implementations

### Dashboard Page
```jsx
// Main layout
<div className="min-h-screen bg-background text-foreground">
  // Stats cards
  <Card className="bg-card text-card-foreground border-border">
    // Content
  </Card>
</div>
```

### Exercise Trainer Page
```jsx
// Workout cards
<Card className="bg-card text-card-foreground">
  <CardHeader>
    <CardTitle className="text-foreground">Workout Session</CardTitle>
    <p className="text-muted-foreground">30 minutes</p>
  </CardHeader>
</Card>
```

### Diet Recommender Page
```jsx
// Recipe cards
<Card className="bg-card border-border hover:bg-accent/50 transition-colors">
  <CardContent>
    <h3 className="text-foreground font-semibold">Recipe Name</h3>
    <p className="text-muted-foreground">Calories and description</p>
  </CardContent>
</Card>
```

### Journal Page
```jsx
// Journal entries
<Card className="bg-card text-card-foreground border-border">
  <CardHeader>
    <time className="text-muted-foreground text-sm">Today</time>
    <CardTitle className="text-foreground">Journal Entry</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Entry content...</p>
  </CardContent>
</Card>
```

### Progress Analysis Page
```jsx
// Chart containers
<Card className="bg-card text-card-foreground border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Weight Progress</CardTitle>
  </CardHeader>
  <CardContent>
    // Chart with theme-aware colors
    <div className="h-64 bg-muted/20 rounded-lg">
      // Chart implementation
    </div>
  </CardContent>
</Card>
```

## 🎯 Best Practices

### 1. Consistent Card Styling
```jsx
// Standard card
<Card className="bg-card text-card-foreground border-border">

// Interactive card
<Card className="bg-card text-card-foreground border-border hover:bg-accent/50 transition-colors cursor-pointer">

// Highlighted card
<Card className="bg-primary/5 text-foreground border-primary/20">
```

### 2. Navigation Elements
```jsx
// Active navigation item
<div className="bg-accent text-accent-foreground">

// Inactive navigation item  
<div className="text-foreground hover:bg-accent hover:text-accent-foreground">
```

### 3. Form Feedback
```jsx
// Success state
<p className="text-green-600 dark:text-green-400">Success message</p>

// Error state
<p className="text-red-600 dark:text-red-400">Error message</p>

// Info state
<p className="text-blue-600 dark:text-blue-400">Info message</p>
```

## 🚀 Migration Checklist

- [ ] Replace hardcoded colors with theme variables
- [ ] Update all component backgrounds to use `bg-card`, `bg-background`, etc.
- [ ] Update all text colors to use `text-foreground`, `text-muted-foreground`, etc.
- [ ] Add theme toggle to navigation
- [ ] Test both light and dark modes
- [ ] Verify brand green color works in both themes
- [ ] Check all interactive states (hover, focus, active)

## 🎉 Result

After implementing this theme system:
- ✅ Your app works perfectly in both light and dark modes
- ✅ Brand colors are preserved and theme-aware
- ✅ No hardcoded colors break the theme switching
- ✅ Consistent design across all pages
- ✅ Automatic OS preference detection
- ✅ Smooth transitions between themes