
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput } from 'react-native';
import { useTransactions } from '../transactions/TransactionsContext';
import { Transaction } from '../types';

const TransactionsScreen = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleAddOrUpdate = (transaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...editingTransaction, ...transaction });
      setEditingTransaction(null);
    } else {
      addTransaction(transaction);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <TransactionForm onSubmit={handleAddOrUpdate} transaction={editingTransaction} />
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View>
              <Text>{item.description}</Text>
              <Text>{item.category}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={{ color: item.type === 'income' ? 'green' : 'red' }}>
                {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
              </Text>
              <Text>{item.date}</Text>
              <View style={{flexDirection: 'row'}}>
                <Button title="Edit" onPress={() => setEditingTransaction(item)} />
                <Button title="Delete" onPress={() => deleteTransaction(item.id)} />
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const TransactionForm = ({ onSubmit, transaction }: { onSubmit: (data: Omit<Transaction, 'id'>) => void, transaction: Transaction | null }) => {
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    onSubmit({ description, amount: parseFloat(amount), category, type, date });
    setDescription('');
    setAmount('');
    setCategory('');
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <View style={styles.formContainer}>
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput placeholder="Date" value={date} onChangeText={setDate} style={styles.input} />
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <Button title="Expense" onPress={() => setType('expense')} color={type === 'expense' ? 'red' : 'gray'} />
        <Button title="Income" onPress={() => setType('income')} color={type === 'income' ? 'green' : 'gray'} />
      </View>
      <Button title={transaction ? "Update" : "Add"} onPress={handleSubmit} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  formContainer: {
    marginBottom: 16
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default TransactionsScreen;
