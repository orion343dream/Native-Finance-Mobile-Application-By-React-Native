
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTransactions } from '../transactions/TransactionsContext';

const screenWidth = Dimensions.get("window").width;

const AnalysisScreen = () => {
  const { transactions } = useTransactions();

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ name: t.category, amount: t.amount, color: `#${Math.floor(Math.random()*16777215).toString(16)}`, legendFontColor: "#7F7F7F", legendFontSize: 15 });
      }
      return acc;
    }, [] as { name: string; amount: number; color: string, legendFontColor: string, legendFontSize: number }[]);

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Analysis</Text>
      <PieChart
        data={expenseByCategory}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor={"amount"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default AnalysisScreen;
