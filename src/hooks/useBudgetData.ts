import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { calculateDailyBurnRate, getDaysUntilAllowance, calculateChaiSamosaIndex, getStreetFoodPrice } from '@/lib/inr';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  upi_handle?: string | null;
  merchant_name?: string | null;
  payment_method?: string | null;
  transaction_type: string;
  transaction_date: string;
  created_at: string;
}

export interface BudgetCategory {
  id: string;
  user_id: string;
  category: string;
  icon: string;
  limit_amount: number;
  color: string;
  spent: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  city: string | null;
  next_allowance_date: string | null;
  monthly_allowance: number | null;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  remaining: number;
  dailyBurnRate: number;
  daysUntilAllowance: number;
}

export interface ChaiSamosaData {
  category: string;
  amount: number;
  mealsEquivalent: number;
  icon: string;
}

const DEFAULT_BUDGETS = [
  { category: 'Food & Dining', icon: '🍛', limit_amount: 5000, color: 'hsl(var(--chart-1))' },
  { category: 'Transport', icon: '🚌', limit_amount: 2000, color: 'hsl(var(--chart-2))' },
  { category: 'Entertainment', icon: '🎬', limit_amount: 2500, color: 'hsl(var(--chart-3))' },
  { category: 'Books & Supplies', icon: '📚', limit_amount: 3000, color: 'hsl(var(--chart-4))' },
  { category: 'Subscriptions', icon: '📱', limit_amount: 1500, color: 'hsl(var(--chart-5))' },
  { category: 'PG/Rent', icon: '🏠', limit_amount: 8000, color: 'hsl(var(--accent))' },
];

export function useBudgetData() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (budgetsError) throw budgetsError;

      // If no budgets exist, create default ones
      if (!budgetsData || budgetsData.length === 0) {
        const newBudgets = DEFAULT_BUDGETS.map(b => ({
          ...b,
          user_id: user.id,
        }));
        
        const { data: createdBudgets, error: createError } = await supabase
          .from('budgets')
          .insert(newBudgets)
          .select();

        if (createError) throw createError;
        setBudgets(createdBudgets?.map(b => ({ ...b, spent: 0 })) || []);
      } else {
        setBudgets(budgetsData.map(b => ({ ...b, spent: 0 })));
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate spent amounts per category
  const categoriesWithSpent = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             t.transaction_type === 'expense';
    });

    return budgets.map(budget => {
      const spent = monthlyTransactions
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { ...budget, spent };
    });
  }, [budgets, transactions]);

  // Add transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      toast.error('Please sign in to add transactions');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data, ...prev]);
      toast.success('Transaction added! 💸');
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      return null;
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Update budget limit
  const updateBudgetLimit = async (budgetId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ limit_amount: newLimit })
        .eq('id', budgetId);

      if (error) throw error;

      setBudgets(prev => prev.map(b => 
        b.id === budgetId ? { ...b, limit_amount: newLimit } : b
      ));
      toast.success('Budget updated!');
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Calculate summary
  const summary: BudgetSummary = useMemo(() => {
    const totalBudget = categoriesWithSpent.reduce((sum, cat) => sum + cat.limit_amount, 0);
    const totalSpent = categoriesWithSpent.reduce((sum, cat) => sum + cat.spent, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const totalIncome = transactions
      .filter(t => {
        const date = new Date(t.transaction_date);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               t.transaction_type === 'income';
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const remaining = totalBudget - totalSpent;
    const nextAllowanceDate = profile?.next_allowance_date ? new Date(profile.next_allowance_date) : null;
    const daysUntilAllowance = getDaysUntilAllowance(nextAllowanceDate);
    const dailyBurnRate = calculateDailyBurnRate(remaining, daysUntilAllowance);

    return {
      totalBudget,
      totalSpent,
      totalIncome,
      remaining,
      dailyBurnRate,
      daysUntilAllowance,
    };
  }, [categoriesWithSpent, transactions, profile]);

  // Chai-Samosa Index data
  const chaiSamosaData: ChaiSamosaData[] = useMemo(() => {
    const subscriptionCategories = ['Subscriptions', 'Entertainment'];
    const city = profile?.city || 'Delhi';
    
    return categoriesWithSpent
      .filter(cat => subscriptionCategories.includes(cat.category))
      .map(cat => ({
        category: cat.category,
        amount: cat.spent,
        mealsEquivalent: calculateChaiSamosaIndex(cat.spent, city),
        icon: cat.icon,
      }));
  }, [categoriesWithSpent, profile]);

  const totalSubscriptionSpend = chaiSamosaData.reduce((sum, d) => sum + d.amount, 0);
  const totalMealsWasted = chaiSamosaData.reduce((sum, d) => sum + d.mealsEquivalent, 0);

  return {
    transactions,
    categories: categoriesWithSpent,
    profile,
    summary,
    loading,
    chaiSamosaData,
    totalSubscriptionSpend,
    totalMealsWasted,
    addTransaction,
    deleteTransaction,
    updateBudgetLimit,
    updateProfile,
    refetch: fetchData,
  };
}
