import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as React from 'react';
import { Text, TouchableOpacity, View, Platform, StyleSheet, Dimensions } from 'react-native';
import { BarChart as GiftedBarChart, barDataItem } from 'react-native-gifted-charts';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { colors, spacing, typography } from '@/src/theme';
import { SymbolView } from 'expo-symbols';

enum Period {
  week = 'week',
  month = 'month',
  year = 'year',
}

type PeriodType = keyof typeof Period;

const { width } = Dimensions.get('window');

function getStartOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDayLabel(date: Date) {
  // return MM-DD
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

export default function SummaryChart() {
  const { transactions } = useTransactions();
  const [chartPeriod, setChartPeriod] = React.useState<Period>(Period.week);
  const [barData, setBarData] = React.useState<barDataItem[]>([]);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [currentEndDate, setCurrentEndDate] = React.useState<Date>(new Date());
  const [visibleStartDate, setVisibleStartDate] = React.useState<Date | null>(null);
  const [visibleEndDate, setVisibleEndDate] = React.useState<Date | null>(null);
  const [chartKey, setChartKey] = React.useState(0);
  const [transactionType, setTransactionType] = React.useState<'Income' | 'Expense'>('Income');

  React.useEffect(() => {
    const fetch = async () => {
      if (chartPeriod === Period.week) {
        const start = getStartOfWeek(currentDate);
        // include a few days before the week to reduce leading empty space
        const extraBefore = 3; // days
        const days: barDataItem[] = [];
        for (let i = -extraBefore; i < 7; i++) {
          const day = new Date(start);
          day.setDate(start.getDate() + i);
          const ds = day.toISOString().split('T')[0];
          const total = transactions.filter(
            t => t.date === ds && ((transactionType === 'Income' && t.type === 'income') || (transactionType === 'Expense' && t.type === 'expense'))
          ).reduce((s, t) => s + t.amount, 0);
          days.push({ value: total, label: formatDayLabel(day) });
        }
        setBarData(days);
        // visible start/end correspond to the actual bars
        const visStart = new Date(start);
        visStart.setDate(start.getDate() - 3);
        const visEnd = new Date(start);
        visEnd.setDate(start.getDate() + 6);
        setVisibleStartDate(visStart);
        setVisibleEndDate(visEnd);
        setCurrentEndDate(new Date(start.getTime() + 6 * 24 * 3600 * 1000));
        setChartKey(k => k + 1);
      } else {
        setBarData([]);
        setVisibleStartDate(null);
        setVisibleEndDate(null);
      }
    };
    fetch();
  }, [transactions, chartPeriod, currentDate, transactionType]);

  const handlePrevious = () => {
    if (chartPeriod === Period.week) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(new Date(d));
    }
  };

  const handleNext = () => {
    if (chartPeriod === Period.week) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(new Date(d));
    }
  };

  const total = barData.reduce((s, it) => s + (it.value || 0), 0);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '700', fontSize: 18 }}>
          {currentEndDate.toLocaleDateString('en-US', { month: 'short' })} {currentEndDate.getDate()} - {currentDate.toLocaleDateString('en-US', { month: 'short' })} {currentDate.getDate()}
        </Text>
        <Text style={{ color: 'gray' }}>Total {transactionType === 'Expense' ? 'Spending' : 'Income'}</Text>
      </View>

      <Text style={{ fontWeight: '700', fontSize: 28, marginBottom: 12 }}>{total.toFixed(2)}</Text>

      <GiftedBarChart
        key={chartKey}
        data={barData}
        barWidth={14}
        height={200}
        // compute width based on number of bars to reduce trailing empty space
        width={Math.min(Math.max(barData.length * 34, width - 80), 420)}
        minHeight={3}
        barBorderRadius={3}
        showGradient
        spacing={10}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelsVerticalShift={2}
        xAxisLabelTextStyle={{ color: 'gray' }}
        yAxisTextStyle={{ color: 'gray' }}
        isAnimated
        animationDuration={300}
        frontColor={transactionType === 'Expense' ? '#dc2626' : '#16a34a'}
        gradientColor={transactionType === 'Expense' ? '#fb923c' : '#4ade80'}
      />

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={handlePrevious} style={styles.controlBtn}>
          <SymbolView name="chevron.left.circle.fill" size={36} type="hierarchical" tintColor={'gray'} />
          <Text style={{ fontSize: 11, color: 'gray' }}>Prev</Text>
        </TouchableOpacity>

        <SegmentedControl
          values={["Income", "Expense"]}
          style={{ width: 200 }}
          selectedIndex={transactionType === 'Income' ? 0 : 1}
          onChange={(event: { nativeEvent: { selectedSegmentIndex: number } }) => {
            const idx = event.nativeEvent.selectedSegmentIndex;
            setTransactionType(idx === 0 ? 'Income' : 'Expense');
          }}
        />

        <TouchableOpacity onPress={handleNext} style={styles.controlBtn}>
          <SymbolView name="chevron.right.circle.fill" size={36} type="hierarchical" tintColor={'gray'} />
          <Text style={{ fontSize: 11, color: 'gray' }}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  controlBtn: { alignItems: 'center' },
});
