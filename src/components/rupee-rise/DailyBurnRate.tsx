import { Flame, Calendar, TrendingDown, AlertTriangle } from 'lucide-react';
import { BudgetSummary } from '@/types/rupee-rise';
import { formatRupee, isFestiveSeason } from '@/lib/inr';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface DailyBurnRateProps {
  summary: BudgetSummary;
}

export function DailyBurnRate({ summary }: DailyBurnRateProps) {
  const { dailyBurnRate, daysUntilAllowance, remaining, totalSpent, totalBudget } = summary;
  const spentPercent = (totalSpent / totalBudget) * 100;
  const festiveInfo = isFestiveSeason();
  
  // Calculate recommended daily spend with festive buffer
  const recommendedDaily = remaining / Math.max(daysUntilAllowance, 1);
  const adjustedRecommended = festiveInfo.isFestive 
    ? recommendedDaily * (1 - festiveInfo.bufferPercent / 100)
    : recommendedDaily;
  
  const isLowFunds = dailyBurnRate < 200;
  const isCritical = remaining < 1000;

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-soft animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className={cn("w-5 h-5", isCritical ? "text-destructive" : "text-warning")} />
          <h3 className="font-display font-semibold text-foreground">Daily Burn Rate</h3>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{daysUntilAllowance} days left</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-secondary/50">
          <p className="text-sm text-muted-foreground mb-1">You Can Spend</p>
          <p className={cn(
            "text-2xl font-display font-bold",
            isCritical ? "text-destructive" : isLowFunds ? "text-warning" : "text-success"
          )}>
            {formatRupee(Math.max(0, dailyBurnRate))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per day</p>
        </div>
        
        <div className="p-4 rounded-xl bg-secondary/50">
          <p className="text-sm text-muted-foreground mb-1">Remaining Budget</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatRupee(remaining)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">until {daysUntilAllowance} days</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget Used</span>
          <span className="font-medium text-foreground">{spentPercent.toFixed(0)}%</span>
        </div>
        <Progress value={spentPercent} className="h-3" />
      </div>

      {festiveInfo.isFestive && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">Festive Buffer Active</p>
            <p className="text-xs text-muted-foreground">
              {festiveInfo.festival} season! AI recommends saving {festiveInfo.bufferPercent}% extra. 
              Safe daily limit: <span className="font-medium text-foreground">{formatRupee(adjustedRecommended)}</span>
            </p>
          </div>
        </div>
      )}

      {isCritical && !festiveInfo.isFestive && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <TrendingDown className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Low Funds Alert!</p>
            <p className="text-xs text-muted-foreground">
              Consider cutting back on non-essentials to survive until your next allowance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
