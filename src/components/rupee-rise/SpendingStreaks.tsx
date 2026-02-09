import { useMemo } from 'react';
import { Flame, Trophy, Star, Zap, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatRupee } from '@/lib/inr';

interface Transaction {
  transaction_date: string;
  transaction_type: string;
  amount: number;
}

interface SpendingStreaksProps {
  transactions: Transaction[];
  dailyBudget: number;
}

interface Badge {
  name: string;
  icon: React.ReactNode;
  description: string;
  earned: boolean;
  color: string;
}

export function SpendingStreaks({ transactions, dailyBudget }: SpendingStreaksProps) {
  const { currentStreak, longestStreak, totalXP, level, levelProgress, badges } = useMemo(() => {
    // Group expenses by day
    const dailySpending = new Map<string, number>();
    const today = new Date();
    
    transactions
      .filter(t => t.transaction_type === 'expense')
      .forEach(t => {
        const dateStr = new Date(t.transaction_date).toISOString().split('T')[0];
        dailySpending.set(dateStr, (dailySpending.get(dateStr) || 0) + Number(t.amount));
      });

    // Calculate current streak (consecutive days under budget)
    let streak = 0;
    let longest = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const spent = dailySpending.get(dateStr) || 0;

      if (spent <= dailyBudget) {
        tempStreak++;
        if (i === streak) streak = tempStreak; // only extend current streak if consecutive from today
      } else {
        if (i <= streak) streak = tempStreak > 0 ? tempStreak - 1 : 0;
        longest = Math.max(longest, tempStreak);
        tempStreak = 0;
      }
    }
    longest = Math.max(longest, tempStreak);

    // XP: 10 per streak day, 50 bonus per 7-day milestone, 5 per transaction under budget
    const xp = streak * 10 + Math.floor(streak / 7) * 50 + transactions.length * 2;
    const lvl = Math.floor(xp / 100) + 1;
    const progress = (xp % 100);

    // Badges
    const earnedBadges: Badge[] = [
      {
        name: 'First Step',
        icon: <Star className="w-4 h-4" />,
        description: 'Added first transaction',
        earned: transactions.length > 0,
        color: 'text-warning',
      },
      {
        name: '3-Day Streak',
        icon: <Flame className="w-4 h-4" />,
        description: '3 days under budget',
        earned: longest >= 3,
        color: 'text-destructive',
      },
      {
        name: 'Week Warrior',
        icon: <Trophy className="w-4 h-4" />,
        description: '7-day streak achieved',
        earned: longest >= 7,
        color: 'text-primary',
      },
      {
        name: 'Budget Boss',
        icon: <Award className="w-4 h-4" />,
        description: '30-day streak master',
        earned: longest >= 30,
        color: 'text-success',
      },
    ];

    return {
      currentStreak: streak,
      longestStreak: longest,
      totalXP: xp,
      level: lvl,
      levelProgress: progress,
      badges: earnedBadges,
    };
  }, [transactions, dailyBudget]);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-destructive" />
            <CardTitle className="font-display text-lg">Spending Streaks</CardTitle>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary">Lvl {level}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Counter */}
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-gradient-to-br from-destructive/10 to-warning/10 border border-destructive/20 text-center">
            <p className="text-2xl font-display font-bold text-destructive">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center">
            <p className="text-2xl font-display font-bold text-primary">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak 🏆</p>
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">XP: {totalXP}</span>
            <span className="text-muted-foreground">Next: {(level) * 100} XP</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Stay under {formatRupee(dailyBudget)}/day to keep your streak!
          </p>
        </div>

        {/* Badges */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Badges</p>
          <div className="grid grid-cols-2 gap-2">
            {badges.map(badge => (
              <div
                key={badge.name}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  badge.earned
                    ? 'bg-card border-border'
                    : 'bg-muted/50 border-border/50 opacity-40'
                }`}
              >
                <span className={badge.earned ? badge.color : 'text-muted-foreground'}>
                  {badge.icon}
                </span>
                <div>
                  <p className="text-xs font-medium text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
