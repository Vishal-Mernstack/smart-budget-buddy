import { useState } from 'react';
import { Users, Plus, Trash2, Send, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupee } from '@/lib/inr';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Friend {
  id: string;
  name: string;
  paid: boolean;
}

export function BillSplitCalculator() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: '', paid: false },
  ]);
  const [newFriendName, setNewFriendName] = useState('');
  const [splits, setSplits] = useState<{ name: string; share: number; upiLink: string }[] | null>(null);

  const addFriend = () => {
    if (newFriendName.trim()) {
      setFriends(prev => [...prev, { id: Date.now().toString(), name: newFriendName.trim(), paid: false }]);
      setNewFriendName('');
    }
  };

  const removeFriend = (id: string) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  const updateFriendName = (id: string, name: string) => {
    setFriends(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  };

  const calculateSplit = async () => {
    const amount = parseFloat(totalAmount);
    if (!amount || friends.filter(f => f.name.trim()).length === 0) {
      toast.error('Enter amount and at least one friend');
      return;
    }

    const validFriends = friends.filter(f => f.name.trim());
    const totalPeople = validFriends.length + 1; // +1 for the user
    const perPerson = Math.ceil(amount / totalPeople);

    const splitResults = validFriends.map(f => ({
      name: f.name,
      share: perPerson,
      upiLink: `upi://pay?pa=&pn=${encodeURIComponent(f.name)}&am=${perPerson}&cu=INR&tn=${encodeURIComponent(title || 'Bill Split')}`,
    }));

    setSplits(splitResults);

    // Save to database
    if (user) {
      try {
        await supabase.from('bill_splits').insert({
          user_id: user.id,
          title: title || 'Untitled Split',
          total_amount: amount,
          split_with: validFriends.map(f => ({ name: f.name, share: perPerson, paid: false })),
        });
        toast.success('Split saved! 🎉');
      } catch (err) {
        console.error('Error saving split:', err);
      }
    }
  };

  const shareViaWhatsApp = (name: string, share: number) => {
    const msg = `Hey ${name}! Your share for "${title || 'our bill'}" is ${formatRupee(share)}. Please pay via UPI 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          <CardTitle className="font-display text-lg">Bill Splitter</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Split bills with friends & send UPI reminders</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!splits ? (
          <>
            {/* Bill Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="split-title" className="text-xs">What's this for?</Label>
                <Input
                  id="split-title"
                  placeholder="e.g., Domino's Pizza Night"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="split-amount" className="text-xs">Total Amount (₹)</Label>
                <Input
                  id="split-amount"
                  type="number"
                  placeholder="1200"
                  value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Friends List */}
            <div>
              <Label className="text-xs">Friends to split with</Label>
              <div className="space-y-2 mt-2">
                {friends.map(friend => (
                  <div key={friend.id} className="flex gap-2">
                    <Input
                      placeholder="Friend's name"
                      value={friend.name}
                      onChange={e => updateFriendName(friend.id, e.target.value)}
                      className="text-sm flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={() => removeFriend(friend.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add friend"
                  value={newFriendName}
                  onChange={e => setNewFriendName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFriend()}
                  className="text-sm flex-1"
                />
                <Button onClick={addFriend} size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button onClick={calculateSplit} className="w-full gradient-primary text-primary-foreground">
              <IndianRupee className="w-4 h-4 mr-2" />
              Split It!
            </Button>
          </>
        ) : (
          <>
            {/* Split Results */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 mb-3">
              <p className="text-sm font-medium text-foreground mb-1">{title || 'Bill Split'}</p>
              <p className="text-xs text-muted-foreground">
                Total: {formatRupee(parseFloat(totalAmount))} ÷ {splits.length + 1} people
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
                <span className="text-sm">👤</span>
                <span className="text-sm font-medium text-foreground flex-1">You</span>
                <span className="text-sm font-bold text-success">{formatRupee(splits[0]?.share || 0)}</span>
              </div>
              {splits.map((split, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <span className="text-sm">👤</span>
                  <span className="text-sm font-medium text-foreground flex-1">{split.name}</span>
                  <span className="text-sm font-bold text-foreground">{formatRupee(split.share)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-success"
                    onClick={() => shareViaWhatsApp(split.name, split.share)}
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => { setSplits(null); setTitle(''); setTotalAmount(''); setFriends([{ id: '1', name: '', paid: false }]); }} className="w-full">
              New Split
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
