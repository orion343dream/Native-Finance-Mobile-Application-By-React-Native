# 📊 Native Finance (SpendSight)

**Your all-in-one personal finance companion** — built with **Expo + React Native**, powered by **Firebase**, and designed with a clean modular service architecture.

---

<div align="center">

[![Expo](https://img.shields.io/badge/Expo-54.0.0-000020?style=for-the-badge\&logo=expo\&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%2FFirestore%2FStorage-FFCA28?style=for-the-badge\&logo=firebase\&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

### 📱 Live Demo

🎬 *Coming soon* – Full video walkthrough of features
[![🎥 Watch Demo](https://img.shields.io/badge/🎥_Watch_Demo-Watch Now-FF0000?style=for-the-badge\&logo=youtube\&logoColor=white\&labelColor=black)](https://youtu.be/JD7lmaqQJBg?si=i7Sm1_AnLDRIeOpr)

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

⚡ **Native Finance (SpendSight)** – Track smarter, save better, live free.

---
