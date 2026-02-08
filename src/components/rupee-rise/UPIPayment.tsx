import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, QrCode, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatRupee } from '@/lib/inr';

interface UPIPaymentProps {
  categories: { id: string; category: string; icon: string }[];
  onPaymentComplete: (transaction: {
    amount: number;
    category: string;
    description: string;
    upi_handle: string;
    transaction_type: string;
    transaction_date: string;
    payment_method: string;
  }) => Promise<any>;
}

const POPULAR_UPI_APPS = [
  { name: 'Google Pay', scheme: 'tez://upi/pay' },
  { name: 'PhonePe', scheme: 'phonepe://pay' },
  { name: 'Paytm', scheme: 'paytmmp://pay' },
  { name: 'BHIM', scheme: 'bhim://pay' },
];

export function UPIPayment({ categories, onPaymentComplete }: UPIPaymentProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [amount, setAmount] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [payeeUPI, setPayeeUPI] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const upiIntentURL = `upi://pay?pa=${encodeURIComponent(payeeUPI)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${encodeURIComponent(note || 'Payment via RupeeRise')}&cu=INR`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiIntentURL);
    toast.success('UPI link copied!');
  };

  const handleOpenUPIApp = () => {
    window.location.href = upiIntentURL;
  };

  const handleConfirmPayment = async () => {
    const result = await onPaymentComplete({
      amount: parseFloat(amount),
      category: category || 'Food & Dining',
      description: `${payeeName} - ${note || 'UPI Payment'}`,
      upi_handle: payeeUPI,
      transaction_type: 'expense',
      transaction_date: new Date().toISOString(),
      payment_method: 'UPI',
    });

    if (result) {
      setStep('success');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep('form');
    setAmount('');
    setPayeeName('');
    setPayeeUPI('');
    setCategory('');
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground shadow-card">
          <Smartphone className="w-4 h-4" />
          Pay via UPI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            {step === 'form' && 'UPI Payment'}
            {step === 'confirm' && 'Confirm Payment'}
            {step === 'success' && 'Payment Recorded!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="payee-name">Payee Name</Label>
              <Input
                id="payee-name"
                placeholder="e.g., Swiggy, Zomato, Chai Wala"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                placeholder="merchant@upi"
                value={payeeUPI}
                onChange={(e) => setPayeeUPI(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 text-lg font-display"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.category}>
                      {cat.icon} {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                placeholder="What's this payment for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button
              onClick={() => setStep('confirm')}
              disabled={!amount || !payeeName || !payeeUPI}
              className="w-full gradient-primary text-primary-foreground"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 mt-4">
            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">You're paying</p>
                  <p className="text-3xl font-display font-bold text-foreground">{formatRupee(parseFloat(amount))}</p>
                  <p className="text-sm text-muted-foreground">to {payeeName}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UPI ID</span>
                    <span className="font-medium">{payeeUPI}</span>
                  </div>
                  {note && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium">{note}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="text-sm font-medium text-center mb-2">Open in UPI App</p>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_UPI_APPS.map(app => (
                  <Button
                    key={app.name}
                    variant="outline"
                    size="sm"
                    onClick={handleOpenUPIApp}
                    className="gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {app.name}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleCopyUPI}
              className="w-full gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy UPI Link
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('form')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleConfirmPayment} className="flex-1 gradient-primary text-primary-foreground">
                Mark as Paid
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 mt-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Payment Recorded!</p>
              <p className="text-sm text-muted-foreground">
                {formatRupee(parseFloat(amount))} to {payeeName}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              This transaction has been added to your budget tracker
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
