import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBudgetData } from '@/hooks/useBudgetData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, MapPin, Calendar, Wallet, Save, Loader2 } from 'lucide-react';
import { formatRupee, STREET_FOOD_PRICES } from '@/lib/inr';
import { toast } from 'sonner';

const CITIES = Object.keys(STREET_FOOD_PRICES).filter(c => c !== 'Default');

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, categories, updateProfile, updateBudgetLimit, loading } = useBudgetData();
  
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('Delhi');
  const [monthlyAllowance, setMonthlyAllowance] = useState('15000');
  const [nextAllowanceDate, setNextAllowanceDate] = useState('');
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setCity(profile.city || 'Delhi');
      setMonthlyAllowance(profile.monthly_allowance?.toString() || '15000');
      setNextAllowanceDate(profile.next_allowance_date || '');
    }
  }, [profile]);

  useEffect(() => {
    if (categories.length > 0) {
      const limits: Record<string, number> = {};
      categories.forEach(cat => {
        limits[cat.id] = cat.limit_amount;
      });
      setBudgetLimits(limits);
    }
  }, [categories]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        city,
        monthly_allowance: parseFloat(monthlyAllowance) || 15000,
        next_allowance_date: nextAllowanceDate || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBudgets = async () => {
    setSaving(true);
    try {
      for (const cat of categories) {
        if (budgetLimits[cat.id] !== cat.limit_amount) {
          await updateBudgetLimit(cat.id, budgetLimits[cat.id]);
        }
      }
      toast.success('Budget limits saved!');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  City
                </Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowance" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Monthly Allowance
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="allowance"
                    type="number"
                    value={monthlyAllowance}
                    onChange={(e) => setMonthlyAllowance(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextAllowance" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Next Allowance Date
                </Label>
                <Input
                  id="nextAllowance"
                  type="date"
                  value={nextAllowanceDate}
                  onChange={(e) => setNextAllowanceDate(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="w-full gradient-primary text-primary-foreground">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Budget Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Budget Limits
              </CardTitle>
              <CardDescription>Set monthly spending limits for each category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <Label htmlFor={`budget-${cat.id}`} className="text-sm font-medium">
                      {cat.category}
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                      <Input
                        id={`budget-${cat.id}`}
                        type="number"
                        value={budgetLimits[cat.id] || 0}
                        onChange={(e) => setBudgetLimits(prev => ({
                          ...prev,
                          [cat.id]: parseFloat(e.target.value) || 0
                        }))}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="font-medium">{formatRupee(cat.spent)}</p>
                  </div>
                </div>
              ))}

              <Button onClick={handleSaveBudgets} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Budget Limits
              </Button>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Signed in as {user?.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleSignOut} className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
