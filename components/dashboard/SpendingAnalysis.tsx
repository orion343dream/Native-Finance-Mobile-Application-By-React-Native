
import { useTransactions } from '@/src/transactions/TransactionsContext';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Pre-defined colors for categories for a better look
const categoryColors: Record<string, string> = {
    Food: '#f59e0b', // amber-500
    Transport: '#3b82f6', // blue-500
    Shopping: '#8b5cf6', // violet-500
    Bills: '#ef4444', // red-500
    Entertainment: '#14b8a6', // teal-500
    Salary: '#10b981', // emerald-500 (though usually not in expenses)
    Other: '#64748b', // slate-500
};

export default function SpendingAnalysis() {
  const { transactions } = useTransactions();

  const { pieChartData, categoryTotals } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = expenseTransactions.reduce(
      (acc: Record<string, number>, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {}
    );

    const pieChartData = Object.keys(categoryTotals).map(category => ({
      name: category,
      population: categoryTotals[category],
      color: categoryColors[category] || categoryColors.Other,
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    }));

    return { pieChartData, categoryTotals };
  }, [transactions]);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Spending Analysis</Text>

      {pieChartData.length > 0 ? (
        <PieChart
          data={pieChartData}
          width={width - 32}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
            propsForLabels: { // Added to prevent error on web if labels are too long
                fontSize: 10, 
            },
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 10]}
          absolute
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      ) : (
        <Text style={styles.emptyText}>No expense data available.</Text>
      )}

      <View style={styles.categorySummary}>
        {Object.keys(categoryTotals).map(category => (
          <View key={category} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
                <View style={[styles.colorSquare, { backgroundColor: categoryColors[category] || categoryColors.Other }]} />
                <Text style={styles.categoryText}>{category}</Text>
            </View>
            <Text style={styles.categoryAmount}>LKR {categoryTotals[category].toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
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
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 10,
  },
  categorySummary: {
    marginTop: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 15,
    color: '#475569',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
});
