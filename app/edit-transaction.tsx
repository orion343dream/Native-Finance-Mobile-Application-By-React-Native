
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTransactions } from '../src/transactions/TransactionsContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const EditTransactionScreen = () => {
  const { id } = useLocalSearchParams();
  const { transactions, updateTransaction } = useTransactions();
  const router = useRouter();

  const transactionToEdit = transactions.find(t => t.id === id);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setType(transactionToEdit.type);
      setDate(transactionToEdit.date);
    }
  }, [transactionToEdit]);

  const handleUpdateTransaction = async () => {
    if (!description || !amount || !date) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid, positive number for the amount.');
      return;
    }

    try {
      await updateTransaction(id as string, { description, amount: numericAmount, category, type, date });
      Alert.alert('Success', 'Transaction updated successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', `Failed to update transaction: ${error.message}`);
    }
  };

  if (!transactionToEdit) {
    return <Text>Transaction not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Transaction</Text>

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Food" value="Food" />
        <Picker.Item label="Transport" value="Transport" />
        <Picker.Item label="Shopping" value="Shopping" />
        <Picker.Item label="Bills" value="Bills" />
        <Picker.Item label="Entertainment" value="Entertainment" />
        <Picker.Item label="Salary" value="Salary" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      <Text style={styles.label}>Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => setType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Expense" value="expense" />
        <Picker.Item label="Income" value="income" />
      </Picker>

      <TouchableOpacity style={styles.addButton} onPress={handleUpdateTransaction}>
        <Text style={styles.addButtonText}>Update Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  label: {
      fontSize: 16,
      marginBottom: 8,
      color: '#475569',
  },
  picker: {
      height: 50,
      borderColor: '#cbd5e1',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 16,
      backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditTransactionScreen;
