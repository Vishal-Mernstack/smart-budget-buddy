export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  upi_handle?: string | null;
  transaction_type: 'expense' | 'income';
  transaction_date: Date;
  created_at: Date;
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
  dailyBurnRate: number;
  daysUntilAllowance: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  city: string;
  next_allowance_date: Date | null;
  monthly_allowance: number;
}

export interface StudentPerk {
  id: string;
  perk_name: string;
  discount_percentage: number | null;
  amount_saved: number;
  times_used: number;
}

export interface WhatIfScenario {
  id: string;
  itemName: string;
  itemCost: number;
  quantity: number;
  savedAmount: number;
  extraDays: number;
}

export interface ChaiSamosaData {
  category: string;
  amount: number;
  mealsEquivalent: number;
  icon: string;
}

// SMS Parser types for future implementation
export interface ParsedSMS {
  amount: number;
  merchant: string;
  upiHandle?: string;
  transactionType: 'debit' | 'credit';
  date: Date;
  bankName?: string;
}
