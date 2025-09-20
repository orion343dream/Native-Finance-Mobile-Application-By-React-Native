
import { useAuth } from '@/src/auth/AuthContext';
import { colors, gradients, radius, spacing, typography } from '@/src/theme';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// A more detailed transaction item
interface TransactionItemProps {
  transaction: { id: string; description: string; amount: number; category: string; type: 'income' | 'expense'; date: string };
  onDelete: (id: string) => void;
  onEdit: (t: TransactionItemProps['transaction']) => void;
}
const TransactionItem = ({ transaction, onDelete, onEdit }: TransactionItemProps) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionDesc}>{transaction.description}</Text>
      <Text style={styles.transactionSub}>{transaction.category} | {transaction.date}</Text>
    </View>
    <Text style={[styles.transactionAmount, transaction.type === 'income' ? styles.income : styles.expense]}>
      {transaction.type === 'income' ? '+' : '-'} {transaction.amount.toFixed(2)} LKR
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
  const { transactions, loading, deleteTransaction, addTransaction, updateTransaction } = useTransactions();
  const { user, updateUserCustomCategories } = useAuth();
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  // Inline form state
  const defaultCategories = {
    income: ['Salary', 'Freelance', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
  } as const;
  const [type, setType] = useState<'income' | 'expense' | ''>('');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [dateObj, setDateObj] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const userCustomCategories = useMemo(() => {
  // Normalize stored custom categories to an object with arrays. Stored values may be strings or objects { name, emoji }
  const raw = user?.customCategories || { expense: [], income: [] };
  const normalize = (arr: any[]) => arr.map(item => (typeof item === 'string' ? item : item?.name ?? ''));
  return { expense: normalize(raw.expense || []), income: normalize(raw.income || []) };
  }, [user]);

  const combinedCategories = useMemo(() => {
    if (!type) return [] as string[];
  const base = type === 'income' ? defaultCategories.income : defaultCategories.expense;
  const customs = (userCustomCategories[type] || []) as string[];
  // ensure unique and string labels only
  const merged = Array.from(new Set([...base, ...customs.filter(Boolean)]));
  return [...merged, '+ Add Category'];
  }, [type, userCustomCategories]);

  useEffect(() => {
    if (params?.openForm === 'true') {
      setShowAddPrompt(true);
    }
  }, [params]);

  // Default date to today on mount
  useEffect(() => {
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
    setDateObj(today);
  }, []);

  const resetForm = () => {
    setType('');
    setCategory('');
    setCustomCategory('');
    setDescription('');
    setAmount('');
    setDate('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddCustomCategory = async () => {
    if (!type) return;
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    const existingNames = (userCustomCategories[type] || []) as string[];
    const existing = new Set(existingNames);
    if (!existing.has(trimmed)) {
      const updated = [...existingNames, trimmed];
      if (user && updateUserCustomCategories) {
        await updateUserCustomCategories(user.uid, type, updated as string[]);
      }
    }
    setCategory(trimmed);
    setCustomCategory('');
  };

  const onSubmitForm = async () => {
    if (!type || !description.trim() || !amount || !date) return;
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount)) return;
  const finalCategory = category === '+ Add Category' ? customCategory.trim() : category;
    if (!finalCategory) return;
    if (isEditing && editingId) {
      // perform in-place update using TransactionsContext
      try {
        await updateTransaction(editingId, {
          description: description.trim(),
          amount: parsedAmount,
          category: finalCategory,
          type,
          date,
        });
      } catch (err) {
        console.error('Failed to update transaction', err);
      }
      resetForm();
      return;
    }

    await addTransaction({
      description: description.trim(),
      amount: parsedAmount,
      category: finalCategory,
      type: type,
      date,
    });
    resetForm();
  };

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);
  
  const onEdit = (transaction: TransactionItemProps['transaction']) => {
    // Prefill inline form for editing
    setIsEditing(true);
    setEditingId(transaction.id);
    setDescription(transaction.description);
    setAmount(String(transaction.amount));
    setCategory(transaction.category);
    setType(transaction.type);
    setDate(transaction.date);
    try {
      setDateObj(new Date(transaction.date));
    } catch (e) {
      setDateObj(new Date());
    }
  };

  const onDelete = (id: string) => {
    // Confirmation before deleting
    deleteTransaction(id);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradients.screen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      {/* Inline Add/Edit Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</Text>

        <View style={styles.formRow}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.chipsRow}>
            <TouchableOpacity onPress={() => { setType('income'); setCategory(''); }} style={[styles.chip, type === 'income' && styles.chipActive]}>
              <Text style={[styles.chipText, type === 'income' && styles.chipTextActive]}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setType('expense'); setCategory(''); }} style={[styles.chip, type === 'expense' && styles.chipActive]}>
              <Text style={[styles.chipText, type === 'expense' && styles.chipTextActive]}>Expense</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!!type && (
          <View style={styles.formRow}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesWrap}>
              {combinedCategories.map((c) => (
                <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.categoryPill, category === c && styles.categoryPillActive]}>
                  <Text style={[styles.categoryPillText, category === c && styles.categoryPillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {category === '+ Add Category' && (
          <View style={styles.formRow}>
            <Text style={styles.label}>+ Add Category</Text>
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInputBox}
                placeholder="Enter new category"
                placeholderTextColor="#94a3b8"
                value={customCategory}
                onChangeText={setCustomCategory}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={handleAddCustomCategory} style={styles.addCatButton}>
                <Text style={styles.addCatButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.formRow}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textInputBox}
            placeholder="Description"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            returnKeyType="next"
          />
        </View>

        <View style={styles.formRowInline}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Amount (LKR)</Text>
            <TextInput
              style={styles.textInputBox}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.textInputBox}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: date ? '#0f172a' : '#94a3b8' }}>{date || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="default"
                onChange={(event: unknown, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateObj(selectedDate);
                    const iso = selectedDate.toISOString().split('T')[0];
                    setDate(iso);
                  }
                }}
              />)
            }
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onSubmitForm} style={[styles.primaryButton]}>
            <Text style={styles.primaryButtonText}>{isEditing ? 'Update Transaction' : 'Add Transaction'}</Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity onPress={resetForm} style={[styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {showAddPrompt && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Transaction</Text>
            <Text style={styles.modalText}>Would you like to add a new transaction now?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setShowAddPrompt(false); router.push({ pathname: '/add-transaction' }); }} style={[styles.modalButton, styles.modalPrimary]}>
                <Text style={styles.modalPrimaryText}>Open Form</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddPrompt(false)} style={[styles.modalButton, styles.modalSecondary]}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.md },
  filterContainer: { flexDirection: 'row', marginBottom: spacing.md, justifyContent: 'center' },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1e293b', marginHorizontal: 4, borderWidth: 1, borderColor: colors.border },
  activeFilter: { backgroundColor: colors.income },
  filterText: { color: colors.textSecondary, fontWeight: '600' },
  activeFilterText: { color: 'white' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: radius.md, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  transactionDetails: { flex: 1 },
  transactionDesc: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  transactionSub: { fontSize: 12, color: colors.textSecondary },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 8, color: colors.textPrimary },
  income: { color: colors.income },
  expense: { color: colors.expense },
  transactionActions: { flexDirection: 'row' },
  actionButton: { padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, color: colors.textSecondary },
  formCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  formRow: { marginBottom: 12 },
  formRowInline: { flexDirection: 'row', marginBottom: 12 },
  label: { ...typography.label, marginBottom: 6 },
  chipsRow: { flexDirection: 'row' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#1e293b', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.income },
  chipText: { color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryPill: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#1e293b', borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  categoryPillActive: { backgroundColor: colors.income },
  categoryPillText: { color: colors.textSecondary, fontWeight: '600' },
  categoryPillTextActive: { color: 'white' },
  textInputBox: { backgroundColor: '#0b1222', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary },
  textInputPlaceholder: { color: '#94a3b8' },
  customRow: { flexDirection: 'row', alignItems: 'center' },
  customInputBox: { flex: 1, backgroundColor: '#0b1222', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary },
  customInputPlaceholder: { color: '#94a3b8' },
  addCatButton: { backgroundColor: colors.income, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  addCatButtonText: { color: 'white', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  primaryButton: { flex: 1, backgroundColor: colors.income, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  primaryButtonText: { color: 'white', fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginLeft: 8, borderWidth: 1, borderColor: colors.border },
  secondaryButtonText: { color: colors.textPrimary, fontWeight: '700' },
  // Simple inline modal styles
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '85%', backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  modalText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modalPrimary: { backgroundColor: colors.income, marginRight: 8 },
  modalSecondary: { backgroundColor: '#1e293b', marginLeft: 8, borderWidth: 1, borderColor: colors.border },
  modalPrimaryText: { color: 'white', fontWeight: '700' },
  modalSecondaryText: { color: colors.textPrimary, fontWeight: '700' },
});
