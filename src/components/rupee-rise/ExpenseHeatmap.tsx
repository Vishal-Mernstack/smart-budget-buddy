import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupee } from '@/lib/inr';

interface Transaction {
  transaction_date: string;
  transaction_type: string;
  amount: number;
}

interface ExpenseHeatmapProps {
  transactions: Transaction[];
  dailyBudget: number;
}

function getIntensity(spent: number, budget: number): string {
  if (spent === 0) return 'bg-secondary/50';
  const ratio = spent / budget;
  if (ratio <= 0.5) return 'bg-success/30';
  if (ratio <= 0.8) return 'bg-success/60';
  if (ratio <= 1.0) return 'bg-warning/60';
  if (ratio <= 1.5) return 'bg-destructive/50';
  return 'bg-destructive/80';
}

export function ExpenseHeatmap({ transactions, dailyBudget }: ExpenseHeatmapProps) {
  const { days, monthLabel, weekDays, stats } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

    // Build spending map
    const dailySpending = new Map<number, number>();
    transactions
      .filter(t => {
        const d = new Date(t.transaction_date);
        return d.getMonth() === month && d.getFullYear() === year && t.transaction_type === 'expense';
      })
      .forEach(t => {
        const day = new Date(t.transaction_date).getDate();
        dailySpending.set(day, (dailySpending.get(day) || 0) + Number(t.amount));
      });

    const daysList = [];
    // Add empty slots for alignment
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysList.push({ day: 0, spent: 0, empty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      daysList.push({ day: d, spent: dailySpending.get(d) || 0, empty: false });
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Stats
    const spentDays = Array.from(dailySpending.values());
    const overBudgetDays = spentDays.filter(s => s > dailyBudget).length;
    const zeroDays = daysInMonth - dailySpending.size;
    const highestDay = spentDays.length > 0 ? Math.max(...spentDays) : 0;

    return {
      days: daysList,
      monthLabel: `${monthNames[month]} ${year}`,
      weekDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      stats: { overBudgetDays, zeroDays, highestDay },
    };
  }, [transactions, dailyBudget]);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-warning" />
            <CardTitle className="font-display text-lg">Expense Heatmap</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{monthLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
          {days.map((day, i) => (
            day.empty ? (
              <div key={`empty-${i}`} />
            ) : (
              <Tooltip key={day.day}>
                <TooltipTrigger asChild>
                  <div
                    className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium cursor-default transition-colors ${getIntensity(day.spent, dailyBudget)} ${
                      day.day === new Date().getDate() ? 'ring-2 ring-primary ring-offset-1' : ''
                    }`}
                  >
                    {day.day}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{day.day} {monthLabel.split(' ')[0]}</p>
                  <p>{day.spent > 0 ? `Spent: ${formatRupee(day.spent)}` : 'No spending'}</p>
                </TooltipContent>
              </Tooltip>
            )
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <span>Low</span>
          <div className="w-3 h-3 rounded-sm bg-success/30" />
          <div className="w-3 h-3 rounded-sm bg-success/60" />
          <div className="w-3 h-3 rounded-sm bg-warning/60" />
          <div className="w-3 h-3 rounded-sm bg-destructive/50" />
          <div className="w-3 h-3 rounded-sm bg-destructive/80" />
          <span>High</span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-destructive/10">
            <p className="text-sm font-bold text-destructive">{stats.overBudgetDays}</p>
            <p className="text-[10px] text-muted-foreground">Over Budget</p>
          </div>
          <div className="p-2 rounded-lg bg-success/10">
            <p className="text-sm font-bold text-success">{stats.zeroDays}</p>
            <p className="text-[10px] text-muted-foreground">₹0 Days</p>
          </div>
          <div className="p-2 rounded-lg bg-warning/10">
            <p className="text-sm font-bold text-warning">{formatRupee(stats.highestDay)}</p>
            <p className="text-[10px] text-muted-foreground">Peak Day</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
