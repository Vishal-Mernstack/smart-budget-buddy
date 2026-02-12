import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RecurringTransaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  transaction_type: string;
  frequency: string;
  day_of_month: number;
  is_active: boolean;
  next_run_date: string;
  last_run_date: string | null;
}

interface RecurringTransactionsProps {
  categories: { id: string; category: string; icon: string }[];
  onTransactionAdded: (transaction: any) => Promise<any>;
}

export function RecurringTransactions({ categories, onTransactionAdded }: RecurringTransactionsProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');

  useEffect(() => {
    if (!user) return;
    fetchRecurring();
  }, [user]);

  const fetchRecurring = async () => {
    const { data } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setItems((data as RecurringTransaction[]) || []);
  };

  const createRecurring = async () => {
    if (!amount || !category || !description || !user) return;
    const nextRun = new Date();
    const day = parseInt(dayOfMonth);
    nextRun.setDate(day);
    if (nextRun <= new Date()) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    const { error } = await supabase.from('recurring_transactions').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      category,
      description,
      day_of_month: day,
      next_run_date: nextRun.toISOString().split('T')[0],
    });
    if (error) { toast.error('Failed to create recurring expense'); return; }
    toast.success('Recurring expense added! 🔄');
    setAmount(''); setCategory(''); setDescription(''); setDayOfMonth('1'); setOpen(false);
    fetchRecurring();
  };

  const toggleActive = async (item: RecurringTransaction) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    if (error) { toast.error('Failed to update'); return; }
    fetchRecurring();
  };

  const deleteRecurring = async (id: string) => {
    await supabase.from('recurring_transactions').delete().eq('id', id);
    toast.success('Recurring expense removed');
    fetchRecurring();
  };

  const runDueTransactions = async () => {
    const today = new Date().toISOString().split('T')[0];
    const dueItems = items.filter(i => i.is_active && i.next_run_date <= today);

    if (dueItems.length === 0) {
      toast.info('No recurring transactions due today');
      return;
    }

    for (const item of dueItems) {
      await onTransactionAdded({
        amount: item.amount,
        category: item.category,
        description: `🔄 ${item.description}`,
        transaction_type: item.transaction_type,
        transaction_date: new Date().toISOString(),
      });

      const nextRun = new Date(item.next_run_date);
      nextRun.setMonth(nextRun.getMonth() + 1);

      await supabase.from('recurring_transactions').update({
        last_run_date: today,
        next_run_date: nextRun.toISOString().split('T')[0],
      }).eq('id', item.id);
    }

    toast.success(`${dueItems.length} recurring transaction(s) processed! ✅`);
    fetchRecurring();
  };

  const getCategoryIcon = (cat: string) => {
    return categories.find(c => c.category === cat)?.icon || '📋';
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-soft animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Recurring Expenses</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runDueTransactions} className="gap-1 text-xs">
            <RefreshCw className="w-3 h-3" /> Process
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Description (e.g., Netflix)" value={description} onChange={e => setDescription(e.target.value)} />
                <Input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.category}>{c.icon} {c.category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <label className="text-sm text-muted-foreground">Day of month</label>
                  <Input type="number" min="1" max="28" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} />
                </div>
                <Button onClick={createRecurring} className="w-full">Add Recurring Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No recurring expenses. Add rent, subscriptions, etc.</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${item.is_active ? 'bg-secondary/30 border-border' : 'bg-muted/20 border-muted opacity-60'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{getCategoryIcon(item.category)}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{item.amount.toLocaleString('en-IN')} • Day {item.day_of_month}
                    {item.is_active && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        Next: {new Date(item.next_run_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(item)}>
                  {item.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteRecurring(item.id)}>
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
