import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { BudgetCategory } from '@/hooks/useBudgetData';

interface SmartBudgetAlertsProps {
  categories: BudgetCategory[];
  dailyBurnRate: number;
  remaining: number;
  daysUntilAllowance: number;
  totalSpent: number;
  totalBudget: number;
}

export function SmartBudgetAlerts({
  categories,
  dailyBurnRate,
  remaining,
  daysUntilAllowance,
  totalSpent,
  totalBudget,
}: SmartBudgetAlertsProps) {
  const alertedRef = useRef(false);

  useEffect(() => {
    if (alertedRef.current || categories.length === 0) return;
    alertedRef.current = true;

    // Delay alerts so UI renders first
    const timer = setTimeout(() => {
      // 1. Categories over 90%
      categories.forEach(cat => {
        const pct = cat.limit_amount > 0 ? (cat.spent / cat.limit_amount) * 100 : 0;
        if (pct >= 100) {
          toast.error(`🚨 ${cat.category} budget exceeded!`, {
            description: `You've spent ₹${cat.spent.toLocaleString('en-IN')} of ₹${cat.limit_amount.toLocaleString('en-IN')}`,
            duration: 6000,
          });
        } else if (pct >= 90) {
          toast.warning(`⚠️ ${cat.category} at ${Math.round(pct)}%`, {
            description: `Only ₹${(cat.limit_amount - cat.spent).toLocaleString('en-IN')} remaining`,
            duration: 5000,
          });
        }
      });

      // 2. Overall budget check
      const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      if (overallPct >= 95) {
        toast.error('💰 Overall budget almost exhausted!', {
          description: `Only ₹${remaining.toLocaleString('en-IN')} left for ${daysUntilAllowance} days`,
          duration: 7000,
        });
      }

      // 3. Low daily burn rate warning
      if (dailyBurnRate > 0 && dailyBurnRate < 100 && daysUntilAllowance > 3) {
        toast.warning('🔴 Daily budget critically low', {
          description: `You can only spend ₹${Math.round(dailyBurnRate)}/day. Consider cooking at home!`,
          duration: 6000,
        });
      }

      // 4. Positive reinforcement
      if (overallPct < 50 && daysUntilAllowance < 15 && totalSpent > 0) {
        toast.success('🎉 Great job! You\'re under 50% spending', {
          description: `₹${remaining.toLocaleString('en-IN')} remaining — keep it up!`,
          duration: 5000,
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [categories, dailyBurnRate, remaining, daysUntilAllowance, totalSpent, totalBudget]);

  return null; // This is a behavior-only component
}
