import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BudgetCategory } from '@/types/rupee-rise';
import { formatRupee } from '@/lib/inr';

interface SpendingChartProps {
  categories: BudgetCategory[];
}

export function SpendingChart({ categories }: SpendingChartProps) {
  const data = categories.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color,
    icon: cat.icon,
  }));

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-soft animate-fade-in">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">Spending Breakdown</h3>
      
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [formatRupee(value), 'Spent']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-display font-bold text-foreground">{formatRupee(totalSpent)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground truncate">{item.icon} {item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
