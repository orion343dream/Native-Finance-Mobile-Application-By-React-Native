
import { colors, gradients, radius, spacing, typography } from '@/src/theme';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Pre-defined colors for categories for a better look
const categoryColors = {
    Food: '#f59e0b', // amber-500
    Transport: '#3b82f6', // blue-500
    Shopping: '#8b5cf6', // violet-500
    Bills: '#ef4444', // red-500
    Entertainment: '#14b8a6', // teal-500
    Salary: '#10b981', // emerald-500 (though usually not in expenses)
    Other: '#64748b', // slate-500
};

const AnalysisScreen = () => {
  const { transactions, loading } = useTransactions();
  const [filterDays, setFilterDays] = useState(30); // 7, 30, all

  const filteredTransactions = useMemo(() => {
    if (filterDays === 'all') return transactions;
    const dateToCompare = new Date();
    dateToCompare.setDate(dateToCompare.getDate() - filterDays);
    return transactions.filter(t => new Date(t.date) >= dateToCompare);
  }, [transactions, filterDays]);

  // Calculate data for the pie chart and the summary list
  const analysisData = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const categoryTotals = expenseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const pieChartData = Object.keys(categoryTotals).map(category => ({
      name: category,
      population: categoryTotals[category],
      color: categoryColors[category] || categoryColors.Other,
      legendFontColor: '#7F7F7F', // Color for the legend text
      legendFontSize: 14,
    }));

    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return { pieChartData, categoryTotals, totalExpense };
  }, [filteredTransactions]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={gradients.screen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <Text style={styles.title}>Financial Analysis</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilterDays(7)} style={[styles.filterButton, filterDays === 7 && styles.activeFilter]}>
          <Text style={[styles.filterText, filterDays === 7 && styles.activeFilterText]}>Last 7 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilterDays(30)} style={[styles.filterButton, filterDays === 30 && styles.activeFilter]}>
          <Text style={[styles.filterText, filterDays === 30 && styles.activeFilterText]}>Last 30 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilterDays('all')} style={[styles.filterButton, filterDays === 'all' && styles.activeFilter]}>
          <Text style={[styles.filterText, filterDays === 'all' && styles.activeFilterText]}>All Time</Text>
        </TouchableOpacity>
      </View>

      {analysisData.pieChartData.length > 0 ? (
        <View style={styles.card}>
          <PieChart
            data={analysisData.pieChartData}
            width={width - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 10]}
            hasLegend={true}
            absolute
          />
        </View>
      ) : (
        <Text style={styles.emptyText}>No expense data available for this period.</Text>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Expense Breakdown</Text>
        {Object.keys(analysisData.categoryTotals).map(category => (
          <View key={category} style={styles.summaryItem}>
            <View style={styles.categoryInfo}>
                <View style={[styles.colorSquare, { backgroundColor: categoryColors[category] || categoryColors.Other }]} />
                <Text style={styles.categoryText}>{category}</Text>
            </View>
                         <Text style={styles.categoryAmount}>LKR {analysisData.categoryTotals[category].toFixed(2)}</Text>
          </View>
        ))}
      </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.sm },
  title: { ...typography.title, textAlign: 'left', padding: spacing.sm },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1e293b', marginHorizontal: 4, borderWidth: 1, borderColor: colors.border },
  activeFilter: { backgroundColor: colors.income },
  filterText: { color: colors.textSecondary, fontWeight: '600' },
  activeFilterText: { color: 'white' },
  card: { backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.lg, marginHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  summaryContainer: { marginTop: 16, paddingHorizontal: spacing.md },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  colorSquare: { width: 12, height: 12, marginRight: 8, borderRadius: 2 },
  categoryText: { fontSize: 16, color: colors.textSecondary },
  categoryAmount: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  emptyText: { textAlign: 'center', marginTop: 20, color: colors.textSecondary },
});

export default AnalysisScreen;
