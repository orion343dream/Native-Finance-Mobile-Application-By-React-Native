import { TouchableOpacity, View } from 'react-native';
import TransactionListItem from './TransactionListItem';

type Category = { id?: string | number; name?: string };

// transaction shape in this project uses id as string and date as 'YYYY-MM-DD' or unix timestamp
type ProjectTransaction = {
  id: string | number;
  amount: number;
  date: string | number;
  description: string;
  type: 'income' | 'expense' | 'Income' | 'Expense';
  category_id?: string | number;
};

export default function TransactionList({
  transactions,
  categories,
  deleteTransaction,
  onEdit,
}: {
  categories: Category[];
  transactions: ProjectTransaction[];
  deleteTransaction: (id: string | number) => Promise<void>;
  onEdit?: (id: string | number) => void;
}) {
  return (
    <View style={{ gap: 15 }}>
      {transactions.map((transaction) => {
        const categoryForCurrentItem = categories.find(
          (category) => String(category.id) === String(transaction.category_id)
        );
        return (
          <TouchableOpacity
            key={String(transaction.id)}
            activeOpacity={0.7}
            onLongPress={() => deleteTransaction(transaction.id)}
            onPress={() => onEdit && onEdit(transaction.id)}
          >
            <TransactionListItem
              transaction={transaction as any}
              categoryInfo={categoryForCurrentItem}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
