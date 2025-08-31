
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// A more detailed transaction item
const TransactionItem = ({ transaction, onDelete, onEdit }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionDesc}>{transaction.description}</Text>
      <Text style={styles.transactionSub}>{transaction.category} | {transaction.date}</Text>
    </View>
    <Text style={[styles.transactionAmount, transaction.type === 'income' ? styles.income : styles.expense]}>
      {transaction.type === 'income' ? '+' : '-'}$ {transaction.amount.toFixed(2)}
    </Text>
    <View style={styles.transactionActions}>
        <TouchableOpacity onPress={() => onEdit(transaction)} style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={20} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
    </View>
  </View>
);

export default function TransactionsScreen() {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'
  const router = useRouter();

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);
  
  const onEdit = (transaction) => {
    // Navigate to an edit screen, passing the transaction ID
    router.push(`/edit-transaction?id=${transaction.id}`);
  };

  const onDelete = (id) => {
    // Confirmation before deleting
    deleteTransaction(id);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>All Transactions</Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'income' && styles.activeFilter]}
          onPress={() => setFilter('income')}
        >
          <Text style={[styles.filterText, filter === 'income' && styles.activeFilterText]}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'expense' && styles.activeFilter]}
          onPress={() => setFilter('expense')}
        >
          <Text style={[styles.filterText, filter === 'expense' && styles.activeFilterText]}>Expenses</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={({ item }) => <TransactionItem transaction={item} onDelete={onDelete} onEdit={onEdit} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  filterContainer: { flexDirection: 'row', marginBottom: 16, justifyContent: 'center' },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  activeFilter: { backgroundColor: '#059669' },
  filterText: { color: '#475569', fontWeight: '600' },
  activeFilterText: { color: 'white' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8 },
  transactionDetails: { flex: 1 },
  transactionDesc: { fontSize: 16, fontWeight: '500', color: '#334155' },
  transactionSub: { fontSize: 12, color: '#64748b' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 8 },
  income: { color: '#10b981' },
  expense: { color: '#ef4444' },
  transactionActions: { flexDirection: 'row' },
  actionButton: { padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#64748b' },
});
