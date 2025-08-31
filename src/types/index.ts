
export interface Transaction {
    id: string;
    amount: number;
    category: string;
    description: string;
    type: 'expense' | 'income';
    date: string;
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
  }
  