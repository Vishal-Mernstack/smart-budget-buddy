import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, TrendingUp, Lightbulb, Target, Flame } from 'lucide-react';
import { formatRupee } from '@/lib/inr';
import { BudgetSummary } from '@/types/rupee-rise';

interface MonthlyData {
  month: string;
  spending: number;
  income: number;
}

interface CategoryData {
  name: string;
  value: number;
  limit: number;
  percentage: number;
  icon: string;
}

interface SpendingInsightsProps {
  monthlyData: MonthlyData[];
  categories: CategoryData[];
  summary: BudgetSummary;
}

export function SpendingInsights({ monthlyData, categories, summary }: SpendingInsightsProps) {
  // Calculate insights
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  
  const monthlyChange = previousMonth?.spending 
    ? ((currentMonth.spending - previousMonth.spending) / previousMonth.spending) * 100 
    : 0;

  const overBudgetCategories = categories.filter(c => c.percentage > 100);
  const nearLimitCategories = categories.filter(c => c.percentage > 80 && c.percentage <= 100);
  const highestSpendCategory = [...categories].sort((a, b) => b.value - a.value)[0];
  const avgMonthlySpend = monthlyData.reduce((sum, d) => sum + d.spending, 0) / monthlyData.length;

  const insights = [];

  // Over budget warning
  if (overBudgetCategories.length > 0) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Budget Exceeded',
      message: `${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? 'category has' : 'categories have'} exceeded the limit: ${overBudgetCategories.map(c => c.name).join(', ')}`,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    });
  }

  // Near limit warning
  if (nearLimitCategories.length > 0) {
    insights.push({
      type: 'caution',
      icon: Target,
      title: 'Approaching Limit',
      message: `${nearLimitCategories.length} ${nearLimitCategories.length === 1 ? 'category is' : 'categories are'} above 80%: ${nearLimitCategories.map(c => `${c.icon} ${c.name}`).join(', ')}`,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    });
  }

  // Monthly trend insight
  if (monthlyChange > 20) {
    insights.push({
      type: 'trend',
      icon: TrendingUp,
      title: 'Spending Increased',
      message: `Your spending this month is ${Math.round(monthlyChange)}% higher than last month. Consider reviewing your expenses.`,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    });
  } else if (monthlyChange < -10) {
    insights.push({
      type: 'trend',
      icon: TrendingDown,
      title: 'Great Savings!',
      message: `You've reduced spending by ${Math.abs(Math.round(monthlyChange))}% compared to last month. Keep it up! 🎉`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    });
  }

  // Daily burn rate insight
  if (summary.dailyBurnRate > 0) {
    const safeRate = summary.remaining / Math.max(1, summary.daysUntilAllowance);
    insights.push({
      type: 'tip',
      icon: Flame,
      title: 'Daily Burn Rate',
      message: `You can safely spend ${formatRupee(safeRate)} per day until your next allowance. ${summary.daysUntilAllowance} days remaining.`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    });
  }

  // Top category insight
  if (highestSpendCategory) {
    insights.push({
      type: 'insight',
      icon: Lightbulb,
      title: 'Top Spending',
      message: `${highestSpendCategory.icon} ${highestSpendCategory.name} is your biggest expense at ${formatRupee(highestSpendCategory.value)} (${highestSpendCategory.percentage}% of limit).`,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    });
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Smart Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered analysis of your spending patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No insights available yet. Add more transactions to get personalized insights!</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${insight.bgColor} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <insight.icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`font-medium ${insight.color}`}>{insight.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Avg. Monthly</p>
              <p className="text-lg font-display font-bold text-foreground">
                {formatRupee(avgMonthlySpend)}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Categories Tracked</p>
              <p className="text-lg font-display font-bold text-foreground">
                {categories.length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
