export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: 'expense' | 'income';
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  limit: number;
  spent: number;
  color: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  remaining: number;
}
