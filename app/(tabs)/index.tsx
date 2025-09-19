
import { useAuth } from '@/src/auth/AuthContext';
import { colors, gradients, radius, spacing, typography } from '@/src/theme';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import SpendingAnalysis from '../../components/dashboard/SpendingAnalysis';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const { transactions, loading } = useTransactions();
  const router = useRouter();

  const [range, setRange] = useState<7 | 30 | 'all'>(7);

  const filteredTransactions = useMemo(() => {
    if (range === 'all') return transactions;
    const since = new Date();
    since.setDate(since.getDate() - range + 1);
    return transactions.filter(t => new Date(t.date) >= since);
  }, [transactions, range]);

  const recentTransactions = useMemo(() => {
    return filteredTransactions
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions]);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];
    const today = new Date();
    const days = range === 'all' ? 7 : range;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const dailyIncome = filteredTransactions
        .filter(t => t.date === dateString && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      incomeData.push(dailyIncome);
      const dailyExpense = filteredTransactions
        .filter(t => t.date === dateString && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      expenseData.push(dailyExpense);
    }
    return {
      labels,
      datasets: [
        { data: incomeData, color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})` },
        { data: expenseData, color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})` },
      ],
      legend: ['Income', 'Expense'],
    };
  }, [filteredTransactions, range]);

  const balanceSparkline = useMemo(() => {
    const today = new Date();
    const days = range === 'all' ? 14 : Math.max(7, range);
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const income = transactions
        .filter(t => t.date <= dateString && t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter(t => t.date <= dateString && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      data.push(income - expense);
    }
    return { labels, datasets: [{ data }] };
  }, [transactions, range]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading your data…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={gradients.screen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientLayer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.subGreeting}>Welcome to your financial hub.</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={styles.summaryValue}>LKR {totals.balance.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>LKR {totals.income.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>LKR {totals.expense.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity accessibilityLabel="Add new transaction" style={styles.addButton} onPress={() => router.push('/transactions')}>
        <Ionicons name="add-circle" size={22} color="white" />
        <Text style={styles.addButtonText}>Add New Transaction</Text>
      </TouchableOpacity>
      
      <SpendingAnalysis />


     

      <View style={styles.filterRow}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={{ flexDirection: 'row' }}>
          {[7, 30].map(v => (
            <TouchableOpacity key={v} accessibilityLabel={`Show last ${v} days`} onPress={() => setRange(v as 7 | 30)} style={[styles.filterChip, range === v && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, range === v && styles.filterChipTextActive]}>{v}d</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity accessibilityLabel="Show all time" onPress={() => setRange('all')} style={[styles.filterChip, range === 'all' && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, range === 'all' && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income vs. Expense ({range === 'all' ? 'Last 7 Days' : `Last ${range} Days`})</Text>
        <BarChart
          data={chartData}
          width={width - 32} // from react-native
          height={220}
          yAxisLabel="LKR "
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            decimalPlaces: 0,
            barPercentage: 0.6,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: '0',
              stroke: '#e2e8f0',
            },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Balance Trend</Text>
        <LineChart
          data={balanceSparkline}
          width={width - 32}
          height={180}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length > 0 ? (
          recentTransactions.map(t => (
            <View key={t.id} style={styles.transactionItem}>
              <View>
                <Text style={styles.transactionDesc}>{t.description}</Text>
                <Text style={styles.transactionDate}>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
              <Text style={[styles.transactionAmount, t.type === 'income' ? styles.income : styles.expense]}>
                {t.type === 'income' ? '+' : '-'} LKR {t.amount.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.textSecondary }}>No recent transactions. Add your first one!</Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity accessibilityLabel="View reports" style={styles.quickAction} onPress={() => router.push('/analysis')}>
          <Ionicons name="stats-chart" size={22} color="#047857" />
          <Text style={styles.quickActionText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Budget settings" style={styles.quickAction} onPress={() => router.push('/transactions')}>
          <Ionicons name="wallet" size={22} color="#047857" />
          <Text style={styles.quickActionText}>Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Manage categories" style={styles.quickAction} onPress={() => router.push('/transactions')}>
          <Ionicons name="pricetags" size={22} color="#047857" />
          <Text style={styles.quickActionText}>Categories</Text>
        </TouchableOpacity>
      </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gradientLayer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  greeting: { ...typography.title },
  subGreeting: { ...typography.subtitle },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: spacing.md },
  summaryBox: { alignItems: 'center' },
  summaryLabel: { ...typography.label },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
  addButton: { flexDirection: 'row', backgroundColor: colors.income, padding: 14, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.md, marginVertical: spacing.sm },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  section: { backgroundColor: colors.card, padding: spacing.md, marginVertical: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: colors.textPrimary },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  transactionDesc: { fontSize: 16, color: colors.textPrimary },
  transactionDate: { fontSize: 12, color: colors.textSecondary },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  income: { color: colors.income },
  expense: { color: colors.expense },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginTop: spacing.sm },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#e2e8f0', marginLeft: 6 },
  filterChipActive: { backgroundColor: colors.income },
  filterChipText: { color: '#475569', fontWeight: '600' },
  filterChipTextActive: { color: 'white' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.md, marginVertical: spacing.sm },
  quickAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderColor: colors.border, borderWidth: 1 },
  quickActionText: { marginLeft: 6, color: colors.textPrimary, fontWeight: '600' },
});

export default DashboardScreen;
