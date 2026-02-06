import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatRupee } from '@/lib/inr';

interface CategoryData {
  name: string;
  value: number;
  limit: number;
  color: string;
  icon: string;
  percentage: number;
}

interface CategoryBarChartProps {
  data: CategoryData[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground flex items-center gap-2">
            <span>{item.icon}</span>
            {item.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Spent: {formatRupee(item.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Limit: {formatRupee(item.limit)}
          </p>
          <p className={`text-sm font-medium ${item.percentage > 100 ? 'text-destructive' : 'text-success'}`}>
            {item.percentage}% used
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-display text-lg">Top Spending Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 0, right: 20, left: 80, bottom: 0 }}
            >
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={formatYAxis}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={75}
                tickFormatter={(value) => {
                  const item = data.find(d => d.name === value);
                  return item ? `${item.icon} ${value.split(' ')[0]}` : value;
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="mt-4 space-y-2 pt-4 border-t border-border">
          {data.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {formatRupee(item.value)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.percentage > 100 
                    ? 'bg-destructive/10 text-destructive' 
                    : item.percentage > 80 
                    ? 'bg-warning/10 text-warning' 
                    : 'bg-success/10 text-success'
                }`}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
