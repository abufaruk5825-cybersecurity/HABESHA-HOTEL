import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { RoomType, Room, HotelService } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Building,
  ShieldCheck,
  Check,
  Bed,
  Clock,
  Edit3
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoomTypeId?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialStep?: 1 | 2;
  onBookingSuccess?: (bookingId: number, ref: string) => void;
}

// ── Date helper utilities ───────────────────────────────────────────────────
const getTodayStr = () => new Date().toISOString().split('T')[0];

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getNextDayStr = (dateStr: string, daysAhead: number = 1) => {
  const [y, m, d] = (dateStr || getTomorrowStr()).split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setDate(target.getDate() + daysAhead);
  const outY = target.getFullYear();
  const outM = String(target.getMonth() + 1).padStart(2, '0');
  const outD = String(target.getDate()).padStart(2, '0');
  return `${outY}-${outM}-${outD}`;
};

const calculateNights = (inStr: string, outStr: string): number => {
  if (!inStr || !outStr) return 1;
  const inDate = new Date(inStr);
  const outDate = new Date(outStr);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedRoomTypeId,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialStep,
  onBookingSuccess,
}) => {
  const { user, taxRate, currency } = useAuth();
  const { formatCurrency, t, language } = useLanguage();

  // Steps: 1: Choose Dates & Stay, 2: Choose Room, 3: Optional Extras, 4: Guest Details & Pay, 5: Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Default dates: exactly 1 night starting tomorrow (never hardcoded 3 nights!)
  const defaultIn = initialCheckIn || getTomorrowStr();
  const defaultOut = initialCheckOut || getNextDayStr(defaultIn, 1);

  const [checkIn, setCheckIn] = useState<string>(defaultIn);
  const [checkOut, setCheckOut] = useState<string>(defaultOut);
  const [adults, setAdults] = useState<number>(initialGuests ? Math.max(1, initialGuests) : 2);
  const [children, setChildren] = useState<number>(0);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [services, setServices] = useState<HotelService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'cash'>('cash');
  const [payNow, setPayNow] = useState(false);

  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation result
  const [confirmedBooking, setConfirmedBooking] = useState<{ id: number; reference: string; total: number } | null>(null);

  // Calculated stay duration in nights (dynamically updates when dates change)
  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  // Handle check-in change: auto-advance checkout if needed
  const handleCheckInChange = (newIn: string) => {
    setCheckIn(newIn);
    const inDate = new Date(newIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) {
      setCheckOut(getNextDayStr(newIn, 1));
    }
  };

  // Quick duration buttons (1 Night, 2 Nights, 3 Nights, 5 Nights, 7 Nights)
  const handleQuickDuration = (countNights: number) => {
    setCheckOut(getNextDayStr(checkIn, countNights));
  };

  // Reset modal state
  const handleReset = () => {
    const freshIn = initialCheckIn || getTomorrowStr();
    const freshOut = initialCheckOut || getNextDayStr(freshIn, 1);
    setCheckIn(freshIn);
    setCheckOut(freshOut);
    setAdults(initialGuests ? Math.max(1, initialGuests) : 2);
    setChildren(0);
    setStep(initialStep || 1);
    setConfirmedBooking(null);
    setSelectedServices([]);
    setError(null);
    if (user) {
      setGuestName(user.full_name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    } else {
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
    }
    setSpecialRequests('');
    setPaymentMethod('cash');
    setPayNow(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Whenever modal opens, initialize with criteria or defaults
  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen]);

  // Initialize guest info from user if logged in
  useEffect(() => {
    if (user) {
      setGuestName(user.full_name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  // Load room types and hotel services
  useEffect(() => {
    if (!isOpen) return;
    api.get<RoomType[]>('/rooms/types').then(r => setRoomTypes(r || [])).catch(console.error);
    setLoadingServices(true);
    api.get<HotelService[]>('/services?available_only=true')
      .then(r => setServices(r || []))
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, [isOpen]);

  // Search available rooms whenever dates or guest count change
  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    setError(null);
    try {
      const res = await api.get<Room[]>(`/rooms/available?check_in=${checkIn}&check_out=${checkOut}&guests=${adults + children}`);
      const roomList = Array.isArray(res) ? res : [];
      setAvailableRooms(roomList);

      if (roomList.length > 0) {
        if (preselectedRoomTypeId) {
          const match = roomList.find(r => Number(r.room_type_id) === Number(preselectedRoomTypeId));
          setSelectedRoom(match || roomList[0]);
        } else if (!selectedRoom || !roomList.find(r => r.id === selectedRoom.id)) {
          setSelectedRoom(roomList[0]);
        }
      } else {
        setSelectedRoom(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search room availability');
      setAvailableRooms([]);
      setSelectedRoom(null);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (isOpen && checkIn && checkOut) {
      fetchAvailableRooms();
    }
  }, [isOpen, checkIn, checkOut, adults, children]);

  // Group available rooms by Room Type category so customer sees 1 clean card per category
  const roomCategories = useMemo(() => {
    const groups: { [key: number]: { roomType: Room; count: number; rooms: Room[] } } = {};
    for (const room of availableRooms) {
      const typeId = Number(room.room_type_id);
      if (!groups[typeId]) {
        groups[typeId] = {
          roomType: room,
          count: 1,
          rooms: [room],
        };
      } else {
        groups[typeId].count += 1;
        groups[typeId].rooms.push(room);
      }
    }
    return Object.values(groups);
  }, [availableRooms]);

  if (!isOpen) return null;

  // ── Dynamic live pricing calculations ─────────────────────────────────────
  // 1. Room price per night based on selected room
  const roomPrice = Number(selectedRoom?.price_per_night) || 0;
  // 2. Room total = room price × number of nights
  const roomTotal = roomPrice * nights;
  // 3. Extra services total
  const servicesTotal = selectedServices.reduce((sum, sId) => {
    const s = (services || []).find(x => Number(x.id) === Number(sId));
    return sum + (Number(s?.price) || 0);
  }, 0);
  // 4. Subtotal = roomTotal + servicesTotal
  const subtotal = Number(roomTotal) + Number(servicesTotal);
  // 5. Tax = automatically calculated (12%)
  const numTaxRate = Number(taxRate) || 0;
  const taxAmount = Number(((subtotal * numTaxRate) / 100).toFixed(2));
  // 6. Final grand total = subtotal + tax
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  const handleToggleService = (serviceId: number) => {
    const idNum = Number(serviceId);
    setSelectedServices(prev =>
      prev.map(Number).includes(idNum) ? prev.filter(id => Number(id) !== idNum) : [...prev, idNum]
    );
  };

  const handleConfirmReservation = async () => {
    if (!selectedRoom) {
      setError('Please select a room to continue');
      return;
    }
    if (!guestName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!guestPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!guestEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        room_id: selectedRoom.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults_count: adults,
        children_count: children,
        special_requests: specialRequests,
        primary_guest_name: guestName.trim(),
        primary_guest_email: guestEmail.trim(),
        primary_guest_phone: guestPhone.trim(),
        service_ids: selectedServices,
        initial_payment_amount: payNow ? grandTotal : 0,
        payment_method: paymentMethod,
      };

      const res = await api.post<{ message: string; booking_id: number; booking_reference: string; total_amount: number }>('/bookings', payload);
      setConfirmedBooking({
        id: res.booking_id,
        reference: res.booking_reference,
        total: res.total_amount,
      });
      setStep(5);
      onBookingSuccess?.(res.booking_id, res.booking_reference);
    } catch (err: any) {
      setError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl text-slate-100 overflow-hidden relative my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-hotel.png"
              alt="HABESHA-HOTEL Logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png';
              }}
              className="w-9 h-9 object-contain rounded-lg border border-amber-500/20"
            />
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-100">{t('modal.book_title', 'Book Your Room at HABESHA-HOTEL')}</h2>
              <p className="text-xs text-slate-400">{t('modal.location_sub', 'Bole, Addis Ababa, Ethiopia')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator — 4 clear navigation tabs */}
        <div className="grid grid-cols-4 border-b border-slate-800 text-xs font-semibold text-center bg-slate-950/40">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 transition-colors cursor-pointer ${step === 1 ? 'bg-amber-500/15 text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t('modal.step1', '1. Dates & Stay')}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-3 transition-colors cursor-pointer ${step === 2 ? 'bg-amber-500/15 text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t('modal.step2', '2. Choose Room')}
          </button>
          <button
            type="button"
            onClick={() => selectedRoom && setStep(3)}
            disabled={!selectedRoom}
            className={`py-3 transition-colors ${!selectedRoom ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${step === 3 ? 'bg-amber-500/15 text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t('modal.step3', '3. Food & Extras')}
          </button>
          <button
            type="button"
            onClick={() => selectedRoom && setStep(4)}
            disabled={!selectedRoom}
            className={`py-3 transition-colors ${!selectedRoom ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${step >= 4 ? 'bg-amber-500/15 text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t('modal.step4', '4. Guest & Pay')}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3 bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-lg text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200 text-sm font-bold ml-2">×</button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 max-h-[66vh] overflow-y-auto space-y-5">
          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: CHOOSE DATES & STAY DURATION FIRST
              (Customers select check-in and check-out before seeing room list)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Select Your Check-In and Check-Out Dates
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose your arrival and departure dates. Room prices and totals will calculate dynamically based on your nights.
                </p>
              </div>

              {/* Date Inputs Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-In Date
                  </label>
                  <input
                    type="date"
                    min={getTodayStr()}
                    value={checkIn}
                    onChange={e => handleCheckInChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Check-in time starts at 2:00 PM</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-Out Date
                  </label>
                  <input
                    type="date"
                    min={getNextDayStr(checkIn, 1)}
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Check-out time is until 11:00 AM</span>
                </div>
              </div>

              {/* Dynamic Live Stay Duration Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">Duration of Stay</span>
                    <span className="text-lg font-bold text-white">
                      {nights} Night{nights > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-slate-300 block">
                      ({checkIn} → {checkOut})
                    </span>
                  </div>
                </div>

                {/* Quick duration selection pills */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Quick Select Duration:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 5, 7].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleQuickDuration(n)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          nights === n
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {n} {n === 1 ? 'Night' : n === 7 ? 'Nights (1 Wk)' : 'Nights'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Number of Guests */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> Number of Adults
                  </label>
                  <select
                    value={adults}
                    onChange={e => setAdults(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>
                        {n} Adult{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> Children (Ages 0 - 12)
                  </label>
                  <select
                    value={children}
                    onChange={e => setChildren(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {[0, 1, 2, 3].map(n => (
                      <option key={n} value={n}>
                        {n === 0 ? 'No Children' : `${n} Child${n > 1 ? 'ren' : ''}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: CHOOSE ROOM CATEGORY
              (Room price × number of nights dynamically calculated)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Selected Stay Summary Banner with Edit Button */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">
                      Stay: {checkIn} to {checkOut}
                    </span>
                    <span className="text-amber-400 font-semibold ml-1.5">
                      ({nights} Night{nights > 1 ? 's' : ''})
                    </span>
                    <span className="text-slate-400 ml-2">
                      • {adults} Adult{adults > 1 ? 's' : ''}
                      {children > 0 ? `, ${children} Children` : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3 h-3" /> Change Dates
                </button>
              </div>

              {/* Room Categories List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-100">
                    Available Room Categories for {nights} Night{nights > 1 ? 's' : ''}
                  </h3>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                    Tax: {taxRate}% included at checkout
                  </span>
                </div>

                {loadingRooms ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Checking live room availability for {nights} night{nights > 1 ? 's' : ''}...
                  </div>
                ) : roomCategories.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
                    <p className="text-sm text-slate-300 font-medium">No rooms currently available for {checkIn} to {checkOut}.</p>
                    <p className="text-xs text-slate-500 mt-1">Please try modifying your stay dates or guest count.</p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-3 px-4 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Change Dates
                    </button>
                  </div>
                ) : (
                  /* 1 Clean Card per Room Category */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {roomCategories.map(cat => {
                      const isSelected = selectedRoom ? Number(selectedRoom.room_type_id) === Number(cat.roomType.room_type_id) : false;
                      const categoryPrice = Number(cat.roomType.price_per_night) || 0;
                      // Dynamic subtotal: room price × number of nights
                      const categoryTotal = categoryPrice * nights;

                      return (
                        <div
                          key={cat.roomType.room_type_id}
                          onClick={() => setSelectedRoom(cat.rooms[0])}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 select-none ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/70'
                          }`}
                        >
                          <img
                            src={cat.roomType.room_type_image || '/images/rooms/standard-single.jpg'}
                            alt={cat.roomType.room_type_name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/rooms/standard-single.jpg';
                            }}
                            className="w-24 h-24 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-100 truncate">{cat.roomType.room_type_name}</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium shrink-0">
                                  {cat.count} Available
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <Bed className="w-3 h-3 text-amber-400" />
                                <span>{cat.roomType.bed_type}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                                <span>Max: {cat.roomType.capacity} Guests</span>
                                <span>•</span>
                                <span>{cat.roomType.size_sqm} m²</span>
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-bold text-amber-400">
                                  {currency}{categoryPrice.toLocaleString()}
                                  <span className="text-[10px] text-slate-400 font-normal"> / night</span>
                                </div>
                                <div className="text-[10px] text-slate-300">
                                  {nights} {nights === 1 ? 'Night' : 'Nights'}: <span className="font-semibold">{currency}{categoryTotal.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 flex items-center gap-1'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}>
                                {isSelected ? (
                                  <>
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Selected</span>
                                  </>
                                ) : (
                                  <span>Select</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: FOOD & EXTRA SERVICES (OPTIONAL)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Optional Ethiopian Meals & Hotel Services
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Enhance your stay with delicious local dishes, airport shuttle, or spa therapy. You can also skip this step.
                </p>
              </div>

              {loadingServices ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading available services…
                </div>
              ) : !services || services.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No extra services available at this time. Click Continue to proceed.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map(svc => {
                    if (!svc || !svc.id) return null;
                    const isChecked = selectedServices.map(Number).includes(Number(svc.id));
                    return (
                      <div
                        key={svc.id}
                        onClick={() => handleToggleService(svc.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${isChecked ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                          {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : <Sparkles className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-100 leading-tight">{svc.name}</span>
                            <span className="text-xs font-bold text-amber-400 flex-shrink-0">{currency}{Number(svc.price).toFixed(2)}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{svc.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 4: GUEST INFORMATION & PAYMENT
             ══════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Guest Contact Information</h3>
                <p className="text-xs text-slate-400">Please provide your details so we can welcome you to HABESHA-HOTEL</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Kedir Ahmed"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    placeholder="e.g. +251 91 123 4567"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="e.g. kedir.ahmed@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Special Preferences / Requests (Optional)</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Flight arrival time for airport pickup, quiet high floor room, extra towels..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Payment Method Options */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-200 mb-2">Select How You Prefer to Pay</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'cash' ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/40' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-slate-200">Pay at Front Desk</span>
                    <span className="text-[10px] text-slate-400">Cash / Card / Telebirr upon arrival</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'bank_transfer' ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/40' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-slate-200">Telebirr / CBE</span>
                    <span className="text-[10px] text-slate-400">Direct mobile bank transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card' ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/40' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-slate-200">Credit / Debit Card</span>
                    <span className="text-[10px] text-slate-400">Visa / Mastercard / UnionPay</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Price Breakdown Box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-200 pb-1.5 border-b border-slate-800 flex justify-between">
                  <span>Stay: {checkIn} to {checkOut}</span>
                  <span className="text-amber-400 font-bold">{nights} Night{nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Room: {selectedRoom?.room_type_name} ({nights} Night{nights > 1 ? 's' : ''} × {currency}{roomPrice.toLocaleString()}):</span>
                  <span className="font-medium text-slate-100">{currency}{roomTotal.toLocaleString()}</span>
                </div>
                {selectedServices.length > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Extra Meals & Services ({selectedServices.length} selected):</span>
                    <span className="font-medium text-slate-100">{currency}{servicesTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/60">
                  <span>Subtotal:</span>
                  <span className="font-medium">{currency}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hotel Tax ({taxRate}%):</span>
                  <span>{currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold">
                  <span className="text-slate-100 text-sm">Final Total:</span>
                  <span className="text-amber-400 text-lg">{currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 5: CONFIRMATION
             ══════════════════════════════════════════════════════════════════ */}
          {step === 5 && confirmedBooking && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-100">{t('modal.confirmed_title', 'Reservation Confirmed!')}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('modal.confirmed_msg', 'We look forward to welcoming you to HABESHA-HOTEL in Addis Ababa.')}</p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">{t('modal.booking_ref', 'Booking Reference:')}</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{confirmedBooking.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('modal.stay_period', 'Stay Period:')}</span>
                  <span className="font-medium text-slate-200">{checkIn} to {checkOut} ({nights} {nights === 1 ? t('modal.night', 'night') : t('modal.nights', 'nights')})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('modal.room_reserved', 'Room Category:')}</span>
                  <span className="font-medium text-slate-200">{selectedRoom?.room_type_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('modal.guest_name_label', 'Guest Name:')}</span>
                  <span className="font-medium text-slate-200">{guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'am' ? 'የክፍያ ዘዴ:' : 'Payment:'}</span>
                  <span className="font-medium text-slate-200 capitalize">
                    {paymentMethod === 'cash' ? (language === 'am' ? 'በሬሴፕሽን የሚከፈል' : 'Pay at Front Desk') : paymentMethod === 'bank_transfer' ? 'Telebirr / CBE' : 'Card'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">{t('modal.total_charged', 'Final Total Charged:')}</span>
                  <span className="text-amber-400 text-sm">{currency}{confirmedBooking.total}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {t('modal.done_btn', 'Done & Return to Website')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            FOOTER ACTIONS & DYNAMIC PRICE BAR
           ══════════════════════════════════════════════════════════════════ */}
        {step < 5 && (
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs">
              {step === 1 ? (
                <div>
                  <div className="text-slate-400">
                    {t('modal.stay_summary', 'Stay Duration:')} <span className="font-bold text-white">{nights} {nights === 1 ? t('modal.night', 'Night') : t('modal.nights', 'Nights')}</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-medium">
                    {checkIn} → {checkOut} ({adults} {t('modal.adults', 'Adults')})
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-slate-400 truncate max-w-[240px] sm:max-w-none">
                    {selectedRoom?.room_type_name || (language === 'am' ? 'ክፍል ይምረጡ' : 'Select a Room')} • <span className="text-white font-medium">{nights} {nights === 1 ? t('modal.night', 'Night') : t('modal.nights', 'Nights')}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-bold text-amber-400">{currency}{grandTotal.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">(incl. {currency}{taxAmount.toFixed(2)} {taxRate}% {t('modal.tax_included', 'tax')})</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Back Button */}
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'ተመለስ' : 'Back'}</span>
                </button>
              )}

              {/* Step 1 CTA: Go to Rooms */}
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <span>{language === 'am' ? `ዝግጁ ክፍሎችን እይ (${nights} ቀን)` : `Show Available Rooms for ${nights} Night${nights > 1 ? 's' : ''}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Step 2 CTA: Go to Extras */}
              {step === 2 && (
                <button
                  type="button"
                  disabled={!selectedRoom || loadingRooms || roomCategories.length === 0}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{t('modal.continue_step3', 'Continue to Extras')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Step 3 CTA: Go to Guest Info */}
              {step === 3 && (
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>{t('modal.continue_step4', 'Continue to Guest Info')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Step 4 CTA: Submit Reservation */}
              {step === 4 && (
                <button
                  type="button"
                  disabled={submitting || !guestName.trim() || !guestPhone.trim() || !guestEmail.trim()}
                  onClick={handleConfirmReservation}
                  className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{submitting ? t('modal.submitting', 'Confirming...') : t('modal.confirm_reservation', 'Confirm Reservation ✓')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
