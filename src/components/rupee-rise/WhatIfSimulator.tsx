import { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, Lightbulb } from 'lucide-react';
import { BudgetSummary } from '@/types/rupee-rise';
import { formatRupee, getStreetFoodPrice } from '@/lib/inr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WhatIfItem {
  id: string;
  name: string;
  cost: number;
  quantity: number;
}

interface WhatIfSimulatorProps {
  summary: BudgetSummary;
  city?: string;
}

const PRESET_ITEMS = [
  { name: 'Starbucks Latte', cost: 350 },
  { name: 'Zomato Order', cost: 250 },
  { name: 'Movie Ticket', cost: 300 },
  { name: 'Uber Ride', cost: 150 },
  { name: 'Weekend Hangout', cost: 500 },
];

export function WhatIfSimulator({ summary, city = 'Delhi' }: WhatIfSimulatorProps) {
  const [items, setItems] = useState<WhatIfItem[]>([
    { id: '1', name: 'Starbucks Latte', cost: 350, quantity: 3 },
  ]);
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState('');

  const pgRentDaily = 8000 / 30; // Assuming ₹8000 monthly rent
  const streetFoodCost = getStreetFoodPrice(city);

  const totalSavings = useMemo(() => {
    return items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  }, [items]);

  const extraDays = useMemo(() => {
    if (summary.dailyBurnRate <= 0) return 0;
    return Math.floor(totalSavings / summary.dailyBurnRate);
  }, [totalSavings, summary.dailyBurnRate]);

  const extraPGDays = useMemo(() => {
    return Math.floor(totalSavings / pgRentDaily);
  }, [totalSavings, pgRentDaily]);

  const extraMeals = useMemo(() => {
    return Math.floor(totalSavings / streetFoodCost);
  }, [totalSavings, streetFoodCost]);

  const addItem = (name: string, cost: number) => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      name,
      cost,
      quantity: 1,
    }]);
  };

  const addCustomItem = () => {
    if (customName && customCost) {
      addItem(customName, parseFloat(customCost));
      setCustomName('');
      setCustomCost('');
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ));
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <CardTitle className="font-display text-lg">What-If Simulator</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          See how skipping purchases extends your budget
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Add Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESET_ITEMS.map(preset => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => addItem(preset.name, preset.cost)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              {preset.name} ({formatRupee(preset.cost)})
            </Button>
          ))}
        </div>

        {/* Custom Item Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="custom-name" className="sr-only">Item Name</Label>
            <Input
              id="custom-name"
              placeholder="Item name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="w-24">
            <Label htmlFor="custom-cost" className="sr-only">Cost (₹)</Label>
            <Input
              id="custom-cost"
              type="number"
              placeholder="₹ Cost"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
              className="text-sm"
            />
          </div>
          <Button onClick={addCustomItem} size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatRupee(item.cost)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {totalSavings > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-primary/10 border border-success/20">
            <div className="flex items-start gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-success flex-shrink-0" />
              <p className="text-sm font-medium text-foreground">
                By skipping these items, you could save {formatRupee(totalSavings)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-lg font-display font-bold text-success">+{extraDays}</p>
                <p className="text-xs text-muted-foreground">Extra Days</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-lg font-display font-bold text-primary">+{extraPGDays}</p>
                <p className="text-xs text-muted-foreground">PG Rent Days</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-lg font-display font-bold text-warning">{extraMeals} 🍛</p>
                <p className="text-xs text-muted-foreground">Street Meals</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
