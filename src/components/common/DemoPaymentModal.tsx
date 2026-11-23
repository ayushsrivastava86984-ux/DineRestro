import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { PaymentRecord } from '../../types';
import { formatINR } from '../../utils/formatters';

export function DemoPaymentModal() {
  const { activeDemoPayment, closeDemoPayment, completeDemoPayment } = useApp();
  const [method, setMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('aarav.varanasi@okdemo');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);

  if (!activeDemoPayment) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      const record = completeDemoPayment(method);
      setProcessing(false);
      if (record) {
        setReceipt(record);
      }
    }, 500);
  };

  const handleClose = () => {
    setReceipt(null);
    closeDemoPayment();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-payment-title"
    >
      <div className="bg-white border border-[#E8DDD1] rounded-lg max-w-lg w-full overflow-hidden my-auto">
        <div className="px-5 py-4 bg-[#702C3A] text-white flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono tracking-wide text-[#F4A6B8]">
              DEMO ONLY — SIMULATED PAYMENT INTERFACE
            </p>
            <h2 id="demo-payment-title" className="text-lg font-semibold">
              {activeDemoPayment.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded hover:bg-white/15"
            aria-label="Close demo payment window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {receipt ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#E7EFD9] border border-[#C8D8AC] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#702C3A] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-[#292321]">
                    DEMO PAYMENT RECEIPT GENERATED (NOT REAL MONEY)
                  </p>
                  <p className="text-[#6B5F5C]">
                    This simulated receipt is stored in your Phase 1 local browser state for demonstration only.
                  </p>
                </div>
              </div>

              <div className="border border-[#E8DDD1] rounded-lg p-4 space-y-2.5 text-sm bg-[#FFF6E9]/40">
                <div className="flex justify-between">
                  <span className="text-[#6B5F5C]">Demo Transaction ID</span>
                  <span className="font-mono font-semibold text-[#702C3A]">
                    {receipt.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5F5C]">Booking Reference</span>
                  <span className="font-mono font-semibold text-[#292321]">
                    {receipt.referenceId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5F5C]">Payment Category</span>
                  <span className="font-medium text-[#292321]">{receipt.paymentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5F5C]">Restaurant</span>
                  <span className="font-medium text-[#292321]">{receipt.restaurantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5F5C]">Simulated Method</span>
                  <span className="font-medium text-[#292321]">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E8DDD1] font-semibold">
                  <span>Demo Amount Marked Paid</span>
                  <span className="font-mono tabular-nums text-[#702C3A]">
                    {formatINR(receipt.amount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-sm font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
              >
                Return to DineRestro
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="px-3.5 py-2.5 rounded-lg bg-[#FFF6E9] border border-[#E8DDD1] text-xs text-[#6B5F5C] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#702C3A] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#292321]">DEMO ONLY:</strong> No live payment gateway is connected and no real money is collected.
                </span>
              </div>

              {/* Transparent Breakdown */}
              <div className="border border-[#E8DDD1] rounded-lg p-4 space-y-2 text-xs">
                <p className="font-semibold text-[#292321] mb-1">
                  Separated Payment Breakdown
                </p>
                {activeDemoPayment.breakdownLines.map((line) => (
                  <div key={line.label} className="flex justify-between gap-2">
                    <span className="text-[#6B5F5C]">{line.label}</span>
                    <span className="font-medium text-[#292321] tabular-nums text-right">
                      {line.value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-[#E8DDD1] text-sm font-semibold text-[#702C3A]">
                  <span>Demo Payable Now</span>
                  <span className="font-mono tabular-nums">
                    {formatINR(activeDemoPayment.amount)}
                  </span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <p className="text-xs font-semibold text-[#292321] mb-2">
                  Choose Simulated Payment Method
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI' as const, label: 'Demo UPI', Icon: Smartphone },
                    { id: 'Card' as const, label: 'Demo Card', Icon: CreditCard },
                    { id: 'NetBanking' as const, label: 'NetBanking', Icon: Landmark },
                  ].map((tab) => {
                    const Icon = tab.Icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMethod(tab.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-semibold transition-colors ${
                          method === tab.id
                            ? 'bg-[#702C3A] text-white border-[#702C3A]'
                            : 'bg-white text-[#292321] border-[#E8DDD1] hover:bg-[#FFF6E9]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {method === 'UPI' && (
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Simulated UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg"
                    required
                  />
                </div>
              )}

              {method === 'Card' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Demo Card Number</label>
                    <input
                      type="text"
                      defaultValue="4111 •••• •••• 1111 (DEMO)"
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Expiry</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Demo CVV</label>
                    <input
                      type="password"
                      defaultValue="123"
                      className="w-full px-3 py-2 text-sm border border-[#E8DDD1] rounded-lg font-mono"
                    />
                  </div>
                </div>
              )}

              {method === 'NetBanking' && (
                <div>
                  <label className="block text-xs font-semibold text-[#292321] mb-1">
                    Simulated Bank
                  </label>
                  <select className="w-full px-3 py-2 text-sm bg-white border border-[#E8DDD1] rounded-lg">
                    <option>State Bank of India (Demo)</option>
                    <option>HDFC Bank (Demo)</option>
                    <option>ICICI Bank (Demo)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium border border-[#E8DDD1] rounded-lg hover:bg-[#FFF6E9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
                >
                  {processing
                    ? 'Recording Demo Payment...'
                    : `Simulate Demo Payment (${formatINR(activeDemoPayment.amount)})`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
