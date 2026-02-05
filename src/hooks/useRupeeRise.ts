import { useState, useMemo } from 'react';
import { Transaction, BudgetCategory, BudgetSummary, UserProfile, ChaiSamosaData } from '@/types/rupee-rise';
import { calculateDailyBurnRate, getDaysUntilAllowance, isFestiveSeason, calculateChaiSamosaIndex, getStreetFoodPrice } from '@/lib/inr';

const initialCategories: BudgetCategory[] = [
  { id: '1', name: 'Food & Dining', icon: '🍛', limit: 5000, spent: 3250, color: 'hsl(var(--chart-1))' },
  { id: '2', name: 'Transport', icon: '🚌', limit: 2000, spent: 1450, color: 'hsl(var(--chart-2))' },
  { id: '3', name: 'Entertainment', icon: '🎬', limit: 2500, spent: 1890, color: 'hsl(var(--chart-3))' },
  { id: '4', name: 'Books & Supplies', icon: '📚', limit: 3000, spent: 2100, color: 'hsl(var(--chart-4))' },
  { id: '5', name: 'Subscriptions', icon: '📱', limit: 1500, spent: 1199, color: 'hsl(var(--chart-5))' },
  { id: '6', name: 'PG/Rent', icon: '🏠', limit: 8000, spent: 8000, color: 'hsl(var(--accent))' },
];

const initialTransactions: Transaction[] = [
  { id: '1', user_id: '', amount: 250, category: 'Food & Dining', description: 'Biryani at Paradise', upi_handle: 'paradise@upi', transaction_type: 'expense', transaction_date: new Date(2026, 1, 5), created_at: new Date() },
  { id: '2', user_id: '', amount: 899, category: 'Subscriptions', description: 'Netflix Monthly', upi_handle: 'netflix@upi', transaction_type: 'expense', transaction_date: new Date(2026, 1, 3), created_at: new Date() },
  { id: '3', user_id: '', amount: 450, category: 'Entertainment', description: 'PVR INOX - Movie', upi_handle: 'pvrcinemas@paytm', transaction_type: 'expense', transaction_date: new Date(2026, 1, 4), created_at: new Date() },
  { id: '4', user_id: '', amount: 15000, category: 'Income', description: 'Monthly Allowance', transaction_type: 'income', transaction_date: new Date(2026, 1, 1), created_at: new Date() },
  { id: '5', user_id: '', amount: 180, category: 'Transport', description: 'Metro Card Recharge', upi_handle: 'dmrc@upi', transaction_type: 'expense', transaction_date: new Date(2026, 1, 2), created_at: new Date() },
  { id: '6', user_id: '', amount: 120, category: 'Food & Dining', description: 'Swiggy - Maggi & Chai', upi_handle: 'swiggy@upi', transaction_type: 'expense', transaction_date: new Date(2026, 1, 4), created_at: new Date() },
  { id: '7', user_id: '', amount: 300, category: 'Subscriptions', description: 'Spotify Premium', upi_handle: 'spotify@paytm', transaction_type: 'expense', transaction_date: new Date(2026, 1, 1), created_at: new Date() },
  { id: '8', user_id: '', amount: 499, category: 'Entertainment', description: 'Amazon Prime Video', upi_handle: 'amazon@icici', transaction_type: 'expense', transaction_date: new Date(2026, 0, 15), created_at: new Date() },
];

const defaultProfile: UserProfile = {
  id: '1',
  user_id: '',
  display_name: 'Student',
  city: 'Delhi',
  next_allowance_date: new Date(2026, 2, 1), // 1st March 2026
  monthly_allowance: 15000,
};

export function useRupeeRise() {
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      user_id: profile.user_id,
      created_at: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    if (transaction.transaction_type === 'expense') {
      setCategories(prev => 
        prev.map(cat => 
          cat.name === transaction.category 
            ? { ...cat, spent: cat.spent + transaction.amount }
            : cat
        )
      );
    }
  };

  const daysUntilAllowance = getDaysUntilAllowance(profile.next_allowance_date);
  const festiveInfo = isFestiveSeason();

  const summary: BudgetSummary = useMemo(() => {
    const totalBudget = categories.reduce((sum, cat) => sum + cat.limit, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const remaining = totalBudget - totalSpent;
    const dailyBurnRate = calculateDailyBurnRate(remaining, daysUntilAllowance);

    return {
      totalBudget,
      totalSpent,
      totalIncome,
      remaining,
      dailyBurnRate,
      daysUntilAllowance,
    };
  }, [categories, transactions, daysUntilAllowance]);

  // Calculate Chai-Samosa Index data
  const chaiSamosaData: ChaiSamosaData[] = useMemo(() => {
    const subscriptionCategories = ['Subscriptions', 'Entertainment'];
    const mealCost = getStreetFoodPrice(profile.city);
    
    return categories
      .filter(cat => subscriptionCategories.includes(cat.name))
      .map(cat => ({
        category: cat.name,
        amount: cat.spent,
        mealsEquivalent: calculateChaiSamosaIndex(cat.spent, profile.city),
        icon: cat.icon,
      }));
  }, [categories, profile.city]);

  const totalSubscriptionSpend = chaiSamosaData.reduce((sum, d) => sum + d.amount, 0);
  const totalMealsWasted = chaiSamosaData.reduce((sum, d) => sum + d.mealsEquivalent, 0);

  return {
    categories,
    transactions,
    summary,
    profile,
    addTransaction,
    setProfile,
    festiveInfo,
    chaiSamosaData,
    totalSubscriptionSpend,
    totalMealsWasted,
  };
}
