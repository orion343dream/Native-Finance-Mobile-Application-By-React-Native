
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { useMemo } from 'react';

export default function RecentTransactions() {
  const { transactions } = useTransactions();

  const recentTransactions = useMemo(() => {
    // Filter out income if you only want expenses, or adjust as needed
    return transactions.slice(0, 3); // Get top 3 most recent
  }, [transactions]);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Recent Transactions</Text>
      {recentTransactions.length > 0 ? (
        recentTransactions.map(t => (
          <View key={t.id} style={styles.transaction}>
            <View>
              <Text style={styles.description}>{t.description}</Text>
              <Text style={styles.categoryDate}>{t.category} - {t.date}</Text>
            </View>
            <Text style={t.type === 'income' ? styles.income : styles.expense}>
              {t.type === 'income' ? '+' : '-'} ${t.amount.toFixed(2)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No recent transactions.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
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
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  categoryDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  income: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  expense: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 10,
  }
});
