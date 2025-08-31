
import Summary from '@/components/dashboard/Summary';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SpendingAnalysis from '@/components/dashboard/SpendingAnalysis';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Dashboard</ThemedText>
      <Summary />
      <RecentTransactions />
      <SpendingAnalysis />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
