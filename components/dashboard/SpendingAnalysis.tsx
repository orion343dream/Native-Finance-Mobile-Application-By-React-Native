import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View, LayoutChangeEvent } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors, spacing, radius } from '@/src/theme';
import { useTransactions } from '@/src/transactions/TransactionsContext';

const categoryColors: Record<string, string> = {
  Food: '#f87171',
  Transport: '#60a5fa',
  Shopping: '#facc15',
  Bills: '#34d399',
  Entertainment: '#a78bfa',
  Other: '#94a3b8',
};

const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const SpendingAnalysis = () => {
  const { transactions } = useTransactions();
  const scrollRef = useRef<ScrollView | null>(null);
  const [page, setPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 48);

  const totals = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const incomeTransactions = transactions.filter((t) => t.type === 'income');

    const expenseTotals: Record<string, number> = {};
    const incomeTotals: Record<string, number> = {};

    let expenseTotal = 0;
    let incomeTotal = 0;

    expenseTransactions.forEach((t) => {
      expenseTotal += t.amount;
      expenseTotals[t.category] = (expenseTotals[t.category] || 0) + t.amount;
    });

    incomeTransactions.forEach((t) => {
      incomeTotal += t.amount;
      incomeTotals[t.category] = (incomeTotals[t.category] || 0) + t.amount;
    });

    return { expenseTotals, incomeTotals, expenseTotal, incomeTotal };
  }, [transactions]);

  const expenseChartData = useMemo(
    () =>
      Object.keys(totals.expenseTotals).map((cat) => ({
        name: cat,
        population: totals.expenseTotals[cat],
        color: categoryColors[cat] || categoryColors.Other,
        legendFontColor: '#334155',
        legendFontSize: 12,
      })),
    [totals.expenseTotals]
  );

  const incomeChartData = useMemo(
    () =>
      Object.keys(totals.incomeTotals).map((cat) => ({
        name: cat,
        population: totals.incomeTotals[cat],
        color: categoryColors[cat] || categoryColors.Other,
        legendFontColor: '#334155',
        legendFontSize: 12,
      })),
    [totals.incomeTotals]
  );

  const onScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / containerWidth);
    setPage(newPage);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        onMomentumScrollEnd={onScrollEnd}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: containerWidth * 2 }}
      >
        {/* Expenses Page */}
        <View style={[styles.page, { width: containerWidth }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.expenseTotal)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Top Category</Text>
              <Text style={styles.summaryValue}>
                {Object.keys(totals.expenseTotals).sort(
                  (a, b) => (totals.expenseTotals[b] || 0) - (totals.expenseTotals[a] || 0)
                )[0] || '—'}
              </Text>
            </View>
          </View>

          {expenseChartData.length > 0 ? (
            <PieChart
              data={expenseChartData}
              width={containerWidth * 0.9}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: (opacity = 1) => `rgba(100,116,139,${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={{ marginVertical: 8 }}
            />
          ) : (
            <Text style={styles.empty}>No expense data</Text>
          )}

          {/* Expense List */}
          <View style={styles.list}>
            {Object.keys(totals.expenseTotals).map((cat) => (
              <View key={cat} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: categoryColors[cat] || categoryColors.Other },
                    ]}
                  />
                  <Text style={styles.catName}>{cat}</Text>
                </View>
                <Text style={styles.catAmount}>
                  {formatCurrency(totals.expenseTotals[cat])}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Income Page */}
        <View style={[styles.page, { width: containerWidth }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Earned</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.incomeTotal)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Top Source</Text>
              <Text style={styles.summaryValue}>
                {Object.keys(totals.incomeTotals).sort(
                  (a, b) => (totals.incomeTotals[b] || 0) - (totals.incomeTotals[a] || 0)
                )[0] || '—'}
              </Text>
            </View>
          </View>

          {incomeChartData.length > 0 ? (
            <PieChart
              data={incomeChartData}
              width={containerWidth * 0.9}
              height={180}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: (opacity = 1) => `rgba(100,116,139,${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={{ marginVertical: 8 }}
            />
          ) : (
            <Text style={styles.empty}>No income data</Text>
          )}

          {/* Income List */}
          <View style={styles.list}>
            {Object.keys(totals.incomeTotals).map((cat) => (
              <View key={cat} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: categoryColors[cat] || categoryColors.Other },
                    ]}
                  />
                  <Text style={styles.catName}>{cat}</Text>
                </View>
                <Text style={styles.catAmount}>
                  {formatCurrency(totals.incomeTotals[cat])}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        <View style={[styles.dotIndicator, page === 0 && styles.activeDot]} />
        <View style={[styles.dotIndicator, page === 1 && styles.activeDot]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1, paddingHorizontal: 2 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 2,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding:2,
    borderRadius: 8,
  },
  summaryLabel: { fontSize: 12, color: '#64748b' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#334155' },
  list: { marginTop: 12 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  catName: { fontSize: 14, color: '#334155' },
  catAmount: { fontSize: 14, fontWeight: '700', color: '#334155', textAlign: 'right' },
  empty: { fontSize: 14, color: '#94a3b8', marginTop: 12, textAlign: 'center' },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: colors.income },
});

export default SpendingAnalysis;
