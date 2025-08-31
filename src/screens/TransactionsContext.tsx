
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Transaction } from '../types';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
    { id: '1', description: 'Groceries', amount: 75.50, category: 'Food', type: 'expense', date: '2025-08-28' },
    { id: '2', description: 'August Salary', amount: 3000.00, category: 'Salary', type: 'income', date: '2025-08-25' },
    { id: '3', description: 'Gas Bill', amount: 50.00, category: 'Bills', type: 'expense', date: '2025-08-22' },
    { id: '4', description: 'Train Ticket', amount: 15.00, category: 'Transport', type: 'expense', date: '2025-08-20' },
    { id: '5', description: 'Movie Night', amount: 45.00, category: 'Entertainment', type: 'expense', date: '2025-08-18' },
    { id: '6', description: 'Freelance Work', amount: 500.00, category: 'Salary', type: 'income', date: '2025-08-15' },
];

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: Date.now().toString() }]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
