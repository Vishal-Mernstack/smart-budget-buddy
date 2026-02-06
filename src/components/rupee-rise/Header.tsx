import { Link } from 'react-router-dom';
import { TrendingUp, Bell, BarChart3 } from 'lucide-react';
import { isFestiveSeason } from '@/lib/inr';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Header() {
  const festiveInfo = isFestiveSeason();
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-card">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">RupeeRise AI</h1>
            {festiveInfo.isFestive && (
              <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                🎉 {festiveInfo.festival} Mode
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/analytics">
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
        </Link>
        <button className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">3</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-primary-foreground">
          🎓
        </div>
      </div>
    </header>
  );
}
