# Money App - State Animations

A comprehensive reference implementation of animated state screens for a money/financial app. This project demonstrates all common app states with smooth animations using React, TypeScript, and Framer Motion.

**⚠️ Mobile-Only Application**: This app is optimized exclusively for mobile devices. Animations and interactions are designed for mobile viewport sizes (max-width: 768px). On desktop browsers, a warning message will be displayed.

## States Included

1. **Loading State** - Shows when data is being fetched
2. **Success State** - Displays successful operations with checkmark animation
3. **Error State** - Handles error scenarios with retry options
4. **Empty State** - Shows when no data is available
5. **Partial State** - Displays progress for ongoing operations
6. **In Progress State** - Shows active transactions being processed

## Features

- ✨ Smooth, high-performance animations optimized for mobile
- 🎨 Modern, professional UI design
- 📱 **Mobile-only** - Optimized exclusively for mobile devices
- 🔄 State management with React Context API
- 💼 Money app specific examples and data
- 🎯 TypeScript for type safety
- 🚀 Fast development with Vite
- ⚡ GPU-accelerated animations for 60fps performance
- 🔋 Low resource usage with CSS animations

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Viewing on Desktop

When viewing on a desktop browser:
- The app will display a warning message
- To test mobile view, use your browser's developer tools:
  - Chrome/Edge: Press `F12` → Click device toolbar icon (or `Ctrl+Shift+M`)
  - Firefox: Press `F12` → Click responsive design mode (or `Ctrl+Shift+M`)
  - Safari: Enable Develop menu → Enter Responsive Design Mode
- Set viewport to mobile size (iPhone, iPad, or custom width ≤ 768px)

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── states/
│   │   ├── LoadingState.tsx
│   │   ├── SuccessState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PartialState.tsx
│   │   ├── InProgressState.tsx
│   │   └── StateStyles.css
│   ├── StateRenderer.tsx
│   └── StateSelector.tsx
├── context/
│   └── StateContext.tsx
├── types/
│   └── state.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Usage

### Basic State Management

```typescript
import { useAppState } from './context/StateContext';
import { AppState } from './types/state';

const { setState, setMessage, setData } = useAppState();

// Set loading state
setState(AppState.LOADING);
setMessage('Loading your account...');

// Set success state with data
setState(AppState.SUCCESS);
setMessage('Transaction completed!');
setData({ amount: '$1,250.00', transactionId: 'TXN-12345' });
```

### Using Individual State Components

```typescript
import { LoadingState } from './components/states/LoadingState';

<LoadingState message="Processing payment..." />
```

## Customization

All states can be customized by:
- Modifying the CSS in `StateStyles.css`
- Adjusting animation parameters in component files
- Changing colors, fonts, and spacing
- Adding additional props to state components

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Framer Motion** - Animation library
- **Vite** - Build tool
- **CSS3** - Styling

## License

This is a reference implementation for engineering teams. Feel free to use and modify as needed.
