# Native Finance App

## Overview
A React Native finance tracking application built with Expo and Firebase. The app allows users to manage their financial transactions, track income and expenses, visualize spending patterns, and set financial goals.

## Current State
- **Status**: Successfully imported and configured for Replit environment
- **Last Updated**: September 21, 2025
- **Version**: 1.0.0
- **Environment**: Development ready, deployment configured

## Recent Changes
- **September 21, 2025**: 
  - Fixed TypeScript configuration issues with Firebase imports
  - Replaced SymbolView with Ionicons for better web compatibility
  - Fixed undefined variable errors in DashboardScreen component
  - Configured Expo workflow to run on port 5000 with proper host settings
  - Set up autoscale deployment configuration

## User Preferences
- No specific user preferences documented yet
- Standard React Native/Expo development workflow
- Uses Firebase for authentication and data storage

## Project Architecture

### Tech Stack
- **Frontend**: React Native with Expo (web platform enabled)
- **Routing**: Expo Router with file-based routing
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Charts**: React Native Chart Kit & React Native Gifted Charts
- **State Management**: React Context API
- **Styling**: StyleSheet with custom theme system

### Key Components
- **Authentication**: Login/Register screens with Firebase auth
- **Dashboard**: Financial overview with charts and quick actions
- **Transactions**: Add, edit, and view transaction history
- **Analysis**: Spending analysis with pie charts
- **Goals**: Financial goal tracking (financilagoal route)

### File Structure
```
├── app/ (Expo Router pages)
│   ├── (tabs)/ (Tab navigation)
│   │   ├── index.tsx (Dashboard)
│   │   ├── transactions.tsx
│   │   ├── analysis.tsx
│   │   └── financilagoal.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── components/
│   ├── dashboard/ (Chart components)
│   └── ui/ (Reusable UI components)
├── src/
│   ├── auth/ (Authentication context)
│   ├── transactions/ (Transaction context)
│   ├── types/
│   ├── firebase.ts
│   └── theme.ts
```

### Configuration Files
- **Webpack**: Configured for Replit environment with proper host settings
- **Metro**: Configured with CORS headers for development
- **TypeScript**: Configured with Expo base settings
- **App.json**: Expo configuration with proper platform settings

## Development Setup

### Running the App
- Development server runs on port 5000
- Use `npx expo start --web --port 5000` command
- Configured for Replit's proxy environment

### Firebase Configuration
- Uses environment variables for Firebase config (fallbacks to hardcoded values)
- Supports both React Native and web authentication flows
- Firestore for transaction data storage

## Deployment
- **Target**: Autoscale deployment (stateless frontend)
- **Build Command**: `npx expo export -p web --output-dir dist`
- **Run Command**: `npx expo start --web --port 5000 --no-dev`
- Configured for production with proper caching headers

## Known Issues
- None currently identified
- App successfully loads and renders without errors
- All major components functioning properly

## Dependencies
- Core: React Native, Expo Router, Firebase
- Charts: react-native-chart-kit, react-native-gifted-charts
- UI: @expo/vector-icons, expo-linear-gradient
- Navigation: @react-navigation/native, @react-navigation/bottom-tabs