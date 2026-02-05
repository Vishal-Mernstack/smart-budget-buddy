import { BudgetCategory } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  category: BudgetCategory;
}

export function BudgetProgress({ category }: BudgetProgressProps) {
  const percentage = Math.min((category.spent / category.limit) * 100, 100);
  const isOverBudget = category.spent > category.limit;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  return (
    <div className="p-4 rounded-xl bg-card border border-border shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="font-medium text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              ${category.spent.toFixed(2)} of ${category.limit.toFixed(2)}
            </p>
          </div>
        </div>
        <span className={cn(
          "text-sm font-semibold px-2.5 py-1 rounded-full",
          isOverBudget && "bg-destructive/10 text-destructive",
          isNearLimit && "bg-warning/10 text-warning",
          !isOverBudget && !isNearLimit && "bg-success/10 text-success"
        )}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      
      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 animate-progress",
            isOverBudget && "bg-destructive",
            isNearLimit && "bg-warning",
            !isOverBudget && !isNearLimit && "bg-primary"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {isOverBudget && (
        <p className="text-xs text-destructive mt-2 font-medium">
          ⚠️ Over budget by ${(category.spent - category.limit).toFixed(2)}
        </p>
      )}
    </div>
  );
}
