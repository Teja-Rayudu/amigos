// Theme Usage Guide for Dietamigo
// This file contains examples of how to use shadcn theme variables consistently

// ✅ CORRECT: Use CSS variables for consistent theming
const correctThemeUsage = {
  // Background colors
  background: "bg-background",           // Main app background
  cardBackground: "bg-card",            // Card/panel backgrounds
  popoverBackground: "bg-popover",      // Dropdown/modal backgrounds
  sidebarBackground: "bg-sidebar",      // Sidebar background
  
  // Text colors
  foreground: "text-foreground",        // Main text color
  cardForeground: "text-card-foreground", // Text on cards
  mutedForeground: "text-muted-foreground", // Secondary text
  sidebarForeground: "text-sidebar-foreground", // Sidebar text
  
  // Interactive elements
  primary: "bg-primary text-primary-foreground", // Primary buttons
  secondary: "bg-secondary text-secondary-foreground", // Secondary buttons
  accent: "bg-accent text-accent-foreground", // Accent elements
  muted: "bg-muted text-muted-foreground", // Muted elements
  
  // Borders and separators
  border: "border-border",              // All borders
  input: "border-input",               // Input field borders
  ring: "ring-ring",                   // Focus rings
  
  // Sidebar specific
  sidebarPrimary: "bg-sidebar-primary text-sidebar-primary-foreground",
  sidebarAccent: "bg-sidebar-accent text-sidebar-accent-foreground",
  sidebarBorder: "border-sidebar-border",
}

// ❌ INCORRECT: Don't use hardcoded colors
const incorrectUsage = {
  hardcodedColors: "bg-green-500 text-white", // This won't adapt to theme changes
  hexColors: "bg-[#5ea500] text-[#000000]",   // This breaks theme consistency
}

// 🎨 RECOMMENDED CLASS COMBINATIONS FOR DIETAMIGO

export const dietamigoThemeClasses = {
  // Page layouts
  mainLayout: "min-h-screen bg-background text-foreground",
  pageContainer: "container mx-auto px-4 py-6",
  
  // Cards and panels
  card: "bg-card text-card-foreground border border-border rounded-lg shadow-sm",
  panel: "bg-popover text-popover-foreground border border-border rounded-md",
  
  // Headers and navigation
  header: "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border",
  navItem: "text-foreground hover:text-primary transition-colors",
  activeNavItem: "bg-accent text-accent-foreground",
  
  // Buttons (using your existing design system)
  primaryButton: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
  secondaryButton: "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors",
  ghostButton: "hover:bg-accent hover:text-accent-foreground transition-colors",
  
  // Forms
  input: "bg-background border border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
  label: "text-foreground font-medium",
  helpText: "text-muted-foreground text-sm",
  
  // Sidebar (specific to your app)
  sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
  sidebarHeader: "bg-sidebar-primary text-sidebar-primary-foreground",
  sidebarNavItem: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  sidebarActivItem: "bg-sidebar-accent text-sidebar-accent-foreground",
  
  // Status indicators
  success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  
  // Charts and analytics (for your progress page)
  chart1: "fill-chart-1 stroke-chart-1",
  chart2: "fill-chart-2 stroke-chart-2",
  chart3: "fill-chart-3 stroke-chart-3",
  chart4: "fill-chart-4 stroke-chart-4",
  chart5: "fill-chart-5 stroke-chart-5",
}

export default dietamigoThemeClasses;