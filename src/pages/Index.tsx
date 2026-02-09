import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Header } from '@/components/rupee-rise/Header';
import { SummaryCard } from '@/components/rupee-rise/SummaryCard';
import { BudgetProgress } from '@/components/rupee-rise/BudgetProgress';
import { TransactionItem } from '@/components/rupee-rise/TransactionItem';
import { SpendingChart } from '@/components/rupee-rise/SpendingChart';
import { AddExpenseDialog } from '@/components/rupee-rise/AddExpenseDialog';
import { DailyBurnRate } from '@/components/rupee-rise/DailyBurnRate';
import { WhatIfSimulator } from '@/components/rupee-rise/WhatIfSimulator';
import { ChaiSamosaIndex } from '@/components/rupee-rise/ChaiSamosaIndex';
import { UPIPayment } from '@/components/rupee-rise/UPIPayment';
import { SpendingStreaks } from '@/components/rupee-rise/SpendingStreaks';
import { BillSplitCalculator } from '@/components/rupee-rise/BillSplitCalculator';
import { ExpenseHeatmap } from '@/components/rupee-rise/ExpenseHeatmap';
import { SmartBudgetAlerts } from '@/components/rupee-rise/SmartBudgetAlerts';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    categories, 
    transactions, 
    summary, 
    profile,
    chaiSamosaData,
    totalSubscriptionSpend,
    totalMealsWasted,
    addTransaction,
    deleteTransaction,
    loading: dataLoading,
  } = useBudgetData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleAddTransaction = async (transaction: any) => {
    return await addTransaction({
      ...transaction,
      transaction_date: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <SmartBudgetAlerts
        categories={categories}
        dailyBurnRate={summary.dailyBurnRate}
        remaining={summary.remaining}
        daysUntilAllowance={summary.daysUntilAllowance}
        totalSpent={summary.totalSpent}
        totalBudget={summary.totalBudget}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Header userName={profile?.display_name || user.email?.split('@')[0]} />
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Monthly Budget"
            value={summary.totalBudget}
            icon={Wallet}
            variant="primary"
          />
          <SummaryCard
            title="Total Spent"
            value={summary.totalSpent}
            icon={TrendingUp}
            variant="warning"
          />
          <SummaryCard
            title="Income"
            value={summary.totalIncome}
            icon={TrendingDown}
            variant="success"
          />
          <SummaryCard
            title="Remaining"
            value={summary.remaining}
            icon={PiggyBank}
            variant={summary.remaining < 2000 ? 'destructive' : 'default'}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Daily Burn Rate & Budget Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Burn Rate Dashboard */}
            <DailyBurnRate summary={summary} />
            
            {/* Budget Categories */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Budget Categories</h2>
              <div className="flex gap-2">
                <UPIPayment 
                  categories={categories.map(c => ({ id: c.id, category: c.category, icon: c.icon }))} 
                  onPaymentComplete={handleAddTransaction}
                />
                <AddExpenseDialog 
                  categories={categories.map(c => ({ id: c.id, name: c.category, icon: c.icon, limit: c.limit_amount, spent: c.spent, color: c.color }))} 
                  onAddTransaction={handleAddTransaction} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div key={category.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <BudgetProgress category={{
                    id: category.id,
                    name: category.category,
                    icon: category.icon,
                    limit: category.limit_amount,
                    spent: category.spent,
                    color: category.color,
                  }} />
                </div>
              ))}
            </div>

            {/* What-If Simulator */}
            <WhatIfSimulator summary={summary} city={profile?.city || 'Delhi'} />

            {/* Bill Split Calculator */}
            <BillSplitCalculator />

            {/* Transactions */}
            <div className="mt-4">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet. Add your first expense!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 6).map((transaction, index) => (
                    <div key={transaction.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <TransactionItem 
                        transaction={{
                          id: transaction.id,
                          user_id: transaction.user_id,
                          amount: Number(transaction.amount),
                          category: transaction.category,
                          description: transaction.description,
                          upi_handle: transaction.upi_handle,
                          transaction_type: transaction.transaction_type as 'expense' | 'income',
                          transaction_date: new Date(transaction.transaction_date),
                          created_at: new Date(transaction.created_at),
                        }} 
                        onDelete={() => deleteTransaction(transaction.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chart & Chai-Samosa Index */}
          <div className="space-y-6">
            {/* Spending Streaks & Gamification */}
            <SpendingStreaks
              transactions={transactions}
              dailyBudget={summary.dailyBurnRate > 0 ? summary.dailyBurnRate : 500}
            />

            {/* Expense Heatmap Calendar */}
            <ExpenseHeatmap
              transactions={transactions}
              dailyBudget={summary.dailyBurnRate > 0 ? summary.dailyBurnRate : 500}
            />

            <SpendingChart categories={categories.map(c => ({
              id: c.id,
              name: c.category,
              icon: c.icon,
              limit: c.limit_amount,
              spent: c.spent,
              color: c.color,
            }))} />
            
            {/* Chai-Samosa Index */}
            <ChaiSamosaIndex 
              data={chaiSamosaData}
              totalSpend={totalSubscriptionSpend}
              totalMeals={totalMealsWasted}
              city={profile?.city || 'Delhi'}
            />
            
            {/* Savings Goal */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="font-display font-semibold text-foreground">Savings Goal</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">New iPhone Fund</p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full gradient-primary rounded-full animate-progress" 
                  style={{ width: `${Math.min(100, (summary.remaining / 50000) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">₹{summary.remaining.toLocaleString('en-IN')} / ₹50,000</p>
            </div>

            {/* Smart Tip */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-soft animate-fade-in">
              <h3 className="font-display font-semibold text-foreground mb-3">💡 Smart Tip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary.totalSpent > summary.totalBudget * 0.8
                  ? "⚠️ You've used over 80% of your budget! Try cooking at home to save money."
                  : summary.dailyBurnRate < 200
                    ? "🔴 Your daily budget is very low. Consider cutting subscriptions."
                    : "👍 You're doing great! Keep tracking your expenses to stay on target."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
