import { Transaction } from '@/types/budget';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isExpense = transaction.type === 'expense';
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:shadow-soft transition-all duration-200 animate-slide-in">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isExpense ? "bg-destructive/10" : "bg-success/10"
        )}>
          {isExpense ? (
            <ArrowUpRight className="w-5 h-5 text-destructive" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 text-success" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">{transaction.category}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-semibold font-display",
          isExpense ? "text-foreground" : "text-success"
        )}>
          {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
