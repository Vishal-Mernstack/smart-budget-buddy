import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { formatRupee, formatLakhsCrores } from '@/lib/inr';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  useLakhsCrores?: boolean;
  suffix?: string;
}

export function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  useLakhsCrores = false,
  suffix
}: SummaryCardProps) {
  const formattedValue = useLakhsCrores ? formatLakhsCrores(value) : formatRupee(value);

  return (
    <div className={cn(
      "rounded-xl p-5 transition-all duration-300 hover:shadow-card animate-fade-in",
      variant === 'primary' && "gradient-primary text-primary-foreground",
      variant === 'success' && "bg-success/10 border border-success/20",
      variant === 'warning' && "bg-warning/10 border border-warning/20",
      variant === 'destructive' && "bg-destructive/10 border border-destructive/20",
      variant === 'default' && "bg-card border border-border shadow-soft"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl font-display font-bold mt-1 animate-number",
            variant === 'primary' && "text-primary-foreground",
            variant === 'success' && "text-success",
            variant === 'warning' && "text-warning",
            variant === 'destructive' && "text-destructive",
            variant === 'default' && "text-foreground"
          )}>
            {formattedValue}
            {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={cn(
          "p-2.5 rounded-lg",
          variant === 'primary' && "bg-primary-foreground/20",
          variant === 'success' && "bg-success/20",
          variant === 'warning' && "bg-warning/20",
          variant === 'destructive' && "bg-destructive/20",
          variant === 'default' && "bg-secondary"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            variant === 'primary' && "text-primary-foreground",
            variant === 'success' && "text-success",
            variant === 'warning' && "text-warning",
            variant === 'destructive' && "text-destructive",
            variant === 'default' && "text-muted-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}
