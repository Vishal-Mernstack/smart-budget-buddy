import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, ComposedChart } from 'recharts';
import { formatRupee } from '@/lib/inr';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyData {
  month: string;
  monthKey: string;
  spending: number;
  income: number;
}

interface MonthlyBudgetComparisonProps {
  data: MonthlyData[];
  totalBudget: number;
}

export function MonthlyBudgetComparison({ data, totalBudget }: MonthlyBudgetComparisonProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      budget: totalBudget,
      savings: d.income - d.spending,
      overBudget: d.spending > totalBudget ? d.spending - totalBudget : 0,
    }));
  }, [data, totalBudget]);

  const avgSpending = data.reduce((s, d) => s + d.spending, 0) / Math.max(data.length, 1);
  const trend = data.length >= 2
    ? data[data.length - 1].spending - data[data.length - 2].spending
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatRupee(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-display text-lg">Budget vs Spending Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track how your spending compares to budget over the last {data.length} months
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={formatYAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="spending" name="Spending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="income" name="Income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line type="monotone" dataKey="budget" name="Budget Limit" stroke="hsl(var(--destructive))" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Avg Monthly Spend</p>
            <p className="text-sm font-semibold text-foreground">{formatRupee(avgSpending)}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Monthly Trend</p>
            <div className="flex items-center justify-center gap-1">
              {trend >= 0 ? <TrendingUp className="w-3 h-3 text-destructive" /> : <TrendingDown className="w-3 h-3 text-success" />}
              <p className={`text-sm font-semibold ${trend >= 0 ? 'text-destructive' : 'text-success'}`}>
                {trend >= 0 ? '+' : ''}{formatRupee(trend)}
              </p>
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Budget</p>
            <p className="text-sm font-semibold text-foreground">{formatRupee(totalBudget)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
