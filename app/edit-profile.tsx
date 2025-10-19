import Card from '@/components/ui/Card';
import { useAuth } from '@/src/auth/AuthContext';
import { db } from '@/src/firebase';
import { colors, radius, spacing } from '@/src/theme';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const { user, updateUserCustomCategories } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  // initialize input with current user image so it is linked to Profile's edit action
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  // keep form in sync if user object updates (e.g. navigated back and data refreshed)
  useEffect(() => {
    setName(user?.name || '');
    setImageUrl(user?.imageUrl || '');
  }, [user]);

  const incomeCats = user?.customCategories?.income || [];
  const expenseCats = user?.customCategories?.expense || [];

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: name || null, imageUrl: imageUrl || null });
      Alert.alert('Saved', 'Profile updated successfully');
      // navigate back to Profile after successful save
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const removeCustomCategory = async (type: 'income' | 'expense', cat: string) => {
    if (!user) return;
    Alert.alert('Remove category', `Remove "${cat}" from ${type}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          const current = (user.customCategories && user.customCategories[type]) || [];
          const updated = current.filter((c: string) => c !== cat);
          if (updateUserCustomCategories) {
            await updateUserCustomCategories(user.uid, type, updated as string[]);
          }
        } catch (err) {
          console.error('Failed to remove category', err);
          Alert.alert('Error', 'Failed to remove category');
        }
      } }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Card style={styles.card}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.centerRow}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#eef7f4' }]}>
              <Text style={{ color: colors.textSecondary }}>No Image</Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>Display Name</Text>
        <TextInput style={styles.input} value={name || ''} onChangeText={setName} placeholder="Name" />

        <Text style={styles.label}>Profile Image URL</Text>
        <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.income }]} onPress={saveProfile} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Custom Categories</Text>

        <Text style={styles.sectionLabel}>Income</Text>
        {incomeCats.length === 0 && <Text style={styles.emptyText}>No custom income categories</Text>}
        {incomeCats.map((c: string) => (
          <View key={c} style={styles.row}>
            <Text style={styles.catText}>{c}</Text>
            <TouchableOpacity onPress={() => removeCustomCategory('income', c)} style={styles.removeBtn}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Expense</Text>
        {expenseCats.length === 0 && <Text style={styles.emptyText}>No custom expense categories</Text>}
        {expenseCats.map((c: string) => (
          <View key={c} style={styles.row}>
            <Text style={styles.catText}>{c}</Text>
            <TouchableOpacity onPress={() => removeCustomCategory('expense', c)} style={styles.removeBtn}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  card: { padding: spacing.md, marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  centerRow: { alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: spacing.md },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.md },
  button: { padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700' },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  catText: { fontSize: 14, color: colors.textPrimary },
  removeBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  removeText: { color: '#ef4444', fontWeight: '700' },
  emptyText: { color: colors.textSecondary, marginBottom: spacing.sm },
});
