import { spacing } from '@/src/theme';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart as GiftedBarChart, barDataItem } from 'react-native-gifted-charts';

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
  const [visibleStartDate, setVisibleStartDate] = React.useState<Date>(new Date());
  const [visibleEndDate, setVisibleEndDate] = React.useState<Date>(new Date());
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
  // visible range includes extraBefore days before start and the week end
  const visStart = new Date(start.getTime() - extraBefore * 24 * 3600 * 1000);
  const visEnd = new Date(start.getTime() + 6 * 24 * 3600 * 1000);
  setVisibleStartDate(visStart);
  setVisibleEndDate(visEnd);
  setCurrentEndDate(visEnd);
        setChartKey(k => k + 1);
      } else {
        setBarData([]);
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

  // compute chart width to allow expansion to the right based on number of bars
  const perBarSpace = 18 + 12; // barWidth + spacing
  const computedWidth = Math.max(width - 16, barData.length * perBarSpace + 80);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '700', fontSize: 18 }}>
          {visibleStartDate.toLocaleDateString('en-US', { month: 'short' })} {visibleStartDate.getDate()} - {visibleEndDate.toLocaleDateString('en-US', { month: 'short' })} {visibleEndDate.getDate()}
        </Text>
        <Text style={{ color: 'gray' }}>Total {transactionType === 'Expense' ? 'Spending' : 'Income'}</Text>
      </View>

      <Text style={{ fontWeight: '700', fontSize: 28, marginBottom: 12 }}>{total.toFixed(2)}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
        <GiftedBarChart
          key={chartKey}
          data={barData}
          barWidth={18}
          height={200}
          width={computedWidth}
          minHeight={3}
          barBorderRadius={3}
          showGradient
          spacing={12}
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
      </ScrollView>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={handlePrevious} style={styles.controlBtn}>
          <Ionicons name="chevron-back-circle" size={36} color="gray" />
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
          <Ionicons name="chevron-forward-circle" size={36} color="gray" />
          <Text style={{ fontSize: 11, color: 'gray' }}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0, paddingVertical: spacing.sm },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  controlBtn: { alignItems: 'center' },
});
