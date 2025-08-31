
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function Summary() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Summary</ThemedText>
      <ThemedView style={styles.row}>
        <ThemedText>Income</ThemedText>
        <ThemedText>$5,000</ThemedText>
      </ThemedView>
      <ThemedView style={styles.row}>
        <ThemedText>Expenses</ThemedText>
        <ThemedText>$2,500</ThemedText>
      </ThemedView>
      <ThemedView style={styles.row}>
        <ThemedText>Balance</ThemedText>
        <ThemedText>$2,500</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
