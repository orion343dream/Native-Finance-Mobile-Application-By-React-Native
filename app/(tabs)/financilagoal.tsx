import { useAuth } from '@/src/auth/AuthContext';
import { db } from '@/src/firebase';
import { colors, gradients, radius, spacing, typography } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type Priority = 'low' | 'medium' | 'high';

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number; // simulated
  targetDate: string; // ISO date
  priority: Priority;
}

const presetRanges = [30, 90, 180]; // days: 1 month, 3 months, 6 months

// A small memoized header component so the header (form) doesn't remount on list updates
const GoalsHeader = React.memo(function GoalsHeader(props: {
  name: string;
  setName: (v: string) => void;
  amountText: string;
  setAmountText: (v: string) => void;
  targetDate: string;
  setShowDatePicker: (v: boolean) => void;
  showDatePicker: boolean;
  presetRanges: number[];
  setTargetDate: (d: string) => void;
  priority: Priority;
  setPriority: (p: Priority) => void;
  validate: () => boolean;
  saveGoal: () => void;
  editingId: string | null;
  loading: boolean;
}) {
  const {
    name,
    setName,
    amountText,
    setAmountText,
    targetDate,
    setShowDatePicker,
    showDatePicker,
    presetRanges,
    setTargetDate,
    priority,
    setPriority,
    validate,
    saveGoal,
    editingId,
    loading,
  } = props;
  const router = useRouter();

  return (
    <LinearGradient colors={gradients.screen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
      <View style={styles.headerRow}>
  <TouchableOpacity accessibilityLabel="Back" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Financial Goals</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Goal name</Text>
        <TextInput accessible accessibilityLabel="Goal name" placeholder="e.g. Emergency Fund" value={name} onChangeText={setName} style={styles.input} autoCorrect={false} />

        <Text style={[styles.label, { marginTop: 8 }]}>Target amount</Text>
        <TextInput
          accessible
          accessibilityLabel="Target amount"
          keyboardType="numeric"
          placeholder="0.00"
          value={amountText}
          onChangeText={(t) => setAmountText(t.replace(/[^0-9.]/g, ''))}
          style={styles.input}
          autoCorrect={false}
        />

        <Text style={[styles.label, { marginTop: 8 }]}>Target date</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton} accessibilityLabel="Open date picker">
            <Text style={styles.dateText}>{new Date(targetDate).toLocaleDateString()}</Text>
          </TouchableOpacity>
          <View style={{ marginLeft: 8 }}>
            {presetRanges.map(r => (
              <TouchableOpacity key={r} onPress={() => setTargetDate(new Date(Date.now() + r * 24 * 3600 * 1000).toISOString().split('T')[0])} style={styles.presetButton} accessibilityLabel={`Set ${r} days`}>
                <Text style={styles.presetText}>{r / 30}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date picker for native platforms */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date(targetDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              // keep the picker open on iOS
              // parent handles state
              if (selectedDate) {
                setTargetDate(selectedDate.toISOString().split('T')[0]);
              }
            }}
          />
        )}

        <Text style={[styles.label, { marginTop: 8 }]}>Priority</Text>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          {(['low', 'medium', 'high'] as Priority[]).map(p => (
            <TouchableOpacity key={p} onPress={() => setPriority(p)} style={[styles.priorityOption, priority === p && styles.priorityOptionActive]} accessibilityLabel={`Set priority ${p}`}>
              <Text style={{ fontWeight: priority === p ? '700' : '600', color: priority === p ? 'white' : colors.textPrimary }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity disabled={!validate() || loading} onPress={saveGoal} style={[styles.saveButton, (!validate() || loading) && { opacity: 0.5 }]} accessibilityLabel="Save goal">
          <Text style={styles.saveButtonText}>{editingId ? 'Update Goal' : 'Create Goal'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
});

// Initially empty; we'll load from Firestore

const AnalysisScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [targetDate, setTargetDate] = useState<string>(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [loading, setLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; visible: boolean } | null>(null);
  const listRef = useRef<FlatList | null>(null);

  // Helpers
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setAmountText('');
  setTargetDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setPriority('medium');
  };

  const validate = () => {
    const amount = Number(amountText.replace(/[^0-9.]/g, '')) || 0;
    return name.trim().length > 0 && amount > 0 && new Date(targetDate) > new Date();
  };

  const saveGoal = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to save goals.');
      return;
    }
    setLoading(true);
    const amount = Number(amountText.replace(/[^0-9.]/g, '')) || 0;

    try {
      // create or update in Firestore under users/{uid}/goals
      const goalsCol = collection(db, 'users', user.uid, 'goals');
      if (editingId) {
        const goalDoc = doc(goalsCol, editingId);
    // update remote
    await updateDoc(goalDoc, { name: name.trim(), targetAmount: amount, targetDate, priority, updatedAt: serverTimestamp() });
    // optimistic local update so the list shows immediately
    setGoals(prev => prev.map(g => g.id === editingId ? ({ ...g, name: name.trim(), targetAmount: amount, targetDate, priority }) : g));
      } else {
        const res = await addDoc(goalsCol, { name: name.trim(), targetAmount: amount, savedAmount: 0, targetDate, priority, createdAt: serverTimestamp() });
        // Add the newly created goal to local state immediately (optimistic)
        const newGoal: FinancialGoal = { id: res.id, name: name.trim(), targetAmount: amount, savedAmount: 0, targetDate, priority };
        setGoals(prev => [newGoal, ...prev]);
        // scroll list to top so the new goal is visible
        setTimeout(() => {
          try { listRef.current?.scrollToOffset({ offset: 0, animated: true } as any); } catch (e) { /* ignore */ }
        }, 200);
        Alert.alert('Saved', 'Goal created');
      }

      resetForm();
    } catch (err) {
      console.error('Error saving goal', err);
      Alert.alert('Error', 'Failed to save goal.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (goal: FinancialGoal) => {
  setEditingId(goal.id);
  setName(goal.name);
  setAmountText(goal.targetAmount.toString());
  setTargetDate(goal.targetDate);
  setPriority(goal.priority);
  // scroll to top (works on web); on native the header/form is visible by design
  window?.scrollTo?.({ top: 0 });
  };

  const requestDelete = (id: string) => setConfirmDelete({ id, visible: true });

  const confirmDeleteNow = async (id: string) => {
    if (!user) return;
    const goalDoc = doc(db, 'users', user.uid, 'goals', id);
    try {
      await deleteDoc(goalDoc);
    } catch (err) {
      console.error('Delete failed', err);
      Alert.alert('Error', 'Failed to delete goal');
    }
    setConfirmDelete(null);
  };

  // Formatting helpers
  const fmtCurrency = (n: number) => `LKR ${n.toFixed(2)}`;

  // Compute progress
  const computeProgress = (g: FinancialGoal) => Math.min(1, g.savedAmount / g.targetAmount || 0);

  // Load goals from Firestore for the current user
  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoadingGoals(false);
      return;
    }

    setLoadingGoals(true);
    const goalsCol = collection(db, 'users', user.uid, 'goals');
    const q = query(goalsCol, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: FinancialGoal[] = snapshot.docs.map(d => ({ id: d.id, name: d.data().name, targetAmount: d.data().targetAmount, savedAmount: d.data().savedAmount || 0, targetDate: d.data().targetDate, priority: d.data().priority }));
      setGoals(list);
      setLoadingGoals(false);
    }, (err) => {
      console.error('Goals snapshot error', err);
      setLoadingGoals(false);
    });

    return unsub;
  }, [user]);

  // Analysis summary for goals
  const goalsAnalysis = useMemo(() => {
    const totalGoals = goals.length;
    const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
    const totalSaved = goals.reduce((s, g) => s + (g.savedAmount || 0), 0);
    const overallProgress = totalTarget > 0 ? totalSaved / totalTarget : 0;
    const upcoming = goals.slice().sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];
    return { totalGoals, totalTarget, totalSaved, overallProgress, upcoming };
  }, [goals]);

  // Render item
  const renderGoal = ({ item }: { item: FinancialGoal }) => {
    const progress = computeProgress(item);
    const daysLeft = Math.ceil((new Date(item.targetDate).getTime() - Date.now()) / (24 * 3600 * 1000));

    const priorityColor = item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f59e0b' : '#10b981';

    return (
      <View style={styles.goalCard} accessible accessibilityRole="button">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalName}>{item.name}</Text>
            <Text style={styles.goalMeta}>{fmtCurrency(item.savedAmount)} / {fmtCurrency(item.targetAmount)}</Text>
            <Text style={styles.goalMeta}>{daysLeft > 0 ? `${daysLeft} day(s) left` : 'Due'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={{ color: 'white', fontWeight: '700' }}>{item.priority}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity onPress={() => startEdit(item)} style={{ marginRight: 8 }} accessibilityLabel={`Edit ${item.name}`}>
                <Ionicons name="pencil" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => requestDelete(item.id)} accessibilityLabel={`Delete ${item.name}`}>
                <Ionicons name="trash" size={20} color="#e11d48" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: priorityColor }]} />
        </View>
      </View>
    );
  };

  return (
  <>
  <FlatList
      contentContainerStyle={{ padding: spacing.md, backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<GoalsHeader
        name={name}
        setName={setName}
        amountText={amountText}
        setAmountText={setAmountText}
        targetDate={targetDate}
        setShowDatePicker={setShowDatePicker}
        showDatePicker={showDatePicker}
        presetRanges={presetRanges}
        setTargetDate={setTargetDate}
        priority={priority}
        setPriority={setPriority}
        validate={validate}
        saveGoal={saveGoal}
        editingId={editingId}
        loading={loading}
      />}
  ref={listRef as any}
  data={goals}
      keyExtractor={g => g.id}
      renderItem={renderGoal}
      ListEmptyComponent={() => (
        <View style={styles.emptyPlaceholder}>
          <Text style={styles.emptyTitle}>No financial goals yet</Text>
          <Text style={styles.emptySubtitle}>Create your first goal to start tracking progress and time remaining.</Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={{ padding: spacing.md }}>
          <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Goals Summary</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: colors.textSecondary }}>Total goals: {goalsAnalysis.totalGoals}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Total target: {fmtCurrency(goalsAnalysis.totalTarget)}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Total saved: {fmtCurrency(goalsAnalysis.totalSaved)}</Text>
            <View style={{ marginTop: 8, height: 12, backgroundColor: '#e6eef6', borderRadius: 8, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${Math.min(1, goalsAnalysis.overallProgress) * 100}%`, backgroundColor: colors.income }} />
            </View>
            <Text style={{ color: colors.textSecondary, marginTop: 6 }}>Overall progress: {(goalsAnalysis.overallProgress * 100).toFixed(0)}%</Text>
            {goalsAnalysis.upcoming && (
              <Text style={{ color: colors.textSecondary, marginTop: 6 }}>Next deadline: {new Date(goalsAnalysis.upcoming.targetDate).toLocaleDateString()} ({Math.ceil((new Date(goalsAnalysis.upcoming.targetDate).getTime() - Date.now())/(24*3600*1000))} days)</Text>
            )}
          </View>
        </View>
      )}
    />
    {/* Delete confirmation modal */}
    <Modal visible={!!confirmDelete?.visible} transparent animationType="fade" onRequestClose={() => setConfirmDelete(null)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Delete goal?</Text>
          <Text style={{ color: colors.textSecondary }}>This will permanently remove the goal. Transactions/savings are not affected.</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
            <TouchableOpacity onPress={() => setConfirmDelete(null)} style={{ marginRight: 8, padding: 8 }}>
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDeleteNow(confirmDelete!.id)} style={{ backgroundColor: '#ef4444', padding: 8, borderRadius: 6 }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  backButton: { padding: 8, marginRight: 8 },
  title: { ...typography.title, flex: 1, textAlign: 'left' },
  formCard: { backgroundColor: colors.card, padding: spacing.md, marginHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  label: { ...typography.label, color: colors.textSecondary },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: colors.border },
  dateButton: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  dateText: { color: colors.textPrimary },
  presetButton: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 8, marginBottom: 6, marginRight: 8 },
  presetText: { color: colors.textPrimary, fontWeight: '600' },
  priorityOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: colors.border },
  priorityOptionActive: { backgroundColor: colors.income },
  saveButton: { marginTop: 12, backgroundColor: colors.income, padding: 12, borderRadius: radius.md, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '700' },

  emptyPlaceholder: { padding: spacing.md, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptySubtitle: { color: colors.textSecondary, marginTop: 8 },

  goalCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg, marginHorizontal: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  goalName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  goalMeta: { color: colors.textSecondary, marginTop: 4 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, marginBottom: 6 },
  progressTrack: { height: 8, backgroundColor: '#e6eef6', borderRadius: 8, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', width: '0%', borderRadius: 8 },
});

export default AnalysisScreen;
