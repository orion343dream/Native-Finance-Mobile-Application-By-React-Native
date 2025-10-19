import Card from '@/components/ui/Card';
import { useAuth } from '@/src/auth/AuthContext';
import { colors, radius, spacing } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const profileStats = [
    { icon: 'wallet-outline', label: 'Account Type', value: 'Premium' },
    { icon: 'calendar-outline', label: 'Member Since', value: 'September 2024' },
    { icon: 'shield-checkmark-outline', label: 'Verification', value: 'Verified' },
    { icon: 'trophy-outline', label: 'Goals Completed', value: '5' },
  ];

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', action: () => { /* navigate to edit - cast to any to satisfy router types */ (router as any)?.push?.('/edit-profile'); } },
    { icon: 'notifications-outline', label: 'Notifications', action: () => {} },
    { icon: 'lock-closed-outline', label: 'Privacy & Security', action: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', action: () => {} },
    { icon: 'information-circle-outline', label: 'About', action: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#0f766e', '#059669']} style={styles.headerGradient}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.email?.split('@')[0] || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        {profileStats.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name={stat.icon as any} size={24} color={colors.income} />
              <View style={styles.statText}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Card style={styles.menuCard}>
        <Text style={styles.menuTitle}>Account Settings</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
            <View style={styles.menuItemContent}>
              <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card>

      <Card style={styles.menuCard}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Native Finance App v1.0.0</Text>
        <Text style={styles.footerText}>© 2024 Native Finance. All rights reserved.</Text>
      </View>
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
  borderBottomLeftRadius: radius.lg,
  borderBottomRightRadius: radius.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  menuCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: spacing.sm,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 2,
  },
});
