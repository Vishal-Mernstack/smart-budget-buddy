import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Smartphone, Loader2 } from 'lucide-react';
import { BudgetCategory } from '@/types/rupee-rise';

interface AddExpenseDialogProps {
  categories: BudgetCategory[];
  onAddTransaction: (transaction: {
    amount: number;
    category: string;
    description: string;
    upi_handle?: string | null;
    transaction_type: string;
    transaction_date: string;
  }) => Promise<any>;
}

export function AddExpenseDialog({ categories, onAddTransaction }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [upiHandle, setUpiHandle] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || (type === 'expense' && !category)) return;

    setLoading(true);
    try {
      const result = await onAddTransaction({
        amount: parseFloat(amount),
        category: type === 'expense' ? category : 'Income',
        description,
        upi_handle: upiHandle || null,
        transaction_date: new Date().toISOString(),
        transaction_type: type,
      });

      if (result) {
        setAmount('');
        setCategory('');
        setDescription('');
        setUpiHandle('');
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'default' : 'outline'}
              onClick={() => setType('expense')}
              className="flex-1"
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              onClick={() => setType('income')}
              className="flex-1"
            >
              Income
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 text-lg font-display"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was it for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {type === 'expense' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upi" className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  UPI Handle (Optional)
                </Label>
                <Input
                  id="upi"
                  placeholder="merchant@upi"
                  value={upiHandle}
                  onChange={(e) => setUpiHandle(e.target.value)}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
