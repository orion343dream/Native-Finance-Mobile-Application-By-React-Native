import Card from '@/components/ui/Card';
import { useAuth } from '@/src/auth/AuthContext';
import { db } from '@/src/firebase';
import { colors, radius, spacing, typography } from '@/src/theme';
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

    return (
      <Card style={{ marginBottom: spacing.sm, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontWeight: '800', fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6 }}>Target: LKR {target ? target.toFixed(2) : '0.00'}</Text>
            <View style={{ height: 10, backgroundColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden', marginTop: 12 }}>
              <View style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: ratio >= 1 ? colors.income : '#60a5fa' }} />
            </View>
            <Text style={{ marginTop: 8, color: colors.textSecondary }}>{Math.round(ratio * 100)}% achieved — LKR {saved.toFixed(2)}</Text>
          </View>

          <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            <TouchableOpacity accessibilityLabel={`Edit goal ${item.title}`} onPress={() => openEdit(item)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: '#0f172a' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel={`Delete goal ${item.title}`} onPress={() => confirmDelete(item.id)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.expense }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, padding: spacing.md, backgroundColor: '#f8fafc' }}>
      <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={{ padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.md }}>
        <Text style={{ ...typography.title }}>Financial Goals</Text>
        <Text style={{ ...typography.subtitle, marginTop: 6 }}>Set targets and track progress toward your savings goals.</Text>
      </LinearGradient>

      <Card style={{ padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput placeholder="Goal title" value={newTitle} onChangeText={setNewTitle} style={styles.input} accessibilityLabel="New goal title" />
          <TextInput placeholder="Target" value={newTarget} onChangeText={setNewTarget} style={[styles.input, { width: 120, marginLeft: 8 }]} keyboardType="numeric" accessibilityLabel="New goal target" />
          <TextInput placeholder="Saved" value={newSaved} onChangeText={setNewSaved} style={[styles.input, { width: 100, marginLeft: 8 }]} keyboardType="numeric" accessibilityLabel="Amount already saved" />
          <TouchableOpacity style={styles.saveButton} onPress={createGoal} accessibilityLabel="Save new goal">
            <Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setSortBy('created')} style={{ marginRight: 8 }}>
            <Text style={{ fontWeight: sortBy === 'created' ? '800' : '600' }}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('progress')}>
            <Text style={{ fontWeight: sortBy === 'progress' ? '800' : '600' }}>Top progress</Text>
          </TouchableOpacity>
        </View>
        <View>{loading ? <ActivityIndicator /> : null}</View>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(g) => g.id}
        renderItem={renderGoal}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? <View style={{ alignItems: 'center', marginTop: spacing.lg }}><Text style={{ color: colors.textSecondary }}>No goals yet. Add your first financial goal.</Text></View> : null}
      />

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Card style={{ width: '92%', padding: spacing.md }}>
            <Text style={{ fontWeight: '800', fontSize: 18, marginBottom: 8 }}>Edit Goal</Text>
            <TextInput value={editing?.title} onChangeText={(v) => setEditing((p) => p ? { ...p, title: v } : p)} style={styles.input} placeholder="Title" />
            <TextInput value={editing ? String(editing.target) : ''} onChangeText={(v) => setEditing((p) => p ? { ...p, target: Number(v) } : p)} style={[styles.input, { marginTop: 8 }]} keyboardType="numeric" placeholder="Target" />
            <TextInput value={editing ? String(editing.amountSaved || 0) : ''} onChangeText={(v) => setEditing((p) => p ? { ...p, amountSaved: Number(v) } : p)} style={[styles.input, { marginTop: 8 }]} keyboardType="numeric" placeholder="Amount saved" />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={() => { setEditVisible(false); setEditing(null); }} style={{ marginRight: 8 }}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={styles.saveButton} accessibilityLabel="Save goal changes">
                <Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
  },
  saveButton: {
    marginLeft: 8,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
});
