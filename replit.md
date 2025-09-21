# Native Finance App

## Overview
This is a React Native finance tracking app built with Expo, featuring user authentication, transaction management, spending analysis, and financial goals. The app uses Firebase for backend services and runs as a web application in the Replit environment.

## Recent Changes
- **Sept 21, 2025**: Imported from GitHub and configured for Replit environment
- Moved Firebase configuration to use environment variables for security
- Set up Expo web development workflow on port 5000
- Configured deployment for production autoscale hosting
- Fixed compatibility issues and got the app running successfully

## User Preferences
- Keep Firebase API keys secure using environment variables
- Maintain existing code structure and conventions
- Use Expo for React Native web development

## Project Architecture
### Tech Stack
- **Frontend**: React Native with Expo Router
- **Backend**: Firebase (Auth, Firestore)
- **Styling**: React Native StyleSheet
- **Navigation**: Expo Router with file-based routing
- **Charts**: React Native Gifted Charts
- **Development**: TypeScript, Metro bundler

### Key Features
- User authentication (login/register)
- Transaction management (add, edit, list)
- Financial dashboard with charts
- Spending analysis
- Financial goals tracking
- Responsive web interface

### Project Structure
- `/app` - Main application screens and routing
- `/src` - Core components and business logic
- `/components` - Reusable UI components
- `/assets` - Images and fonts
- `/android` - Android native configuration

### Dependencies
- Expo SDK 54.0.0
- React Native 0.79.5 (with some version warnings that don't affect functionality)
- Firebase 12.2.1
- React Navigation 7.x
- Various Expo modules for device features

### Development Setup
- **Port**: 5000 (web development server)
- **Host**: LAN mode for Replit compatibility
- **Build Tool**: Metro bundler
- **Type Checking**: TypeScript with strict mode

### Firebase Configuration
Firebase config uses environment variables with fallbacks:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Deployment
- **Target**: Autoscale (stateless web app)
- **Build**: Expo export to static web files
- **Runtime**: Serve static files on port 5000
- **Environment**: Production-ready with Firebase backend

### Known Issues
- Some dependency version warnings (non-blocking)
- TypeScript LSP warnings (compilation still works)
- Deprecated shadow style props (cosmetic warnings only)

The app is fully functional and ready for development and deployment.