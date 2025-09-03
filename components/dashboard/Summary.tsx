
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { useMemo } from 'react';

export default function Summary() {
  const { transactions } = useTransactions();

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Summary</Text>
      <View style={styles.row}>
        <Text>Income</Text>
        <Text style={styles.incomeText}>${totalIncome.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text>Expenses</Text>
        <Text style={styles.expenseText}>${totalExpenses.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text>Balance</Text>
        <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  incomeText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  expenseText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  balanceText: {
    fontWeight: 'bold',
    color: '#059669',
  },
});
