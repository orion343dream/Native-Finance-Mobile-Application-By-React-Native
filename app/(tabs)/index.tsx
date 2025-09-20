
import { useAuth } from '@/src/auth/AuthContext';
import { colors, gradients, radius, spacing, typography } from '@/src/theme';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, LayoutChangeEvent } from 'react-native';
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

  // Helper: generate list of dates between start and end (inclusive)
  const getDateRange = (start: Date, end: Date) => {
    const arr: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      arr.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    return arr;
  };

  const chartData = useMemo(() => {
    // Decide date window
    const today = new Date();
    let dateStrings: string[] = [];

    if (range === 'all') {
      // Use full span from earliest transaction to today (limit to 365 days)
      if (transactions.length === 0) {
        dateStrings = getDateRange(new Date(today), new Date(today));
      } else {
        const earliest = transactions
          .map(t => new Date(t.date))
          .reduce((a, b) => (a < b ? a : b));
        const start = new Date(earliest);
        dateStrings = getDateRange(start, today).slice(-365);
      }
    } else {
      const days = range;
      const start = new Date(today);
      start.setDate(start.getDate() - (days - 1));
      dateStrings = getDateRange(start, today);
    }

    const labels = dateStrings.map(ds => new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const incomeData = dateStrings.map(ds => filteredTransactions.filter(t => t.date === ds && t.type === 'income').reduce((s, t) => s + t.amount, 0));
    const expenseData = dateStrings.map(ds => filteredTransactions.filter(t => t.date === ds && t.type === 'expense').reduce((s, t) => s + t.amount, 0));

    return {
      labels,
      rawDates: dateStrings,
      datasets: [
        { data: incomeData, color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})` },
        { data: expenseData, color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})` },
      ],
      legend: ['Income', 'Expense'],
    };
  }, [filteredTransactions, range, transactions]);

  // Build balance sparkline using the same date window as chartData so filters align
  const balanceSparkline = useMemo(() => {
    const dates: string[] = (chartData as any).rawDates || [];
    const labels = dates.map(ds => new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = dates.map(ds => {
      const d = new Date(ds + 'T00:00:00');
      const income = transactions.filter(t => new Date(t.date) <= d && t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => new Date(t.date) <= d && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return income - expense;
    });
    return { labels, rawDates: dates, datasets: [{ data }] };
  }, [chartData, transactions]);

  // Tooltip / selection state for charts
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [chartWidthPx, setChartWidthPx] = useState<number>(width - 32);
  const chartContainerRef = useRef<View | null>(null);

  // When chart data changes, default selection to latest day
  useEffect(() => {
    const last = balanceSparkline.datasets[0].data.length - 1;
    if (last >= 0) {
      setSelectedIndex(last);
      setSelectedLabel(balanceSparkline.labels ? balanceSparkline.labels[last] : '');
      setSelectedValue(balanceSparkline.datasets[0].data[last]);
    }
  }, [balanceSparkline, range]);

  const onChartLayout = (e: LayoutChangeEvent) => {
  const w = e.nativeEvent.layout.width;
  setChartWidthPx(w);
  };

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
        <LinearGradient colors={[ '#ecfdf5', '#bbf7d0' ]} style={styles.balanceCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.summaryLabelCentered}>Balance</Text>
          <Text style={styles.summaryValueCentered}>LKR {totals.balance.toFixed(2)}</Text>
        </LinearGradient>

        <View style={styles.rowBelow}>
          <LinearGradient colors={[ '#ffffff', '#ecfdf5' ]} style={[styles.halfCard, { marginRight: 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.summaryLabelCentered}>Income</Text>
            <Text style={[styles.summaryValueCentered, { color: colors.income }]}>LKR {totals.income.toFixed(2)}</Text>
          </LinearGradient>
          <LinearGradient colors={[ '#ffffff', '#fee2e2' ]} style={[styles.halfCard, { marginLeft: 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.summaryLabelCentered}>Expense</Text>
            <Text style={[styles.summaryValueCentered, { color: colors.expense }]}>LKR {totals.expense.toFixed(2)}</Text>
          </LinearGradient>
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
          // hide default Y-axis label prefix
          formatYLabel={() => ''}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            barPercentage: 0.6,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: '0',
              stroke: '#f1f5f9',
            },
          }}
          style={{ marginVertical: 8, borderRadius: 16, backgroundColor: '#ffffff' }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Balance Trend</Text>
        <View onLayout={onChartLayout} ref={chartContainerRef}>
          {selectedLabel !== '' && selectedValue !== null && (
            <View pointerEvents="none" style={{ position: 'relative', height: 0 }}>
              {/* compute tooltip x from selectedIndex */}
              <View style={{ position: 'absolute', left: Math.max(8, (selectedIndex !== null && balanceSparkline.labels.length > 1) ? (selectedIndex / (balanceSparkline.labels.length - 1)) * (chartWidthPx) : 8), top: -36 }}>
                <View style={{ backgroundColor: '#047857', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>{selectedLabel} — LKR {selectedValue?.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
          <LineChart
          data={balanceSparkline}
          // use measured container width so chart fills the card without extra margins
          width={chartWidthPx || (width - 32)}
          height={180}
          withDots={true}
          withInnerLines={false}
          withOuterLines={false}
          // hide left axis label prefix and numbers; keep formatYLabel only for this chart
          fromZero={false}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
            propsForBackgroundLines: {
              stroke: '#f1f5f9',
            },
            decimalPlaces: 0,
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16, backgroundColor: '#ffffff', paddingLeft: 0 }}
          formatYLabel={() => ''}
          onDataPointClick={(data) => {
            const index = data.index;
            const value = data.value as number;
            setSelectedIndex(index);
            setSelectedLabel(balanceSparkline.labels[index]);
            setSelectedValue(value);
          }}
        />
        </View>
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
  balanceCard: { width: '100%', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  rowBelow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 1, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  summaryLabel: { ...typography.label },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
  summaryLabelCentered: { ...typography.label, textAlign: 'center' },
  summaryValueCentered: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', textShadowColor: 'rgba(4,120,87,0.12)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 6 },
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
