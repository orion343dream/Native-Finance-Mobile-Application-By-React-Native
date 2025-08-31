
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function SpendingAnalysis() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Spending Analysis</ThemedText>
      <ThemedView style={styles.category}>
        <ThemedText>Food</ThemedText>
        <ThemedText>$800</ThemedText>
      </ThemedView>
      <ThemedView style={styles.category}>
        <ThemedText>Transport</ThemedText>
        <ThemedText>$300</ThemedText>
      </ThemedView>
      <ThemedView style={styles.category}>
        <ThemedText>Entertainment</ThemedText>
        <ThemedText>$400</ThemedText>
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
  category: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
