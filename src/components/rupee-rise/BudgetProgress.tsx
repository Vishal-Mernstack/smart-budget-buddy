import { BudgetCategory } from '@/types/rupee-rise';
import { formatRupee } from '@/lib/inr';
import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  category: BudgetCategory;
}

export function BudgetProgress({ category }: BudgetProgressProps) {
  const percentage = Math.min((category.spent / category.limit) * 100, 100);
  const isOverBudget = category.spent > category.limit;
  const remaining = category.limit - category.spent;

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-soft hover:shadow-card transition-all duration-200 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <span className="font-medium text-foreground">{category.name}</span>
        </div>
        <span className={cn(
          "text-sm font-display font-semibold",
          isOverBudget ? "text-destructive" : "text-muted-foreground"
        )}>
          {isOverBudget ? 'Over Budget!' : `${formatRupee(remaining)} left`}
        </span>
      </div>
      
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 animate-progress",
            isOverBudget ? "bg-destructive" : ""
          )}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: isOverBudget ? undefined : category.color
          }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatRupee(category.spent)} spent</span>
        <span>of {formatRupee(category.limit)}</span>
      </div>
    </div>
  );
}
