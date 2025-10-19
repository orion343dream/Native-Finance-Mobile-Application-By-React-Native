
# Native Finance – Mobile Application

> Personal finance tracker built with Expo + React Native, Firebase Auth/Firestore/Storage, and a clean service architecture.

## 🎬 Experience the App

<div align="center">

### 📱 Live Demo
> *Coming Soon - Video demonstration of all features*

[![🎥 Watch Demo](https://img.shields.io/badge/🎥_Watch_Demo-Coming_Soon-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=black)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

---

### 📲 Get the App Now

[![📱 Download APK](https://img.shields.io/badge/📱_Download_APK-Available_Now-4285F4?style=for-the-badge&logo=googledrive&logoColor=white&labelColor=black)](https://drive.google.com/drive/folders/1PbfEcWlcJ5sDmDE1Mwdln0aK4EjE163m?usp=sharing)

> *Direct download from Google Drive • No registration required*

</div>

## Overview

SpendSight helps you track expenses, incomes, accounts, and financial goals in a simple, modern mobile app. It features secure authentication (Email/Google/Apple), real‑time data with Firebase, charts, and a polished UI with Expo Router and NativeWind.

## Key Features

- Authentication
  - Email/password signup and login (Firebase Auth)
  - Social logins: Google; Apple Sign‑In on iOS
  - Session persistence and robust error handling
- Accounts & Categories
  - Default account/category bootstrapping for new users
  - Create, update, delete, and subscribe with real‑time updates
  - Filter/search categories (income/expense)
- Transactions
  - Create, edit, delete transactions with account balance updates
  - Date range filters, recent transactions feed, and real‑time listeners
- Goals
  - Create and track goals; pay toward and complete goals
  - Progress calculation and due‑soon helpers
- Profile Image
  - Upload to Firebase Storage, update Firestore, and display in UI
  - Camera/Gallery picker, progress, error handling, and caching
- Dashboard & Charts
  - Overview dashboard with charts (react-native-chart-kit)
- Smooth UX
  - Expo + React Native 0.81, Expo Router, Moti animations, NativeWind styling

## Tech Stack

- App: React Native 0.81 + Expo 54 + TypeScript
- Navigation: Expo Router, React Navigation
- UI/Style: NativeWind (Tailwind CSS), Expo components, Moti
- Data: Firebase Auth, Firestore, Storage
- Build: EAS build profiles for development/preview/production (APK)

Dependencies highlights (see `package.json`):

- firebase ^12, expo-image-picker, react-native-reanimated, react-native-svg, chart kit, google-signin, apple-auth (iOS)

## Project Structure

```
app/                         # Expo Router routes
components/                  # Reusable UI components
context/                     # Firebase auth context etc.
services/                    # Account/Category/Transaction/Goal services
types/                       # TypeScript interfaces
utils/                       # Helpers (navigation, session)
firebase.ts                  # Firebase initialization
eas.json                     # EAS build profiles
```

## Firebase Setup

The app expects an existing Firebase project. Core config lives in `firebase.ts`:

- Auth (Email/Password, Google; Apple on iOS)
- Firestore for user data and domain models
- Storage for profile images

Checklist:

1. Enable Authentication providers
   - Email/Password
   - Google: configure OAuth client IDs and SHA‑1 for Android; set `webClientId` where used in auth context
   - Apple (iOS): enable provider and configure in Apple Developer and Firebase
2. Firestore
   - Create database; set security rules according to your needs
3. Storage
   - Ensure bucket exists; apply suitable security rules (see `storage.rules`)

Sensitive keys are currently in `firebase.ts`. For production, move secrets to secure env handling.

## Services Architecture

Domain‑focused services under `services/` provide clean APIs and real‑time subscriptions:

- AccountService: initialize defaults, CRUD, balances, subscribe
- CategoryService: defaults, CRUD, search, filters
- TransactionService: create/update/delete with balance effects, queries, subscribe
- GoalService: CRUD, payTowardGoal, completion, progress helpers

See `services/README.md` for function lists and usage examples.

## Profile Image Feature

- Component: `components/ProfileImagePicker.tsx`
- Service: `services/UserProfileService.ts`
- Storage path: `profile-images/profile_{userId}_{timestamp}.jpg`
- Flow: pick/capture → validate → upload → get URL → update Firestore → update UI
- Drawer integration displays uploaded image or generated initials

Refer to `PROFILE_IMAGE_FEATURE.md` for UX details and troubleshooting.

## Running Locally

Prerequisites:

- Node.js LTS, Yarn or npm
- Expo CLI and Android Studio (for device/emulator)

Install and start:

```powershell
# From repo root
npm install
npm run start

# Android
npm run android

# Web (for limited development purposes)
npm run web
```

If using EAS builds locally, install the Expo Dev Client and follow prompts.

## Building an APK (EAS)

EAS profiles (`eas.json`) are preconfigured for APK outputs:

- development: internal distribution, dev client, APK
- preview: internal distribution, APK
- production: autoIncrement, APK

Common steps:

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build APK:
   - Dev/Preview: `eas build -p android --profile preview`
   - Production: `eas build -p android --profile production`

After build completes, download the APK from the EAS dashboard or artifact URL and optionally upload to Google Drive to share.

## Screens and Navigation

Expo Router organizes screens under `app/`:

- Auth: `(auth)/login.tsx`, `(auth)/signup.tsx`
- Account: `(account)/account.tsx`
- Categories: `(categories)/`
- Dashboard: `(dashboard)/dashboard.tsx`
- Transactions: `(transaction)/` including `add`, `edit/[id]`, `index`, and details `[id]`
- Settings/Help/Goal/History/GetStarted flows

Shared components like `TransactionList`, `TransactionForm`, `NavigationDrawer`, and `AppHeader` provide a consistent UI.

## Security Notes

- Use proper Firestore and Storage security rules for user‑scoped data
- Avoid committing secrets; rotate keys when sharing APKs publicly
- Consider enabling email verification and MFA for production

## Troubleshooting

- Google sign‑in errors on Android
  - Ensure SHA‑1 fingerprint is added to Firebase and Google Cloud console
  - Verify `webClientId` matches your OAuth client
- Storage upload fails
  - Confirm Storage bucket exists and rules permit user uploads
  - Check Android permissions for camera/media
- App doesn’t start on device
  - Clear Metro cache and reinstall app; ensure matching SDK versions

## License

MIT

---

## Acknowledgements

- Built with Expo, Firebase, and the amazing OSS React Native ecosystem.
=======
# 📊 Native Finance

**Your all-in-one personal finance companion** — built with **Expo + React Native**, powered by **Firebase**, and designed with a clean modular service architecture.

---

<div align="center">

[![Expo](https://img.shields.io/badge/Expo-54.0.0-000020?style=for-the-badge\&logo=expo\&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%2FFirestore%2FStorage-FFCA28?style=for-the-badge\&logo=firebase\&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

### 📱 Live Demo

🎬 *Now Available* – Full video walkthrough of features  

[![🎥 Watch Demo](https://img.shields.io/badge/🎥_Watch_Demo-Watch_Now-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=black)](https://youtu.be/JD7lmaqQJBg?si=i7Sm1_AnLDRIeOpr)

### 📲 Download APK

[![📱 Download APK](https://img.shields.io/badge/📱_Download_APK-Available_Now-4285F4?style=for-the-badge\&logo=googledrive\&logoColor=white\&labelColor=black)](https://drive.google.com/file/d/1rpSB-j9hSQeEVeFztXYN-zW_kYJxNRwT/view?pli=1)

</div>

---

## ✨ Overview

**Native Finance** helps you:

* Track **expenses, incomes, accounts, and goals**
* Securely log in with **Firebase Auth** (Email, Google, Apple)
* Visualize your financial health with **real-time charts**
* Enjoy a **smooth, modern mobile experience** with Expo + NativeWind

---

## 🚀 Key Features

* 🔐 **Authentication**

  * Email + Password login
  * Google Sign-In (Android)
  * Apple Sign-In (iOS)
  * Session persistence

* 💳 **Accounts & Categories**

  * Bootstrapped defaults for new users
  * CRUD operations with **real-time listeners**
  * Filter and search functionality

* 💸 **Transactions**

  * Add, edit, delete with **balance updates**
  * Date range filters & recent feed
  * Realtime Firestore sync

* 🎯 **Goals**

  * Create and track savings goals
  * Progress bars, completion badges, due-soon helpers

* 🖼️ **Profile Images**

  * Upload via **Camera/Gallery**
  * Firebase Storage integration
  * Drawer integration with fallback initials

* 📊 **Dashboard**

  * Beautiful charts (`react-native-chart-kit`)
  * Animated UI with **Moti**

---

## 🛠️ Tech Stack

* **Framework**: Expo 54, React Native 0.81, TypeScript
* **Navigation**: Expo Router, React Navigation
* **UI**: NativeWind (Tailwind), Expo Components, Moti, LinearGradient
* **Backend**: Firebase Auth, Firestore, Storage
* **Build**: Expo Application Services (EAS) with profiles for dev/preview/prod

---

## 📂 Project Structure

```bash
app/            # Screens & navigation (Expo Router)
components/     # Reusable UI components
context/        # Auth + global contexts
services/       # Clean service APIs (Account, Transaction, Goal, etc.)
types/          # TypeScript interfaces
utils/          # Helpers & utilities
firebase.ts     # Firebase initialization
eas.json        # Build profiles
```

---

## 🔑 Firebase Setup

The app integrates tightly with **Firebase**:

1. **Enable Authentication**

   * Email/Password
   * Google (OAuth client ID + SHA-1 for Android)
   * Apple Sign-In (iOS, Apple Dev + Firebase setup)

2. **Firestore**

   * Create DB with security rules
   * Example: user-scoped documents (`users/{uid}/...`)

3. **Storage**

   * Bucket for profile images
   * Rules to enforce user-only access

👉 Secrets live in `firebase.ts`. For production, use **secure env handling** (EAS Secrets).

---

## 🧩 Services Architecture

Domain-driven services (`/services/`) abstract Firestore logic:

* `AccountService` → CRUD, balances, realtime subscribe
* `CategoryService` → defaults, search, filters
* `TransactionService` → CRUD, queries, balance sync
* `GoalService` → CRUD, payTowardGoal, progress helpers
* `UserProfileService` → upload images, update Firestore

---

## 📲 Running Locally

### Prerequisites

* Node.js LTS
* Expo CLI
* Android Studio (for emulator)

### Setup

```bash
npm install
npm run start   # start Expo
npm run android # run on emulator/device
```

Optional: Run on web (limited support) → `npm run web`

---

## 📦 Building APK with EAS

Preconfigured in `eas.json`:

* **development** → Dev client + APK
* **preview** → Internal dist + APK
* **production** → Auto-increment versionCode + APK

Build:

```bash
# Install & login
npm install -g eas-cli
eas login

# Configure
eas build:configure

# Run build
eas build -p android --profile production
```

---

## 🖥️ Screens & Navigation

Organized via **Expo Router**:

* `(auth)` → Login / Signup
* `(account)` → Manage accounts
* `(categories)` → Income/Expense categories
* `(transaction)` → Add / Edit / History
* `(dashboard)` → Overview & charts
* `(goal)` → Track financial goals
* `(settings)` → Profile, help

---

## 🔒 Security Best Practices

* Enforce **Firestore & Storage security rules**
* Avoid committing **secrets** to source control
* Enable **email verification** + MFA for users

---

## 🛠️ Troubleshooting

* **Google Sign-In errors** → Check SHA-1 fingerprint + `webClientId`
* **Storage upload fails** → Verify bucket rules + Android permissions
* **App crashes on device** → Clear Metro cache, reinstall app

---

## 📜 License

[MIT License](LICENSE) © 2025 ORION Sandaru

---

## 🙌 Acknowledgements

Built with ❤️ using:

* [Expo](https://expo.dev)
* [Firebase](https://firebase.google.com/)
* [React Native Community](https://reactnative.dev)

---

⚡ **Native Finance** – Track smarter, save better, live free.

---
>>>>>>> b86258cb69c5b05f9e731b8f4acd25f26230e151
