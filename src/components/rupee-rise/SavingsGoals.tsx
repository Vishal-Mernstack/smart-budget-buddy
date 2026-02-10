import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, PartyPopper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  icon: string;
  completed_at: string | null;
}

const GOAL_ICONS = ['🎯', '📱', '✈️', '🏠', '🎓', '💻', '🚗', '💍', '🎸', '🏋️'];
const MILESTONES = [25, 50, 75, 100];

export function SavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [addAmount, setAddAmount] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setGoals((data as SavingsGoal[]) || []);
  };

  const createGoal = async () => {
    if (!title || !target || !user) return;
    const { error } = await supabase.from('savings_goals').insert({
      user_id: user.id,
      title,
      target_amount: parseFloat(target),
      icon,
    });
    if (error) { toast.error('Failed to create goal'); return; }
    toast.success('Goal created! 🎯');
    setTitle(''); setTarget(''); setIcon('🎯'); setOpen(false);
    fetchGoals();
  };

  const addToGoal = async (goal: SavingsGoal) => {
    const amount = parseFloat(addAmount[goal.id] || '0');
    if (amount <= 0) return;

    const newAmount = goal.current_amount + amount;
    const progress = (newAmount / goal.target_amount) * 100;
    const oldProgress = (goal.current_amount / goal.target_amount) * 100;

    const updates: Record<string, unknown> = { current_amount: newAmount };
    if (newAmount >= goal.target_amount && !goal.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase.from('savings_goals').update(updates).eq('id', goal.id);
    if (error) { toast.error('Failed to update goal'); return; }

    // Check milestones
    for (const m of MILESTONES) {
      if (oldProgress < m && progress >= m) {
        if (m === 100) {
          toast.success(`🎉🎊 GOAL COMPLETED: "${goal.title}"! You're amazing!`, { duration: 5000 });
        } else {
          toast.success(`🏆 ${m}% milestone reached for "${goal.title}"!`);
        }
      }
    }

    setAddAmount(prev => ({ ...prev, [goal.id]: '' }));
    fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    await supabase.from('savings_goals').delete().eq('id', id);
    toast.success('Goal removed');
    fetchGoals();
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-soft animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Savings Goals</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Goal name (e.g., New Laptop)" value={title} onChange={e => setTitle(e.target.value)} />
              <Input type="number" placeholder="Target amount (₹)" value={target} onChange={e => setTarget(e.target.value)} />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Pick an icon</p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(i => (
                    <button key={i} onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${icon === i ? 'bg-primary/20 ring-2 ring-primary' : 'bg-secondary hover:bg-secondary/80'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={createGoal} className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No savings goals yet. Set your first target!</p>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
            const isComplete = !!goal.completed_at;
            return (
              <div key={goal.id} className={`p-4 rounded-lg border transition-all ${isComplete ? 'bg-success/10 border-success/30' : 'bg-secondary/30 border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{goal.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-foreground flex items-center gap-1">
                        {goal.title}
                        {isComplete && <PartyPopper className="w-4 h-4 text-success" />}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{goal.current_amount.toLocaleString('en-IN')} / ₹{goal.target_amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-success' : 'gradient-primary'}`}
                    style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {MILESTONES.map(m => (
                    <div key={m} className={`flex-1 h-1 rounded-full ${progress >= m ? 'bg-primary/60' : 'bg-secondary'}`} />
                  ))}
                </div>
                {!isComplete && (
                  <div className="flex gap-2 mt-3">
                    <Input type="number" placeholder="₹ Add amount" className="h-8 text-sm"
                      value={addAmount[goal.id] || ''} onChange={e => setAddAmount(prev => ({ ...prev, [goal.id]: e.target.value }))} />
                    <Button size="sm" className="h-8" onClick={() => addToGoal(goal)}>Save</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
