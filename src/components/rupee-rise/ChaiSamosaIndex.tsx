import { Coffee, AlertCircle, TrendingUp } from 'lucide-react';
import { ChaiSamosaData } from '@/types/rupee-rise';
import { formatRupee, getStreetFoodPrice } from '@/lib/inr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ChaiSamosaIndexProps {
  data: ChaiSamosaData[];
  totalSpend: number;
  totalMeals: number;
  city?: string;
}

export function ChaiSamosaIndex({ data, totalSpend, totalMeals, city = 'Delhi' }: ChaiSamosaIndexProps) {
  const mealCost = getStreetFoodPrice(city);
  const maxMeals = Math.max(...data.map(d => d.mealsEquivalent), 1);

  return (
    <Card className="animate-fade-in overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-warning/10 to-accent/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <span className="text-2xl">🍵</span>
          </div>
          <div>
            <CardTitle className="font-display text-lg">Chai-Samosa Index</CardTitle>
            <p className="text-xs text-muted-foreground">Your subscription waste meter</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Main Stat */}
        <div className="text-center p-4 rounded-xl bg-secondary/50">
          <p className="text-sm text-muted-foreground mb-1">You've "Eaten"</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-display font-bold text-warning">{totalMeals}</span>
            <span className="text-3xl">🥘</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Street food meals worth of subscriptions
          </p>
          <p className="text-xs text-muted-foreground">
            ({formatRupee(totalSpend)} at {formatRupee(mealCost)}/meal in {city})
          </p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Breakdown by Category
          </p>
          {data.map((item) => (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span className="text-muted-foreground">{item.category}</span>
                </span>
                <span className="font-medium text-foreground">
                  {item.mealsEquivalent} meals
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(item.mealsEquivalent / maxMeals) * 100} 
                  className="h-2 flex-1"
                />
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {formatRupee(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Fun Fact */}
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 flex items-start gap-2">
          <Coffee className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Fun Fact:</span> {totalMeals} chai-samosa combos could have fed you for {Math.ceil(totalMeals / 3)} days! 
              That's about {Math.ceil(totalMeals / 90)} months of evening snacks! 🤯
            </p>
          </div>
        </div>

        {totalMeals > 30 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-destructive">Reality Check:</span> Your subscription spending is higher than most students. Consider auditing your monthly subscriptions!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
