export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind text color class or hex code
  iconName: string; // Key to map to Lucide icon
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string; // Stores category ID
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  currency: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface AppData {
  projects: Project[];
  transactions: Transaction[];
  categories: Category[];
  lastSynced: string;
}