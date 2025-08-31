
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function RecentTransactions() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Recent Transactions</ThemedText>
      <ThemedView style={styles.transaction}>
        <ThemedText>Groceries</ThemedText>
        <ThemedText>-$50</ThemedText>
      </ThemedView>
      <ThemedView style={styles.transaction}>
        <ThemedText>Salary</ThemedText>
        <ThemedText>+$2,000</ThemedText>
      </ThemedView>
      <ThemedView style={styles.transaction}>
        <ThemedText>Dinner</ThemedText>
        <ThemedText>-$30</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
