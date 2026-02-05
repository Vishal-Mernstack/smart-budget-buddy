import { useState } from 'react';
import { Transaction, BudgetCategory, BudgetSummary } from '@/types/budget';

const initialCategories: BudgetCategory[] = [
  { id: '1', name: 'Food & Dining', icon: '🍕', limit: 300, spent: 187.50, color: 'hsl(var(--chart-1))' },
  { id: '2', name: 'Transportation', icon: '🚌', limit: 100, spent: 65.00, color: 'hsl(var(--chart-2))' },
  { id: '3', name: 'Entertainment', icon: '🎮', limit: 150, spent: 89.99, color: 'hsl(var(--chart-3))' },
  { id: '4', name: 'Books & Supplies', icon: '📚', limit: 200, spent: 125.00, color: 'hsl(var(--chart-4))' },
  { id: '5', name: 'Subscriptions', icon: '📱', limit: 50, spent: 42.97, color: 'hsl(var(--chart-5))' },
];

const initialTransactions: Transaction[] = [
  { id: '1', amount: 12.50, category: 'Food & Dining', description: 'Campus coffee', date: new Date(2025, 1, 5), type: 'expense' },
  { id: '2', amount: 45.00, category: 'Books & Supplies', description: 'Textbook rental', date: new Date(2025, 1, 4), type: 'expense' },
  { id: '3', amount: 15.99, category: 'Entertainment', description: 'Spotify Premium', date: new Date(2025, 1, 3), type: 'expense' },
  { id: '4', amount: 500.00, category: 'Income', description: 'Part-time job', date: new Date(2025, 1, 1), type: 'income' },
  { id: '5', amount: 8.50, category: 'Transportation', description: 'Bus pass top-up', date: new Date(2025, 1, 2), type: 'expense' },
  { id: '6', amount: 25.00, category: 'Food & Dining', description: 'Grocery run', date: new Date(2025, 1, 4), type: 'expense' },
];

export function useBudget() {
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    if (transaction.type === 'expense') {
      setCategories(prev => 
        prev.map(cat => 
          cat.name === transaction.category 
            ? { ...cat, spent: cat.spent + transaction.amount }
            : cat
        )
      );
    }
  };

  const summary: BudgetSummary = {
    totalBudget: categories.reduce((sum, cat) => sum + cat.limit, 0),
    totalSpent: categories.reduce((sum, cat) => sum + cat.spent, 0),
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    remaining: categories.reduce((sum, cat) => sum + (cat.limit - cat.spent), 0),
  };

  return {
    categories,
    transactions,
    summary,
    addTransaction,
  };
}
