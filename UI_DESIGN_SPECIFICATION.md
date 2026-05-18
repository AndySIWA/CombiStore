# 🎨 CombiStore UI Design Specification v2.0

**Date:** May 18, 2026  
**Version:** 2.0  
**Status:** Ready for Implementation  
**Target Framework:** React Native + Expo Router + TypeScript

---

## 📑 Table of Contents

1. [Design System Foundation](#design-system-foundation)
2. [Color Palette & Theming](#color-palette--theming)
3. [Typography](#typography)
4. [Core Components](#core-components)
5. [Screen Layouts](#screen-layouts)
6. [Animations & Interactions](#animations--interactions)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Component Examples](#component-examples)

---

## 🎯 Design System Foundation

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Modern & Premium** | Clean, sophisticated design with subtle depth |
| **Accessible** | High contrast ratios, readable typography, clear CTAs |
| **Performant** | Smooth animations at 60fps, optimized renders |
| **Dark-First** | Default dark theme with optional light mode |
| **Gesture-Native** | Touch-friendly interactions with haptic feedback |
| **Consistent** | Unified spacing, typography, and component patterns |

### Design Tokens Overview

```typescript
// Design tokens library
export const DESIGN_TOKENS = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: 'easeInOut',
  },
  elevation: {
    sm: 4,
    md: 8,
    lg: 16,
  },
};
```

---

## 🌈 Color Palette & Theming

### Dark Theme (Default)

```typescript
// src/constants/theme.ts
export const COLORS_DARK = {
  // Primary Palette
  primary: '#6366F1',      // Indigo - Main brand color
  primaryDark: '#4F46E5',  // Darker indigo for hover/active
  primaryLight: '#818CF8', // Lighter indigo for disabled

  // Accent Colors
  accent: '#EC4899',       // Rose - CTA and highlights
  accentDim: '#F472B6',    // Lighter rose

  // Surface Palette (Depth)
  surface: '#1A1A2E',      // Main background (darkest)
  surfaceElevated: '#252D42', // Cards, modals (mid-dark)
  surfaceLight: '#16213E', // Interactive elements
  
  // Semantic Colors
  success: '#10B981',      // Green for success states
  warning: '#F59E0B',      // Amber for warnings
  danger: '#EF4444',       // Red for errors
  
  // Text Hierarchy
  text: '#FFFFFF',         // Primary text
  textSecondary: '#A1A1AA', // Secondary text
  textTertiary: '#71717A',  // Tertiary text (disabled, hints)
  
  // Borders & Dividers
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',
  
  // Utilities
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Gradient Colors
export const GRADIENTS = {
  primary: ['#6366F1', '#EC4899'],
  warm: ['#F59E0B', '#EC4899'],
  cool: ['#6366F1', '#8B5CF6'],
  vibrant: ['#EC4899', '#F59E0B', '#10B981'],
};
```

### Light Theme

```typescript
export const COLORS_LIGHT = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  accent: '#EC4899',
  accentDim: '#F472B6',
  
  surface: '#FFFFFF',
  surfaceElevated: '#F8F9FF',
  surfaceLight: '#F3F4F6',
  
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  
  text: '#09090B',
  textSecondary: '#52525B',
  textTertiary: '#A1A1AA',
  
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.04)',
};
```

### Category Colors

```typescript
// Category-specific accent colors
export const CATEGORY_COLORS = {
  games: '#EF4444',      // Red
  tools: '#3B82F6',      // Blue
  utilities: '#6366F1',  // Indigo
  media: '#EC4899',      // Rose
  productivity: '#10B981', // Green
  social: '#F59E0B',     // Amber
};
```

---

## ✍️ Typography

### Font Family
- **Primary:** Inter (400, 500, 600, 700)
- **Already imported:** `@expo-google-fonts/inter`

### Typography Scale

```typescript
export const TYPOGRAPHY = {
  // Display / Hero text
  display: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
    letterSpacing: -1,
  },
  
  // Heading 1 - Page titles
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  
  // Heading 2 - Section titles
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  
  // Heading 3 - Sub titles
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
  },
  
  // Body Large - Important content
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  
  // Body Regular - Standard text
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Body Small - Secondary text
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  
  // Caption - Hints, timestamps
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  
  // Label - Buttons, badges
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};
```

---

## 🧩 Core Components

### 1. GradientButton

**Purpose:** Primary Call-to-Action button with gradient background

**Props:**
```typescript
interface GradientButtonProps {
  label: string;
  onPress: () => void;
  gradient?: [string, string];
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}
```

**Styles:**
- Size Small: 8px vertical, 16px horizontal padding
- Size Medium: 12px vertical, 24px horizontal padding (default)
- Size Large: 16px vertical, 32px horizontal padding
- Border Radius: 12px
- Shadow: Elevation 5 (shadow-md)

**Interactions:**
- Tap: Ripple effect + light haptic
- Disabled: Opacity 0.6
- Loading: Spinner animation, button disabled

**File:** `src/components/GradientButton.tsx`

---

### 2. FloatingActionButton (FAB)

**Purpose:** Quick access to primary action (add app)

**Props:**
```typescript
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  color?: 'primary' | 'accent';
  size?: 'medium' | 'large';
  animated?: boolean;
}
```

**Styles:**
- Size Medium: 56x56px
- Size Large: 64x64px
- Border Radius: full
- Gradient background
- Shadow: Elevation lg
- Position: Bottom-right corner + 24px margin

**Animations:**
- Scale on mount: 0 → 1 (spring animation)
- Bounce on hover
- Haptic feedback on press

**File:** `src/components/FloatingActionButton.tsx`

---

### 3. AppCard (Redesigned)

**Purpose:** Display mini-app in different layouts

**Props:**
```typescript
interface AppCardProps {
  app: MiniApp;
  category?: Category;
  variant?: 'grid' | 'list' | 'featured';
  onPress: () => void;
  onLongPress?: () => void;
  isInstalled?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  animationIndex?: number;
}
```

**Variant: Grid (Default)**
- Dimensions: 48.2% width, 220px height
- Icon: 64px (centered top)
- Layout: Icon above, text below
- Border: 1px with border color
- Shadow: subtle (elevation-sm)
- Border Radius: 16px
- Spacing: 16px gap between cards

**Variant: List**
- Dimensions: 100% width, 120px height
- Layout: Icon left, content right
- Icon: 88px square
- Border Radius: 12px
- Swipe actions: Edit, Delete

**Variant: Featured**
- Dimensions: 100% width, 280px height
- Gradient overlay
- Large icon (96px)
- Hero text (h2 style)
- CTA button
- Parallax scroll effect

**Shared Features:**
- Glass morphism highlight (top 45%)
- Installed badge (top-right corner)
- Category color bubble icon
- Smooth opacity/scale transitions
- Haptic feedback on tap

**File:** `src/components/AppCard.tsx`

---

### 4. SearchBar

**Purpose:** App discovery and filtering

**Props:**
```typescript
interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  animated?: boolean;
}
```

**Styles:**
- Height: 48px
- Border Radius: 12px
- Background: surfaceLight
- Border: 1px border color
- Horizontal Padding: 16px
- Icon: search icon (left), clear button (right)
- Focus state: primary border, slight elevation

**Animations:**
- Focus: Scale 1.02, shadow increase
- Clear button: Fade in/out

**File:** `src/components/SearchBar.tsx`

---

### 5. CategoryPill

**Purpose:** Filter apps by category

**Props:**
```typescript
interface CategoryPillProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress: () => void;
  color?: string;
}
```

**Styles:**
- Height: 40px
- Padding: 8px horizontal, 4px vertical
- Border Radius: 20px
- Unselected: surfaceLight background, textSecondary text
- Selected: Category color background, white text, border shadow
- Font: label typography

**Interactions:**
- Tap: Scale 0.95 → 1
- Haptic: Selection feedback

**File:** `src/components/CategoryPill.tsx`

---

### 6. EmptyState

**Purpose:** Display when no apps found

**Props:**
```typescript
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Styles:**
- Centered vertical layout
- Icon: 96px, textSecondary color
- Title: h2 typography
- Description: body typography, textTertiary
- Button: GradientButton below
- Vertical spacing: 16px between elements

**File:** `src/components/EmptyState.tsx`

---

### 7. BottomSheet

**Purpose:** Modal actions and options

**Props:**
```typescript
interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
}
```

**Styles:**
- Background: surfaceElevated
- Border Radius: 24px (top only)
- Padding: 24px
- Header height: 56px
- Animation: Slide from bottom (300ms)

**File:** `src/components/BottomSheet.tsx`

---

### 8. Badge

**Purpose:** Display status, version, tags

**Props:**
```typescript
interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium';
  icon?: React.ReactNode;
}
```

**Styles:**
- Small: 12px font, 4px padding vertical
- Medium: 14px font, 6px padding vertical
- Border Radius: 12px
- Colors: Variant-based

**File:** `src/components/Badge.tsx`

---

### 9. Input Field

**Purpose:** Text input for forms

**Props:**
```typescript
interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
  label?: string;
}
```

**Styles:**
- Height: 48px (or dynamic with multiline)
- Border Radius: 12px
- Padding: 12px
- Border: 1px border color
- Focus: primary border, elevation increase
- Error state: danger border + error text

**File:** `src/components/InputField.tsx`

---

### 10. Loading Skeleton

**Purpose:** Placeholder while content loads

**Props:**
```typescript
interface SkeletonProps {
  variant?: 'card' | 'text' | 'circle';
  width?: number | string;
  height?: number | string;
}
```

**Styles:**
- Background: surfaceLight
- Shimmer animation: 1.5s loop
- Border Radius: match content

**File:** `src/components/Skeleton.tsx`

---

## 📱 Screen Layouts

### Screen 1: Home / Store

**Layout Structure:**

```
┌─────────────────────────┐
│ ☀️  CombiStore    🔍    │  ← Header (sticky)
├─────────────────────────┤
│ ⭐ Featured (Featured)  │
│ ┌─────────────────────┐ │
│ │  [Excalidraw Hero]  │ │
│ │  Card (280px)       │ │
│ └─────────────────────┘ │
│                         │
│ 🎮 Jeux               │
│ ┌──────┐  ┌──────┐    │
│ │Card  │  │Card  │    │
│ ├──────┤  ├──────┤    │
│ │Card  │  │Card  │    │
│ └──────┘  └──────┘    │
│                         │
│ 🔧 Outils             │
│ ← [Card] [Card] [Card] │
│                         │
│ ⚡ Utilitaires        │
│ ┌──────┐  ┌──────┐    │
│ │Card  │  │Card  │    │
│ └──────┘  └──────┘    │
│                         │
└─────────────────────────┘
       [FAB +]
```

**Components:**
- Header: Sticky, title + search button
- Featured Section: Horizontal carousel or full-width card
- Category Sections: Title with icon + grid/carousel
- Empty State: If no apps
- FAB: Add app button

**Animations:**
- Header blur on scroll
- Parallax scroll on featured section
- Staggered fade-in for cards (50ms delay)
- Pull-to-refresh spinner

**File:** `app/(tabs)/index.tsx`

---

### Screen 2: App Details

**Layout Structure:**

```
┌──────────────────────┐
│ ← [App Name]   ⋯   │  ← Header (translucent)
├──────────────────────┤
│                      │
│   ┌─────────────┐   │
│   │ Gradient    │   │
│   │ Hero Card   │   │
│   │ [Icon 96px] │   │
│   └─────────────┘   │
│                      │
├──────────────────────┤
│ App Name             │
│ ★★★★☆ (4.5) [Share]│
│                      │
│ Long Description:    │
│ Lorem ipsum dolor    │
│ sit amet...          │
│                      │
│ 🏷️ Tags:            │
│ [puzzle] [game]      │
│                      │
│ ℹ️ Info:            │
│ Version 1.0.0        │
│ Updated: 17 May 2026 │
│ Developer: Sanity    │
│                      │
│ ┌──────────────────┐ │
│ │📖 More Info      │ │
│ │🌐 Open URL/View  │ │
│ │🚀 Launch App     │ │
│ └──────────────────┘ │
│                      │
└──────────────────────┘
```

**Components:**
- Header: Back button + options menu
- Hero section: Gradient background + large icon
- Info section: Title, rating, share button
- Description: Scrollable text
- Tags: Horizontal pill list
- Metadata: Version, updated date, developer
- CTA Buttons: Full-width buttons stack

**Interactions:**
- Swipe back gesture
- Share button → system share
- Open in browser
- Launch/Install toggle

**File:** `app/viewer/[id].tsx`

---

### Screen 3: Manage / Create App

**Layout Structure:**

```
┌──────────────────────┐
│ ← Create App    ✓   │
├──────────────────────┤
│                      │
│  ┌─────────────────┐ │
│  │ 📸 Icon Picker  │ │
│  │ [Current Icon]  │ │
│  └─────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ App Name *       │ │
│ │ [Text Input]     │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Description *    │ │
│ │ [Multiline]      │ │
│ │ 0 / 500 chars    │ │
│ └──────────────────┘ │
│                      │
│ Category *           │
│ [Dropdown] 🎮 Jeux  │
│                      │
│ Source Type *        │
│ [URL] [HTML]         │
│                      │
│ ┌──────────────────┐ │
│ │ Source URL/HTML  │ │
│ │ [Text Input]     │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Tags (Optional)  │ │
│ │ [puzzle, game]   │ │
│ └──────────────────┘ │
│                      │
│ [Annuler] [Enreg.]  │
│                      │
└──────────────────────┘
```

**Components:**
- Header: Title + close + save button
- Icon picker: Circular icon selector
- Form fields: Name, description, category
- Tabs: URL vs HTML
- Source input: URL or HTML textarea
- Tags input: Chipset input
- Buttons: Cancel + Save
- Validation: Live feedback

**Features:**
- Auto-save draft to AsyncStorage
- Image preview if URL image
- Character count for description
- Category color indicator
- Emoji picker for custom icons

**File:** `app/manage-app.tsx`

---

### Screen 4: Settings (Enhanced)

**Layout Structure:**

```
┌──────────────────────┐
│ Paramètres           │
├──────────────────────┤
│                      │
│ Apparence            │
│ ┌──────────────────┐ │
│ │ 🌙 Mode Sombre   │ │
│ │ [Toggle] ✓       │ │
│ └──────────────────┘ │
│                      │
│ Stockage             │
│ ┌──────────────────┐ │
│ │ 📦 Apps (45 MB)  │ │
│ │ [Progress Bar]   │ │
│ │ 📋 Cache (2 MB)  │ │
│ │ [Clear Button]   │ │
│ └──────────────────┘ │
│                      │
│ À propos             │
│ ┌──────────────────┐ │
│ │ Version: 1.0.0   │ │
│ │ [Check Update]   │ │
│ └──────────────────┘ │
│                      │
└──────────────────────┘
```

**File:** `app/(tabs)/settings.tsx`

---

## 🎬 Animations & Interactions

### Animation Library
- **Primary:** `react-native-reanimated` v4+
- **Gestures:** `react-native-gesture-handler`
- **Linear Gradient:** `expo-linear-gradient` (already installed)

### Key Animations

| Trigger | Animation | Duration | Effect |
|---------|-----------|----------|--------|
| **Screen Enter** | Fade + Slide | 300ms | Cards stagger in, staggered delay |
| **Button Tap** | Scale + Ripple | 150ms | Press feedback with haptic |
| **Card Swipe** | Horizontal slide | 250ms | Delete/archive action |
| **Scroll** | Parallax | Continuous | Header blur + icon scale |
| **Pull Refresh** | Spinner rotate | 300ms+ | Loading indicator animation |
| **FAB Mount** | Scale Spring | 400ms | Bounce effect on entry |
| **Long Press** | Highlight scale | 200ms | Show action menu |
| **Category Filter** | Highlight pulse | 200ms | Selection feedback |

### Haptic Feedback

```typescript
// When to use haptic
- Button press: Light impact
- Selection (category pill): Selection feedback
- Swipe action: Medium impact
- Error validation: Medium impact (warning)
- Long press: Light impact
```

### Gesture Support

```typescript
// Gestures to implement
- Swipe right: Go back
- Swipe left (card): Delete/archive
- Long press (card): Show context menu
- Pull down (list): Refresh
- Pinch (image): Zoom
- Tap outside (modal): Dismiss
```

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Extend color palette in theme.ts
- [ ] Update typography scale
- [ ] Create GradientButton component
- [ ] Create SearchBar component
- [ ] Create CategoryPill component
- [ ] Setup Reanimated & gesture handler

**Files to create:**
```
src/constants/theme.ts (enhance)
src/components/GradientButton.tsx
src/components/SearchBar.tsx
src/components/CategoryPill.tsx
src/hooks/useAnimations.ts
```

### Phase 2: Core Components (Week 3-4)

- [ ] Redesign AppCard (3 variants)
- [ ] Create FloatingActionButton
- [ ] Create EmptyState component
- [ ] Create Badge component
- [ ] Implement color animations

**Files to create:**
```
src/components/AppCard.tsx (redesign)
src/components/FloatingActionButton.tsx
src/components/EmptyState.tsx
src/components/Badge.tsx
```

### Phase 3: Screen Implementation (Week 5-6)

- [ ] Redesign Home screen
- [ ] Redesign Details screen
- [ ] Redesign Manage screen
- [ ] Add animations to screens
- [ ] Implement pull-to-refresh

**Files to update:**
```
app/(tabs)/index.tsx
app/viewer/[id].tsx
app/manage-app.tsx
```

### Phase 4: Polish & Optimization (Week 7+)

- [ ] Add loading skeletons
- [ ] Implement gesture interactions
- [ ] Optimize performance (FlatList, memoization)
- [ ] Add error boundaries
- [ ] Test on device
- [ ] Documentation

**Files to create:**
```
src/components/Skeleton.tsx
src/components/BottomSheet.tsx
src/components/InputField.tsx
```

---

## 💻 Component Examples

### Example 1: GradientButton Implementation

```typescript
// src/components/GradientButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS_DARK, GRADIENTS, TYPOGRAPHY } from '../constants/theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  gradient?: [string, string];
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  gradient = GRADIENTS.primary,
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 24 },
    large: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[fullWidth && { width: '100%' }]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          sizeStyles[size],
          (disabled || loading) && styles.buttonDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.text, styles[`text_${size}`]]}>
              {label}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  text_small: {
    fontSize: 12,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  icon: {
    fontSize: 16,
  },
});
```

### Example 2: AppCard Variant Implementation

```typescript
// src/components/AppCard.tsx (Grid variant)
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS_DARK, TYPOGRAPHY } from '../constants/theme';
import { MiniApp, Category } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AppCardProps {
  app: MiniApp;
  category?: Category;
  variant?: 'grid' | 'list' | 'featured';
  onPress: () => void;
  onLongPress?: () => void;
  isInstalled?: boolean;
  animationIndex?: number;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  category,
  variant = 'grid',
  onPress,
  onLongPress,
  isInstalled,
  animationIndex = 0,
}) => {
  const { theme } = useTheme();

  const iconValue = typeof app.icon === 'string' ? app.icon : '';
  const displayIcon = iconValue || '❔';
  const isImageIcon = iconValue.startsWith('http');

  const catColor = category?.color || theme.primary;

  const styles = useMemo(() => createStyles(variant, catColor, theme), [variant, catColor, theme]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.wrapper}
      activeOpacity={0.7}
    >
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.glassHighlight} />

        {/* Installed Badge */}
        {isInstalled && (
          <View style={[styles.badge, { backgroundColor: catColor }]}>
            <Text style={styles.badgeText}>✓</Text>
          </View>
        )}

        {/* Icon Bubble */}
        <View
          style={[
            styles.iconBubble,
            {
              backgroundColor: catColor + '15',
              borderColor: catColor + '30',
            },
          ]}
        >
          {isImageIcon ? (
            <Image
              source={{ uri: iconValue }}
              style={styles.iconImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.iconText}>{displayIcon}</Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.appName, { color: theme.text }]}
            numberOfLines={1}
          >
            {app.name}
          </Text>
          <Text
            style={[styles.appDesc, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {app.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (variant: string, catColor: string, theme: any) => {
  const baseCard = {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  };

  const variantStyles = {
    grid: StyleSheet.create({
      wrapper: { width: '48.2%', marginBottom: 16 },
      card: { ...baseCard, minHeight: 220 },
      // ... grid specific styles
    }),
    list: StyleSheet.create({
      wrapper: { width: '100%', marginBottom: 12 },
      card: { ...baseCard, minHeight: 120, flexDirection: 'row' },
      // ... list specific styles
    }),
    featured: StyleSheet.create({
      wrapper: { width: '100%', marginBottom: 24 },
      card: { ...baseCard, minHeight: 280 },
      // ... featured specific styles
    }),
  };

  return {
    ...variantStyles[variant as keyof typeof variantStyles],
    glassHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '45%',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderBottomLeftRadius: 100,
      borderBottomRightRadius: 100,
    },
    badge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    badgeText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    iconBubble: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 1,
    },
    iconText: {
      fontSize: 32,
    },
    iconImage: {
      width: '70%',
      height: '70%',
    },
    content: {
      flex: 1,
    },
    appName: {
      fontWeight: '600',
      fontSize: 14,
      marginBottom: 4,
    },
    appDesc: {
      fontWeight: '400',
      fontSize: 12,
      lineHeight: 16,
    },
  };
};
```

---

## 🎨 Design Assets Structure

```
assets/
├── icons/
│   ├── store.svg
│   ├── apps.svg
│   ├── settings.svg
│   ├── plus.svg
│   ├── search.svg
│   ├── share.svg
│   ├── back.svg
│   └── menu.svg
├── illustrations/
│   ├── empty-store.svg
│   ├── loading.svg
│   └── error-state.svg
├── gradients/
│   ├── gradient-primary.png
│   ├── gradient-warm.png
│   └── pattern-bg.png
└── icons-apps/ (category icons)
    ├── games.svg
    ├── tools.svg
    └── utilities.svg
```

---

## ✅ Quality Checklist

- [ ] **Performance:** All animations run at 60fps
- [ ] **Accessibility:** Contrast ratios > 4.5:1, touch targets > 44x44px
- [ ] **Responsive:** Works on phones (320px-430px) and tablets
- [ ] **Dark/Light:** Both modes fully implemented
- [ ] **Animations:** Smooth transitions between screens
- [ ] **Gestures:** Native feeling interactions
- [ ] **Loading States:** Skeleton placeholders shown
- [ ] **Error Handling:** Graceful error screens
- [ ] **Microcopy:** Clear, engaging text throughout
- [ ] **Icons:** Consistent 24x24px or 32x32px sizes

---

## 📚 Resources

### Documentation
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- [React Native Styling](https://reactnative.dev/docs/style)

### Design Inspiration
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Dribbble - App Design](https://dribbble.com/search/app-store)

### Tools
- Figma for design mockups
- iOS Simulator for testing
- Android Emulator for testing

---

## 🚀 Getting Started with Implementation

**Step 1: Setup Theme System**
```bash
# Update src/constants/theme.ts with new color palette
# Test in existing screens
```

**Step 2: Create Foundation Components**
```bash
# Create GradientButton, SearchBar, CategoryPill
# Test in Storybook or demo screen
```

**Step 3: Redesign Core Components**
```bash
# Update AppCard with 3 variants
# Add animations and interactions
```

**Step 4: Update Screens**
```bash
# Home, Details, Manage screens
# Add animations and gestures
```

---

**Document Version:** 2.0  
**Last Updated:** May 18, 2026  
**Status:** Ready for Development  
**Audience:** Developers (Cline AI), Designers
