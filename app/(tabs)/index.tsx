
import { useAuth } from '@/src/auth/AuthContext';
import { colors, radius, spacing } from '@/src/theme';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LineChartBicolor from '../../components/dashboard/LineChartBicolor';
import SpendingAnalysis from '../../components/dashboard/SpendingAnalysis';
import SummaryChart from '../../components/dashboard/SummaryChart';
import TransactionsList from '../../components/ui/TransactionsList';

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
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const income = incomeTransactions.reduce((s, t) => s + t.amount, 0);
    const expense = expenseTransactions.reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance, incomeTransactions, expenseTransactions };
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Modern Header Section */}
      <LinearGradient colors={['#0f766e', '#059669']} style={styles.modernHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
              <Text style={styles.subGreeting}>Welcome to your financial dashboard</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/financilagoal')}>
              <Ionicons name="person-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Quick Stats in Header */}
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
              <Text style={styles.quickStatValue}>+{totals.incomeTransactions.length}</Text>
              <Text style={styles.quickStatLabel}>Income</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Ionicons name="trending-down" size={20} color="#ef4444" />
              <Text style={styles.quickStatValue}>-{totals.expenseTransactions.length}</Text>
              <Text style={styles.quickStatLabel}>Expenses</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Ionicons name="pie-chart" size={20} color="white" />
              <Text style={styles.quickStatValue}>{transactions.length}</Text>
              <Text style={styles.quickStatLabel}>Total</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Modern Balance Card */}
        <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={styles.modernBalanceCard}>
          <View style={styles.balanceCardHeader}>
            <Ionicons name="wallet" size={24} color={colors.income} />
            <Text style={styles.balanceCardTitle}>Current Balance</Text>
          </View>
          <Text style={[styles.balanceAmount, { color: totals.balance >= 0 ? colors.income : colors.expense }]}>
            LKR {Math.abs(totals.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.balanceSubtext}>
            {totals.balance >= 0 ? '↗ Positive balance' : '↘ Negative balance'}
          </Text>
        </LinearGradient>

        {/* Income/Expense Cards Row */}
        <View style={styles.modernCardsRow}>
          <View style={styles.modernIncomeCard}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="arrow-down-circle" size={24} color={colors.income} />
            </View>
            <Text style={styles.cardLabel}>Income</Text>
            <Text style={[styles.cardValue, { color: colors.income }]}>
              LKR {totals.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View style={styles.modernExpenseCard}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="arrow-up-circle" size={24} color={colors.expense} />
            </View>
            <Text style={styles.cardLabel}>Expenses</Text>
            <Text style={[styles.cardValue, { color: colors.expense }]}>
              LKR {totals.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/transactions')}>
              <LinearGradient colors={[colors.income, '#10b981']} style={styles.quickActionGradient}>
                <Ionicons name="add-circle" size={28} color="white" />
                <Text style={styles.quickActionText}>Add Transaction</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/financilagoal')}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.quickActionGradient}>
                <Ionicons name="trophy" size={28} color="white" />
                <Text style={styles.quickActionText}>Goals</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/analysis')}>
              <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.quickActionGradient}>
                <Ionicons name="analytics" size={28} color="white" />
                <Text style={styles.quickActionText}>Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/transactions')}>
              <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.quickActionGradient}>
                <Ionicons name="list" size={28} color="white" />
                <Text style={styles.quickActionText}>All Transactions</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
     

        {/* Overview Section */}
        <View style={styles.overviewSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financial Overview</Text>
            <View style={styles.modernFilterRow}>
              {[7, 30].map(v => (
                <TouchableOpacity key={v} onPress={() => setRange(v as 7 | 30)} style={[styles.modernFilterChip, range === v && styles.modernFilterChipActive]}>
                  <Text style={[styles.modernFilterText, range === v && styles.modernFilterTextActive]}>{v}d</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setRange('all')} style={[styles.modernFilterChip, range === 'all' && styles.modernFilterChipActive]}>
                <Text style={[styles.modernFilterText, range === 'all' && styles.modernFilterTextActive]}>All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsContainer}>
          <View style={styles.modernChartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="bar-chart" size={20} color={colors.income} />
              <Text style={styles.chartTitle}>Income vs. Expense</Text>
            </View>
            <SummaryChart />
          </View>
<View onLayout={onChartLayout} ref={chartContainerRef} style={{ position: 'relative' }}>
  {selectedLabel !== '' && selectedValue !== null && (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: Math.min(
          Math.max(
            8,
            (selectedIndex !== null && balanceSparkline.labels.length > 1)
              ? (selectedIndex / (balanceSparkline.labels.length - 1)) * (chartWidthPx)
              : 8
          ),
          (chartWidthPx || (width - 32)) - 140 // clamp so it doesn’t exceed right edge
        ),
        top: (() => {
          // ✅ compute vertical Y position based on value
          const data = balanceSparkline.datasets?.[0]?.data || [];
          if (selectedIndex !== null && data.length > 0) {
            const min = Math.min(...data, 0);
            const max = Math.max(...data, 0);
            const range = max - min || 1;
            const value = data[selectedIndex];
            const y = 180 - ((value - min) / range) * 180;
            return Math.max(8, Math.min(y - 30, 150)); // clamp inside chart
          }
          return 8;
        })(),
        zIndex: 10,
      }}
    >
      <View
        style={{
          backgroundColor: '#047857',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>
          {selectedLabel} — LKR {selectedValue?.toFixed(2)}
        </Text>
      </View>
    </View>
  )}

  <LineChartBicolor
    data={balanceSparkline.datasets?.[0]?.data || []}
    width={chartWidthPx || (width - 32)}
    height={180}
    strokeWidth={2}
  />
</View>



        {/* Spending Analysis */}
        <View style={styles.modernAnalysisCard}>
          <SpendingAnalysis />
        </View>

        {/* Recent Transactions */}
        <View style={styles.modernTransactionsCard}>
          <View style={styles.transactionsHeader}>
            <View style={styles.transactionsHeaderLeft}>
              <Ionicons name="receipt" size={20} color={colors.income} />
              <Text style={styles.chartTitle}>Recent Transactions</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/transactions')} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.income} />
            </TouchableOpacity>
          </View>
          {recentTransactions.length > 0 ? (
            <TransactionsList
              transactions={recentTransactions as any}
              categories={[] as any}
              deleteTransaction={(id: string | number) => {
                return (async () => {
                  const { deleteTransaction } = useTransactions() as any;
                  return deleteTransaction(String(id));
                })();
              }}
              onEdit={(id: string | number) => {
                router.push({ pathname: '/edit-transaction', params: { id: String(id) } });
              }}
            />
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTransactionsText}>No recent transactions</Text>
              <Text style={styles.emptyTransactionsSubtext}>Add your first transaction to get started!</Text>
            </View>
          )}
        </View>

      </View>
      
      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Modern Header Styles
  modernHeader: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerContent: {
    paddingTop: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileButton: {
    padding: spacing.xs,
  },
  
  // Quick Stats in Header
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    backdropFilter: 'blur(10px)',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  
  // Content Container
  contentContainer: {
    padding: spacing.md,
  },
  // Modern Balance Card
  modernBalanceCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e5f3f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Modern Cards Row
  modernCardsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  modernIncomeCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: '#e5f3f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  modernExpenseCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  // Quick Actions Section
  quickActionsSection: {
    marginBottom: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: '2%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  quickActionGradient: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Section Headers
  overviewSection: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  
  // Modern Filter Row
  modernFilterRow: {
    flexDirection: 'row',
  },
  modernFilterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginLeft: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  modernFilterChipActive: {
    backgroundColor: colors.income,
    borderColor: colors.income,
  },
  modernFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modernFilterTextActive: {
    color: 'white',
  },
  // Legacy styles (keeping for compatibility)
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  transactionDesc: { fontSize: 16, color: colors.textPrimary },
  transactionDate: { fontSize: 12, color: colors.textSecondary },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  income: { color: colors.income },
  expense: { color: colors.expense },
  // Charts Container
  chartsContainer: {
    marginBottom: spacing.lg,
  },
  modernChartCard: {
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  
  // Analysis Card
  modernAnalysisCard: {
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  // Transactions Card
  modernTransactionsCard: {
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  transactionsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.income,
    marginRight: 4,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTransactionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptyTransactionsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Bottom spacing
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default DashboardScreen;
