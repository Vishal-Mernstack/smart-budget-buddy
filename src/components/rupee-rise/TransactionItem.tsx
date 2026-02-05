import { Transaction } from '@/types/rupee-rise';
import { cn } from '@/lib/utils';
import { formatRupee, formatShortIndianDate } from '@/lib/inr';
import { ArrowDownLeft, ArrowUpRight, Smartphone } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isExpense = transaction.transaction_type === 'expense';
  
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{transaction.category}</span>
            {transaction.upi_handle && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  {transaction.upi_handle}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-semibold font-display",
          isExpense ? "text-foreground" : "text-success"
        )}>
          {isExpense ? '-' : '+'}{formatRupee(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatShortIndianDate(transaction.transaction_date)}
        </p>
      </div>
    </div>
  );
}
