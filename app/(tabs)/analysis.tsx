
import Card from '@/components/ui/Card';
import { useAuth } from '@/src/auth/AuthContext';
import { db } from '@/src/firebase';
import { colors, radius, spacing, typography } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Goal = {
  id: string;
  title: string;
  target: number;
  amountSaved?: number;
  createdAt?: any;
};

export default function GoalScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New-goal inputs
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newSaved, setNewSaved] = useState('');

  // Edit modal
  const [editing, setEditing] = useState<Goal | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'created' | 'progress'>('created');

  const loadGoalsListener = useCallback(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const ref = collection(db, 'users', user.uid, 'goals');
    const q = query(ref);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Goal[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          arr.push({
            id: d.id,
            title: data.title || 'Untitled',
            target: typeof data.target === 'number' ? data.target : 0,
            amountSaved: typeof data.amountSaved === 'number' ? data.amountSaved : 0,
            createdAt: data.createdAt,
          });
        });

        const sorted = arr.sort((a, b) => {
          if (sortBy === 'created') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
          const pa = a.target > 0 ? (a.amountSaved || 0) / a.target : 0;
          const pb = b.target > 0 ? (b.amountSaved || 0) / b.target : 0;
          return pb - pa;
        });

        setGoals(sorted);
        setLoading(false);
      },
      (err) => {
        console.error('Goals listener error', err);
        setLoading(false);
      }
    );

    return unsub;
  }, [user, sortBy]);

  useEffect(() => {
    const unsub = loadGoalsListener();
    return () => unsub && unsub();
  }, [loadGoalsListener]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const validateTitle = (t: string) => t.trim().length > 0;
  const validatePositive = (v: string) => {
    const n = Number(v);
    return !Number.isNaN(n) && n > 0;
  };

  const createGoal = async () => {
    if (!user) return Alert.alert('Not signed in', 'Sign in to save goals.');
    if (!validateTitle(newTitle)) return Alert.alert('Invalid title', 'Please enter a goal title.');
    if (!validatePositive(newTarget)) return Alert.alert('Invalid target', 'Enter a target greater than 0.');

    try {
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        userId: user.uid,
        title: newTitle.trim(),
        target: Number(newTarget),
        amountSaved: Number(newSaved) || 0,
        createdAt: serverTimestamp(),
      });
      setNewTitle('');
      setNewTarget('');
      setNewSaved('');
    } catch (e) {
      console.error('Create goal error', e);
      Alert.alert('Error', 'Could not save goal.');
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete goal', 'Are you sure you want to delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user!.uid, 'goals', id));
          } catch (e) {
            console.error('Delete goal error', e);
            Alert.alert('Error', 'Could not delete goal.');
          }
        },
      },
    ]);
  };

  const openEdit = (g: Goal) => {
    setEditing(g);
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!editing || !user) return;
    if (!validateTitle(editing.title)) return Alert.alert('Invalid title', 'Please enter a goal title.');
    if (!editing.target || editing.target <= 0) return Alert.alert('Invalid target', 'Target must be greater than 0.');

    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', editing.id), {
        title: editing.title.trim(),
        target: editing.target,
        amountSaved: editing.amountSaved || 0,
      });
      setEditVisible(false);
      setEditing(null);
    } catch (e) {
      console.error('Save edit error', e);
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const saved = typeof item.amountSaved === 'number' ? item.amountSaved : 0;
    const target = typeof item.target === 'number' && item.target > 0 ? item.target : 0;
    const ratio = target > 0 ? Math.max(0, Math.min(1, saved / target)) : 0;
    const isCompleted = ratio >= 1;
    const remaining = target - saved;

    return (
      <Card style={[styles.goalCard, isCompleted && styles.completedGoalCard]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIconContainer}>
            <Ionicons 
              name={isCompleted ? "checkmark-circle" : "trophy-outline"} 
              size={20} 
              color={isCompleted ? "#10b981" : colors.income} 
            />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            <Text style={styles.goalTarget}>Target: LKR {target.toLocaleString()}</Text>
          </View>
          <View style={styles.goalActions}>
            <TouchableOpacity 
              accessibilityLabel={`Edit goal ${item.title}`} 
              onPress={() => openEdit(item)} 
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              accessibilityLabel={`Delete goal ${item.title}`} 
              onPress={() => confirmDelete(item.id)} 
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={16} color={colors.expense} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${Math.min(ratio * 100, 100)}%`,
                backgroundColor: isCompleted ? "#10b981" : "#3b82f6"
              }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(ratio * 100)}% completed
          </Text>
        </View>

        <View style={styles.goalStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Saved</Text>
            <Text style={[styles.statValue, { color: colors.income }]}>
              LKR {saved.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, { color: remaining > 0 ? colors.expense : colors.income }]}>
              LKR {Math.max(0, remaining).toLocaleString()}
            </Text>
          </View>
        </View>

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="trophy" size={16} color="#10b981" />
            <Text style={styles.completedText}>Goal Achieved!</Text>
          </View>
        )}
      </Card>
    );
  };

  const completedGoals = goals.filter(g => (g.amountSaved || 0) >= g.target);
  const totalSaved = goals.reduce((sum, g) => sum + (g.amountSaved || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header with Statistics */}
      <LinearGradient colors={['#0f766e', '#059669']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitle}>
            <Ionicons name="trophy" size={28} color="white" />
            <Text style={styles.title}>Financial Goals</Text>
          </View>
          <Text style={styles.subtitle}>Track your savings and achieve your dreams</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{goals.length}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{completedGoals.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{overallProgress.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Add New Goal Card */}
        <Card style={styles.addGoalCard}>
          <View style={styles.addGoalHeader}>
            <Ionicons name="add-circle-outline" size={24} color={colors.income} />
            <Text style={styles.addGoalTitle}>Create New Goal</Text>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Title</Text>
              <TextInput
                placeholder="e.g., Emergency Fund, Vacation, Car..."
                value={newTitle}
                onChangeText={setNewTitle}
                style={styles.textInput}
                accessibilityLabel="New goal title"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Target Amount (LKR)</Text>
              <TextInput
                placeholder="100000"
                value={newTarget}
                onChangeText={setNewTarget}
                style={styles.textInput}
                keyboardType="numeric"
                accessibilityLabel="New goal target"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Already Saved (LKR)</Text>
              <TextInput
                placeholder="0"
                value={newSaved}
                onChangeText={setNewSaved}
                style={styles.textInput}
                keyboardType="numeric"
                accessibilityLabel="Amount already saved"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={createGoal} accessibilityLabel="Create new goal">
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </Card>

        {/* Goals List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Your Goals ({goals.length})</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity 
              onPress={() => setSortBy('created')} 
              style={[styles.sortButton, sortBy === 'created' && styles.sortButtonActive]}
            >
              <Text style={[styles.sortButtonText, sortBy === 'created' && styles.sortButtonTextActive]}>
                Newest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setSortBy('progress')} 
              style={[styles.sortButton, sortBy === 'progress' && styles.sortButtonActive]}
            >
              <Text style={[styles.sortButtonText, sortBy === 'progress' && styles.sortButtonTextActive]}>
                Progress
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.income} />
            <Text style={styles.loadingText}>Loading your goals...</Text>
          </View>
        ) : goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Goals Yet</Text>
            <Text style={styles.emptyText}>Create your first financial goal to start tracking your progress!</Text>
          </Card>
        ) : (
          <FlatList
            data={goals}
            keyExtractor={(g) => g.id}
            renderItem={renderGoal}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Goal</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalInput}>
              <Text style={styles.inputLabel}>Goal Title</Text>
              <TextInput 
                value={editing?.title} 
                onChangeText={(v) => setEditing((p) => p ? { ...p, title: v } : p)} 
                style={styles.textInput} 
                placeholder="Goal title" 
              />
            </View>
            
            <View style={styles.modalInput}>
              <Text style={styles.inputLabel}>Target Amount (LKR)</Text>
              <TextInput 
                value={editing ? String(editing.target) : ''} 
                onChangeText={(v) => setEditing((p) => p ? { ...p, target: Number(v) } : p)} 
                style={styles.textInput} 
                keyboardType="numeric" 
                placeholder="Target amount" 
              />
            </View>
            
            <View style={styles.modalInput}>
              <Text style={styles.inputLabel}>Amount Saved (LKR)</Text>
              <TextInput 
                value={editing ? String(editing.amountSaved || 0) : ''} 
                onChangeText={(v) => setEditing((p) => p ? { ...p, amountSaved: Number(v) } : p)} 
                style={styles.textInput} 
                keyboardType="numeric" 
                placeholder="Amount saved" 
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => { setEditVisible(false); setEditing(null); }} 
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={styles.saveButton} accessibilityLabel="Save goal changes">
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    padding: spacing.md,
  },
  addGoalCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5f3f0',
    borderStyle: 'dashed',
  },
  addGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addGoalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  inputRow: {
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.income,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    marginLeft: spacing.xs,
    backgroundColor: '#f1f5f9',
  },
  sortButtonActive: {
    backgroundColor: colors.income,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  goalCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  completedGoalCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  goalTarget: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  goalActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: '#f8fafc',
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#f8fafc',
    borderRadius: radius.sm,
    marginHorizontal: spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.income,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
