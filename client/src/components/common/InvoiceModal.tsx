import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Invoice } from '../../types';
import { X, Printer, Crown, CheckCircle, Clock } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceIdOrBookingId: number | string | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceIdOrBookingId }) => {
  const [data, setData] = useState<{ invoice: Invoice; hotel: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !invoiceIdOrBookingId) return;

    setLoading(true);
    setError(null);

    api.get<{ invoice: Invoice; hotel: any }>(`/invoices/${invoiceIdOrBookingId}`)
      .then(res => {
        setData(res);
      })
      .catch(err => {
        // Fallback: try fetching by booking ID if invoiceId wasn't found directly
        api.get<any>(`/bookings/${invoiceIdOrBookingId}`)
          .then(booking => {
            if (booking.invoice) {
              setData({
                invoice: booking.invoice,
                hotel: {
                  name: 'HABESHA-HOTEL',
                  email: 'reservations@habeshahotel.com',
                  phone: '+251 11 667 8000',
                  address: 'Bole Sub-City, Africa Avenue, Addis Ababa, Ethiopia',
                  tax_rate: '12.0',
                  currency: 'ETB',
                }
              });
            } else {
              setError('No invoice generated for this reservation yet');
            }
          })
          .catch(() => {
            setError(err.message || 'Failed to load invoice');
          });
      })
      .finally(() => setLoading(false));
  }, [isOpen, invoiceIdOrBookingId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoice = data?.invoice;
  const hotel = data?.hotel;
  const currencySymbol = 'ETB ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Modal Controls (Hidden in print) */}
        <div className="bg-slate-900 text-slate-100 p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Official Hotel Invoice & Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8 sm:p-10 text-slate-800">
          {loading ? (
            <div className="py-20 text-center text-slate-500">Loading invoice statement...</div>
          ) : error || !invoice ? (
            <div className="py-12 text-center text-rose-600 font-medium">{error || 'Invoice not found'}</div>
          ) : (
            <div className="space-y-8">
              {/* Hotel Header */}
              <div className="flex flex-wrap items-start justify-between border-b border-slate-200 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <img
                      src="/images/logo-hotel.png"
                      alt="HABESHA-HOTEL Logo"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png'; }}
                      className="h-8 w-auto object-contain rounded-md"
                    />
                    <span className="font-serif text-2xl font-bold tracking-wider text-slate-950">
                      HABESHA<span className="text-amber-600 font-light">-HOTEL</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{hotel?.address || 'Bole Sub-City, Africa Avenue (Bole Road), Addis Ababa, Ethiopia'}</p>
                  <p className="text-xs text-slate-500">{hotel?.email || 'reservations@habeshahotel.com'} | {hotel?.phone || '+251 11 667 8000'}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Hotel Invoice & Bill Receipt</div>
                  <div className="font-mono text-lg font-bold text-slate-900">{invoice.invoice_number}</div>
                  <div className="text-xs text-slate-500 mt-1">Booking Ref: <span className="font-semibold text-slate-700">{invoice.booking_reference}</span></div>
                  <div className="text-xs text-slate-500">Date Issued: {new Date(invoice.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Guest & Stay Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="block text-slate-400 uppercase font-semibold text-[10px]">Guest Name</span>
                  <span className="font-bold text-slate-800 text-sm">{invoice.customer_name}</span>
                  <span className="block text-slate-500 text-[11px] truncate">{invoice.customer_email}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase font-semibold text-[10px]">Accommodation</span>
                  <span className="font-bold text-slate-800 text-sm">Room #{invoice.room_number || 'Suite'}</span>
                  <span className="block text-slate-500 text-[11px]">{invoice.room_type_name}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase font-semibold text-[10px]">Check-In / Out</span>
                  <span className="font-semibold text-slate-800">{invoice.check_in_date}</span>
                  <span className="block text-slate-500 text-[11px]">to {invoice.check_out_date} ({invoice.nights_count || 1} nights)</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase font-semibold text-[10px]">Payment Status</span>
                  <span className={`inline-flex items-center gap-1 font-bold mt-0.5 px-2 py-0.5 rounded text-[11px] ${
                    invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-950 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-center">Qty</th>
                      <th className="py-2.5 text-right">Unit Rate</th>
                      <th className="py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-medium text-slate-800">{item.description}</td>
                          <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2.5 text-right text-slate-600">{currencySymbol}{Number(item.unit_price).toFixed(2)}</td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">{currencySymbol}{Number(item.total_price).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 font-medium text-slate-800">{invoice.room_type_name} Room Stay</td>
                        <td className="py-2.5 text-center text-slate-600">{invoice.nights_count || 1}</td>
                        <td className="py-2.5 text-right text-slate-600">{currencySymbol}{Number(invoice.subtotal).toFixed(2)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">{currencySymbol}{Number(invoice.subtotal).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-2 text-xs text-slate-500 max-w-sm">
                  <p className="font-semibold text-slate-700">Payment Information:</p>
                  {invoice.payments && invoice.payments.length > 0 ? (
                    invoice.payments.map((p, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                        <div>
                          <span className="font-medium text-slate-800">{p.payment_reference}</span>
                          <span className="block text-[10px] text-slate-400 capitalize">{p.payment_method} • {new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-emerald-700">+{currencySymbol}{Number(p.amount).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-slate-400">No payment transaction recorded yet.</p>
                  )}
                  <p className="text-[11px] pt-1">Thank you for staying at HABESHA-HOTEL. All transactions are securely audited.</p>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{currencySymbol}{Number(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Occupancy Tax (12%):</span>
                    <span>{currencySymbol}{Number(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-{currencySymbol}{Number(invoice.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-1.5">
                    <span>Grand Total:</span>
                    <span>{currencySymbol}{Number(invoice.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Paid Amount:</span>
                    <span>{currencySymbol}{Number(invoice.paid_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-950 border-t-2 border-slate-900 pt-2">
                    <span>Balance Due:</span>
                    <span className={invoice.balance_due > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                      {currencySymbol}{Number(invoice.balance_due).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
