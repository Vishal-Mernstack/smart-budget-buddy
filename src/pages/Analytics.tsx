import { useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useBudgetData } from '@/hooks/useBudgetData';
import { formatRupee, formatLakhsCrores } from '@/lib/inr';
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart';
import { MonthlyTrendChart } from '@/components/analytics/MonthlyTrendChart';
import { CategoryBarChart } from '@/components/analytics/CategoryBarChart';
import { SpendingInsights } from '@/components/analytics/SpendingInsights';
import { MonthlyComparison } from '@/components/analytics/MonthlyComparison';

export default function Analytics() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { categories, transactions, summary, profile, loading: dataLoading } = useBudgetData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Calculate monthly spending data
  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthsData: { month: string; monthKey: string; spending: number; income: number }[] = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getFullYear() === date.getFullYear() && tDate.getMonth() === date.getMonth();
      });
      
      const spending = monthTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const income = monthTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      monthsData.push({ month: monthName, monthKey, spending, income });
    }
    
    return monthsData;
  }, [transactions]);

  // Category-wise spending for current month
  const categoryData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.category,
      value: cat.spent,
      limit: cat.limit_amount,
      color: cat.color,
      icon: cat.icon,
      percentage: cat.limit_amount > 0 ? Math.round((cat.spent / cat.limit_amount) * 100) : 0,
    }));
  }, [categories]);

  // Top spending categories
  const topCategories = useMemo(() => {
    return [...categoryData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [categoryData]);

  // Calculate month-over-month change
  const monthlyChange = useMemo(() => {
    if (monthlyData.length < 2) return 0;
    const current = monthlyData[monthlyData.length - 1].spending;
    const previous = monthlyData[monthlyData.length - 2].spending;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [monthlyData]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Spending Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your spending patterns over time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{profile?.city || 'Delhi'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {formatLakhsCrores(summary.totalSpent)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {monthlyChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-destructive" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-success" />
                )}
                <span className={`text-xs ${monthlyChange >= 0 ? 'text-destructive' : 'text-success'}`}>
                  {monthlyChange >= 0 ? '+' : ''}{monthlyChange}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of {formatLakhsCrores(summary.totalBudget)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {formatRupee(summary.dailyBurnRate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                per day this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {categories.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                active budgets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <MonthlyTrendChart data={monthlyData} />
            <SpendingInsights 
              monthlyData={monthlyData} 
              categories={categoryData} 
              summary={summary}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CategoryPieChart data={categoryData} />
              <CategoryBarChart data={topCategories} />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <MonthlyComparison data={monthlyData} categories={categoryData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
