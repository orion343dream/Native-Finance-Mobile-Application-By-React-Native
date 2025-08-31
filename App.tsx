
import React from 'react';
import { AuthProvider } from './src/auth/AuthContext';
import { TransactionsProvider } from './src/transactions/TransactionsContext';
import { Slot } from 'expo-router';

export default function App() {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <Slot />
      </TransactionsProvider>
    </AuthProvider>
  );
}
