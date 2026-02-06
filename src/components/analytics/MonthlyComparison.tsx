import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatRupee } from '@/lib/inr';
import { ArrowUpRight, ArrowDownLeft, Minus } from 'lucide-react';

interface MonthlyData {
  month: string;
  monthKey: string;
  spending: number;
  income: number;
}

interface CategoryData {
  name: string;
  value: number;
  limit: number;
  icon: string;
}

interface MonthlyComparisonProps {
  data: MonthlyData[];
  categories: CategoryData[];
}

export function MonthlyComparison({ data, categories }: MonthlyComparisonProps) {
  const [selectedMonth1, setSelectedMonth1] = useState(data[data.length - 2]?.monthKey || '');
  const [selectedMonth2, setSelectedMonth2] = useState(data[data.length - 1]?.monthKey || '');

  const month1Data = data.find(d => d.monthKey === selectedMonth1);
  const month2Data = data.find(d => d.monthKey === selectedMonth2);

  const comparisonData = [
    {
      name: 'Spending',
      month1: month1Data?.spending || 0,
      month2: month2Data?.spending || 0,
    },
    {
      name: 'Income',
      month1: month1Data?.income || 0,
      month2: month2Data?.income || 0,
    },
    {
      name: 'Savings',
      month1: (month1Data?.income || 0) - (month1Data?.spending || 0),
      month2: (month2Data?.income || 0) - (month2Data?.spending || 0),
    },
  ];

  const spendingDiff = (month2Data?.spending || 0) - (month1Data?.spending || 0);
  const incomeDiff = (month2Data?.income || 0) - (month1Data?.income || 0);
  const savingsDiff = 
    ((month2Data?.income || 0) - (month2Data?.spending || 0)) - 
    ((month1Data?.income || 0) - (month1Data?.spending || 0));

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
    if (Math.abs(value) >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const DiffIndicator = ({ value }: { value: number }) => {
    if (value === 0) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-destructive" />;
    return <ArrowDownLeft className="w-4 h-4 text-success" />;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-display text-lg">Month-over-Month Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare your spending between two months
        </p>
        
        {/* Month Selectors */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Compare</label>
            <Select value={selectedMonth1} onValueChange={setSelectedMonth1}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {data.map(d => (
                  <SelectItem key={d.monthKey} value={d.monthKey}>
                    {d.month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-muted-foreground mt-5">vs</span>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">With</label>
            <Select value={selectedMonth2} onValueChange={setSelectedMonth2}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {data.map(d => (
                  <SelectItem key={d.monthKey} value={d.monthKey}>
                    {d.month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="month1" 
                name={month1Data?.month || 'Month 1'}
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar 
                dataKey="month2" 
                name={month2Data?.month || 'Month 2'}
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DiffIndicator value={spendingDiff} />
              <span className="text-xs text-muted-foreground">Spending</span>
            </div>
            <p className={`text-sm font-semibold ${spendingDiff > 0 ? 'text-destructive' : spendingDiff < 0 ? 'text-success' : 'text-muted-foreground'}`}>
              {spendingDiff >= 0 ? '+' : ''}{formatRupee(spendingDiff)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DiffIndicator value={-incomeDiff} />
              <span className="text-xs text-muted-foreground">Income</span>
            </div>
            <p className={`text-sm font-semibold ${incomeDiff > 0 ? 'text-success' : incomeDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {incomeDiff >= 0 ? '+' : ''}{formatRupee(incomeDiff)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DiffIndicator value={-savingsDiff} />
              <span className="text-xs text-muted-foreground">Savings</span>
            </div>
            <p className={`text-sm font-semibold ${savingsDiff > 0 ? 'text-success' : savingsDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {savingsDiff >= 0 ? '+' : ''}{formatRupee(savingsDiff)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
