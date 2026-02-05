import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useRupeeRise } from '@/hooks/useRupeeRise';
import { Header } from '@/components/rupee-rise/Header';
import { SummaryCard } from '@/components/rupee-rise/SummaryCard';
import { BudgetProgress } from '@/components/rupee-rise/BudgetProgress';
import { TransactionItem } from '@/components/rupee-rise/TransactionItem';
import { SpendingChart } from '@/components/rupee-rise/SpendingChart';
import { AddExpenseDialog } from '@/components/rupee-rise/AddExpenseDialog';
import { DailyBurnRate } from '@/components/rupee-rise/DailyBurnRate';
import { WhatIfSimulator } from '@/components/rupee-rise/WhatIfSimulator';
import { ChaiSamosaIndex } from '@/components/rupee-rise/ChaiSamosaIndex';

const Index = () => {
  const { 
    categories, 
    transactions, 
    summary, 
    addTransaction,
    profile,
    chaiSamosaData,
    totalSubscriptionSpend,
    totalMealsWasted,
  } = useRupeeRise();

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Header />
        
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
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Budget Categories</h2>
              <AddExpenseDialog categories={categories} onAddTransaction={addTransaction} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div key={category.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <BudgetProgress category={category} />
                </div>
              ))}
            </div>

            {/* What-If Simulator */}
            <WhatIfSimulator summary={summary} city={profile.city} />

            {/* Transactions */}
            <div className="mt-4">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {transactions.slice(0, 6).map((transaction, index) => (
                  <div key={transaction.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <TransactionItem transaction={transaction} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Chart & Chai-Samosa Index */}
          <div className="space-y-6">
            <SpendingChart categories={categories} />
            
            {/* Chai-Samosa Index */}
            <ChaiSamosaIndex 
              data={chaiSamosaData}
              totalSpend={totalSubscriptionSpend}
              totalMeals={totalMealsWasted}
              city={profile.city}
            />
            
            {/* Savings Goal */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="font-display font-semibold text-foreground">Savings Goal</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">New iPhone Fund</p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                <div className="h-full w-[25%] gradient-primary rounded-full animate-progress" />
              </div>
              <p className="text-xs text-muted-foreground">₹12,500 / ₹50,000</p>
            </div>

            {/* Smart Tip */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-soft animate-fade-in">
              <h3 className="font-display font-semibold text-foreground mb-3">💡 Smart Tip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your Food & Entertainment spending is 40% of your budget. Try cooking at home 2 days a week - you could save ₹800/month!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
