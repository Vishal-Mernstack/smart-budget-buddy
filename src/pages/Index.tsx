import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useBudget } from '@/hooks/useBudget';
import { Header } from '@/components/budget/Header';
import { SummaryCard } from '@/components/budget/SummaryCard';
import { BudgetProgress } from '@/components/budget/BudgetProgress';
import { TransactionItem } from '@/components/budget/TransactionItem';
import { SpendingChart } from '@/components/budget/SpendingChart';
import { AddExpenseDialog } from '@/components/budget/AddExpenseDialog';

const Index = () => {
  const { categories, transactions, summary, addTransaction } = useBudget();

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Budget Progress */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Transactions */}
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={transaction.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <TransactionItem transaction={transaction} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Chart */}
          <div className="space-y-6">
            <SpendingChart categories={categories} />
            
            {/* Quick Tips Card */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-soft animate-fade-in">
              <h3 className="font-display font-semibold text-foreground mb-3">💡 Smart Tip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You're spending 63% of your budget on Food & Entertainment. Consider meal prepping to save up to $50/month!
              </p>
            </div>
            
            {/* Savings Goal */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎯</span>
                <h3 className="font-display font-semibold text-foreground">Savings Goal</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">New Laptop Fund</p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                <div className="h-full w-[35%] gradient-primary rounded-full animate-progress" />
              </div>
              <p className="text-xs text-muted-foreground">$350 / $1,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
