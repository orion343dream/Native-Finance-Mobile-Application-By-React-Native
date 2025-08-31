
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
  date: string;
  createdAt?: any; // Firestore Timestamp
  userId?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
}
