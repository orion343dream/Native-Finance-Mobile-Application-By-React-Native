import { AntDesign } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';

// Local minimal Category shape used by the list
type Category = { id?: string | number; name?: string };

// fallback colors (also available in SpendingAnalysis) kept locally for the list
const categoryColors: Record<string, string> = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Bills: '#ef4444',
  Entertainment: '#14b8a6',
  Salary: '#10b981',
  Other: '#64748b',
  Default: '#64748b',
};

interface TransactionListItemProps {
  transaction: any; // project transactions vary; accept string|number ids and date formats
  categoryInfo: Category | undefined;
}

export default function TransactionListItem({
  transaction,
  categoryInfo,
}: TransactionListItemProps) {
  const isExpense = String(transaction.type).toLowerCase() === 'expense';
  const iconName = isExpense ? 'minuscircle' : 'pluscircle';
  const color = isExpense ? '#ef4444' : '#16a34a';
  const categoryColor = categoryColors[categoryInfo?.name ?? 'Default'];
  const emojiMap: Record<string, string> = {
    Default: '📦',
    Food: '🍔',
    Transport: '🚌',
    Shopping: '🛍️',
    Income: '💰',
  };
  const emoji = emojiMap[categoryInfo?.name ?? 'Default'] || '📦';
  return (
    <Card style={{ padding: 12 }}>
      <View style={styles.row}>
        <View style={{ width: '48%', gap: 6 }}>
          <Amount amount={Number(transaction.amount)} color={color} iconName={iconName} />
          <CategoryItem categoryColor={categoryColor} categoryInfo={categoryInfo} emoji={emoji} />
        </View>
  <TransactionInfo date={transaction.date} description={transaction.description} id={transaction.id} />
      </View>
    </Card>
  );
}

function TransactionInfo({
  id,
  date,
  description,
}: {
  id: string | number;
  date: string | number;
  description: string;
}) {
  // support unix timestamp (seconds) or 'YYYY-MM-DD' strings
  let dateLabel = '';
  if (typeof date === 'number') {
    // assume seconds
    dateLabel = new Date(date * 1000).toLocaleString();
  } else {
    // try parse ISO or keep as-is
    const parsed = Date.parse(date);
    if (!isNaN(parsed)) dateLabel = new Date(parsed).toLocaleString();
    else dateLabel = String(date);
  }

  return (
    <View style={{ flexGrow: 1, gap: 6, flexShrink: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{description}</Text>
      <Text>Transaction number {String(id)}</Text>
      <Text style={{ fontSize: 12, color: 'gray' }}>{dateLabel}</Text>
    </View>
  );
}

function CategoryItem({ categoryColor, categoryInfo, emoji }: { categoryColor: string; categoryInfo: Category | undefined; emoji: string }) {
  return (
    <View style={[styles.categoryContainer, { backgroundColor: categoryColor + '40' }]}>
      <Text style={styles.categoryText}>{emoji} {categoryInfo?.name}</Text>
    </View>
  );
}

function Amount({ iconName, color, amount }: { iconName: 'minuscircle' | 'pluscircle'; color: string; amount: number }) {
  const display = `LKR ${amount.toFixed(2)}`;
  return (
    <View style={styles.row}>
      <AntDesign name={iconName} size={18} color={color} />
      <Text numberOfLines={1} style={[styles.amount, { maxWidth: '80%' }]}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 29,
    fontWeight: '800',
    flexShrink: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryContainer: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
  },
});
