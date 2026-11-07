import React, { useState } from 'react';
import { useFoodOrder } from '../../context/FoodOrderContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Utensils,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Flame,
  Leaf,
  Wine,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Phone,
  User,
  BedDouble,
  DollarSign,
  Coffee,
  Check,
  ChefHat,
  Truck,
  RotateCcw
} from 'lucide-react';
import { OrderStatus } from '../../types/food';

export const FoodOrderModal: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    activeItemForDetails,
    setActiveItemForDetails,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    activeOrder,
    placeOrder,
    advanceOrderStatus,
    closeOrderTracker,
  } = useFoodOrder();

  const { currency, user } = useAuth();
  const { t, language } = useLanguage();

  // Local state for Item Details Modal
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailInstructions, setDetailInstructions] = useState('');
  const [justAddedNotice, setJustAddedNotice] = useState(false);

  // Local state for Checkout
  const [diningType, setDiningType] = useState<'room_delivery' | 'restaurant_dining'>('room_delivery');
  const [roomOrTableNumber, setRoomOrTableNumber] = useState((user as any)?.room_number || 'Room #204');
  const [guestName, setGuestName] = useState(user?.full_name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+251 911 234 567');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'room_folio' | 'cash' | 'telebirr'>('room_folio');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // When active item changes, reset local state
  React.useEffect(() => {
    if (activeItemForDetails) {
      setDetailQuantity(1);
      setDetailInstructions('');
      setJustAddedNotice(false);
    }
  }, [activeItemForDetails]);

  // Handle Add To Cart from Details Modal
  const handleAddItemToCart = () => {
    if (!activeItemForDetails) return;
    addToCart(activeItemForDetails, detailQuantity, detailInstructions);
    setJustAddedNotice(true);
    setTimeout(() => {
      setJustAddedNotice(false);
      setActiveItemForDetails(null);
    }, 900);
  };

  // Handle placing the order
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!roomOrTableNumber.trim()) {
      setCheckoutError(
        diningType === 'room_delivery'
          ? 'Please enter your Hotel Room Number (e.g., Room #204)'
          : 'Please enter your Table Number or Dining Area'
      );
      return;
    }

    if (!guestName.trim()) {
      setCheckoutError('Please provide your name for the order');
      return;
    }

    if (cart.length === 0) {
      setCheckoutError('Your order cart is empty');
      return;
    }

    placeOrder({
      diningType,
      roomOrTableNumber,
      guestName,
      guestPhone,
      specialNotes,
      paymentMethod,
    });
  };

  // Quick instructions chips
  const quickInstructions = [
    'Mild berbere (not too spicy)',
    'Extra warm injera',
    'Extra Ayib cottage cheese',
    'No red onions',
    'Serve piping hot',
  ];

  const statusStages: {
    status: OrderStatus;
    title: string;
    amharic: string;
    desc: string;
    icon: React.ElementType;
  }[] = [
    {
      status: 'pending',
      title: t('tracker.stage_pending', 'Order Received'),
      amharic: 'ትዕዛዝ ደርሷል',
      desc: t('tracker.desc_pending', 'Sent to hotel kitchen dispatch system'),
      icon: Clock,
    },
    {
      status: 'confirmed',
      title: t('tracker.stage_confirmed', 'Order Confirmed'),
      amharic: 'ተረጋግጧል',
      desc: t('tracker.desc_confirmed', 'Chef acknowledged and preparing ingredients'),
      icon: CheckCircle2,
    },
    {
      status: 'preparing',
      title: t('tracker.stage_preparing', 'Cooking in Kitchen'),
      amharic: 'በዝግጅት ላይ',
      desc: t('tracker.desc_preparing', 'Sizzling on hot clay burners with fresh spices'),
      icon: ChefHat,
    },
    {
      status: 'ready',
      title: t('tracker.stage_ready', 'Dispatched for Delivery'),
      amharic: 'ለመላክ ዝግጁ',
      desc: t('tracker.desc_ready', 'Plated under silver cloche on service trolley'),
      icon: Truck,
    },
    {
      status: 'delivered',
      title: t('tracker.stage_delivered', 'Delivered • Bon Appétit!'),
      amharic: 'ደርሷል • መልካም ምግብ',
      desc: t('tracker.desc_delivered', 'Enjoy your authentic Habesha dining experience'),
      icon: Sparkles,
    },
  ];

  const getCurrentStatusIndex = (status: OrderStatus) => {
    return statusStages.findIndex((s) => s.status === status);
  };

  return (
    <>
      {/* ───────────────────────────────────────────────────────────────────────
          1. FLOATING CART PILL (VISIBLE WHEN CART HAS ITEMS)
         ─────────────────────────────────────────────────────────────────────── */}
      {cartCount > 0 && !isCartOpen && !isCheckoutOpen && !activeOrder && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-2xl shadow-amber-500/40 border border-amber-300 hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-slate-950" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center border border-amber-400">
                {cartCount}
              </span>
            </div>
            <div className="text-left">
              <span className="block text-[11px] uppercase tracking-wider text-slate-900 font-extrabold leading-tight">
                {t('order.floating_title', 'Habesha Food Order')}
              </span>
              <span className="font-serif text-sm font-black">
                {currency}{cartTotal.toFixed(2)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 ml-1 text-slate-900 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          2. FOOD ITEM DETAILS POPUP MODAL
         ─────────────────────────────────────────────────────────────────────── */}
      {activeItemForDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
            {/* Close Button */}
            <button
              onClick={() => setActiveItemForDetails(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 hover:border-amber-400 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dish Header Image */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950 shrink-0">
              <img
                src={activeItemForDetails.image}
                alt={activeItemForDetails.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/food/doro-wat.jpg';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-black/30" />

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {activeItemForDetails.badge && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                    {activeItemForDetails.badge}
                  </span>
                )}
                {activeItemForDetails.isSpicy && (
                  <span className="bg-rose-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {language === 'am' ? 'ሚትሚታ / በርበሬ' : 'Spicy Berbere'}
                  </span>
                )}
                {activeItemForDetails.isVegetarian && (
                  <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> {language === 'am' ? 'የፆም / አትክልት' : 'Fasting / Vegetarian'}
                  </span>
                )}
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                    {language === 'am' && activeItemForDetails.amharicName ? activeItemForDetails.amharicName : activeItemForDetails.name}
                  </h3>
                  {activeItemForDetails.amharicName && (
                    <p className="text-amber-300 text-sm font-medium mt-0.5 font-serif">
                      {language === 'am' ? activeItemForDetails.name : activeItemForDetails.amharicName}
                    </p>
                  )}
                </div>
                <div className="bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/50 shadow-xl shrink-0 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">{t('common.price', 'Price')}</span>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-amber-400">
                    {currency}{activeItemForDetails.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-xs sm:text-sm">
              {/* Availability Indicator */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-400 font-semibold text-xs">
                    {t('order.kitchen_open', 'Kitchen Open • Freshly Prepared to Order')}
                  </span>
                </div>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> {t('order.prep_time', '20-30 min delivery')}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" /> {t('order.description_heading', 'Culinary Description')}
                </h4>
                <p className="leading-relaxed text-slate-300 font-light">
                  {activeItemForDetails.description}
                </p>
              </div>

              {/* Key Ingredients */}
              <div>
                <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {t('order.ingredients_heading', 'Authentic Ingredients & Spices')}
                </h4>
                <p className="leading-relaxed text-slate-400 font-light bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  {activeItemForDetails.ingredients}
                </p>
              </div>

              {/* Beverage Pairing */}
              {activeItemForDetails.pairing && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center gap-3">
                  <Wine className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">{t('order.pairing_heading', 'Recommended Beverage Pairing')}</span>
                    <span className="text-xs text-slate-300">{activeItemForDetails.pairing}</span>
                  </div>
                </div>
              )}

              {/* Quantity Selector & Special Instructions */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    {t('order.select_qty', 'Select Quantity:')}
                  </span>
                  <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-amber-400 font-mono text-sm">
                      {detailQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetailQuantity(detailQuantity + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('order.special_instructions', 'Special Kitchen Instructions (Optional):')}
                  </label>
                  <textarea
                    value={detailInstructions}
                    onChange={(e) => setDetailInstructions(e.target.value)}
                    placeholder={t('order.special_placeholder', 'e.g., mild berbere, extra ayib on the side, hot injera, please deliver quietly...')}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {/* Quick chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {quickInstructions.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDetailInstructions((prev) =>
                            prev ? `${prev}, ${chip}` : chip
                          );
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-slate-400 block">{t('order.item_total', 'Item Total')}</span>
                <span className="font-serif text-xl font-bold text-amber-400">
                  {currency}{(activeItemForDetails.price * detailQuantity).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveItemForDetails(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAddItemToCart}
                  disabled={justAddedNotice}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {justAddedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>{t('order.added_notice', 'Added to Order!')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-slate-950" />
                      <span>{t('order.add_to_order', 'Add to Order')} • {currency}{(activeItemForDetails.price * detailQuantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          3. CART DRAWER / MODAL
         ─────────────────────────────────────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border-l border-amber-500/30 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{t('order.cart_title', 'Your Dining Order')}</h3>
                  <p className="text-[11px] text-slate-400">{cartCount} {t('order.dishes_in_cart', 'dish(es) in cart')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-slate-200">{t('order.cart_empty_title', 'Your order is empty')}</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {t('order.cart_empty_desc', 'Explore our authentic Ethiopian dishes and click any meal to add it to your order.')}
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    {t('order.browse_menu', 'Browse Food Menu')}
                  </button>
                </div>
              ) : (
                cart.map((cartItem) => (
                  <div
                    key={cartItem.cartItemId}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex gap-3.5 items-start group hover:border-amber-500/30 transition-colors"
                  >
                    <img
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/food/doro-wat.jpg';
                      }}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-xs font-bold text-white truncate">
                          {language === 'am' && cartItem.item.amharicName ? cartItem.item.amharicName : cartItem.item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(cartItem.cartItemId)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] font-serif text-amber-400 font-bold mt-0.5">
                        {currency}{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-sans font-normal ml-1">
                          ({currency}{cartItem.item.price.toFixed(2)} each)
                        </span>
                      </div>

                      {cartItem.instructions && (
                        <p className="text-[10px] text-slate-400 italic bg-slate-900 px-2 py-1 rounded mt-1.5 border border-slate-800">
                          Note: "{cartItem.instructions}"
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white px-2">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>{t('order.subtotal', 'Subtotal:')}</span>
                    <span className="text-white font-medium">{currency}{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('order.vat_label', 'Hotel VAT (12%):')}</span>
                    <span className="text-white font-medium">{currency}{cartTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('order.guest_delivery', 'Hotel Guest Delivery:')}</span>
                    <span className="text-emerald-400 font-medium">{t('order.free', 'FREE')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span>{t('order.total_amount', 'Total Amount:')}</span>
                    <span className="font-serif text-lg text-amber-400 font-black">
                      {currency}{cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
                  >
                    <span>{t('order.proceed_checkout', 'Proceed to Room Checkout')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {t('order.add_more_dishes', '+ Add More Dishes')}
                    </button>
                    <button
                      onClick={clearCart}
                      className="text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      {t('order.clear_cart', 'Clear Cart')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          4. CHECKOUT MODAL
         ─────────────────────────────────────────────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{t('order.checkout_title', 'Guest Dining Checkout')}</h3>
                  <p className="text-[11px] text-slate-400">{t('order.checkout_subtitle', 'Addis Ababa • Habesha Hotel Room Service')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checkout Form (Scrollable) */}
            <form onSubmit={handleConfirmOrder} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {checkoutError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Step 1: Dining Location Option */}
              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  {t('order.step1_destination', '1. Delivery Destination')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDiningType('room_delivery');
                      if (!roomOrTableNumber.startsWith('Room')) {
                        setRoomOrTableNumber('Room #204');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      diningType === 'room_delivery'
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BedDouble className={`w-5 h-5 mb-1.5 ${diningType === 'room_delivery' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="font-serif font-bold text-sm block text-white">{t('order.in_room_delivery', 'In-Room Delivery')}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{t('order.in_room_desc', 'Delivered to your hotel suite door')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDiningType('restaurant_dining');
                      if (roomOrTableNumber.startsWith('Room')) {
                        setRoomOrTableNumber('Table #8 (Main Terrace)');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      diningType === 'restaurant_dining'
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Utensils className={`w-5 h-5 mb-1.5 ${diningType === 'restaurant_dining' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="font-serif font-bold text-sm block text-white">{t('order.restaurant_dining', 'Restaurant Dining')}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{t('order.restaurant_desc', 'Served at our hotel dining hall')}</span>
                  </button>
                </div>
              </div>

              {/* Destination Input */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  {diningType === 'room_delivery' ? t('order.room_number_label', 'Your Room Number *') : t('order.table_number_label', 'Your Table / Dining Area *')}
                </label>
                <input
                  type="text"
                  required
                  value={roomOrTableNumber}
                  onChange={(e) => setRoomOrTableNumber(e.target.value)}
                  placeholder={diningType === 'room_delivery' ? t('order.room_number_placeholder', 'e.g., Room #204 or Suite 301') : t('order.table_number_placeholder', 'e.g., Table 5 or Main Terrace')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Step 2: Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {t('order.guest_name_label', 'Guest Full Name *')}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g., Kedir Ahmed"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    {t('order.phone_label', 'Contact Phone Number *')}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+251 911 234 567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  {t('order.notes_label', 'Delivery / Dietary Notes:')}
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={t('order.notes_placeholder', 'e.g., Please bring cutlery, glasses, and extra napkins...')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Step 3: Payment Method */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  {t('order.step2_payment', '2. Payment Method')}
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'room_folio'
                      ? 'bg-amber-500/10 border-amber-400 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="room_folio"
                      checked={paymentMethod === 'room_folio'}
                      onChange={() => setPaymentMethod('room_folio')}
                      className="accent-amber-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-white block">{t('order.pay_room_bill', 'Charge to Room Bill (Guest Folio)')}</span>
                      <span className="text-[10px] text-slate-400">{t('order.pay_room_bill_desc', 'Conveniently added to your checkout invoice')}</span>
                    </div>
                    <BedDouble className="w-4 h-4 text-amber-400" />
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-500/10 border-amber-400 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="accent-amber-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-white block">{t('order.pay_cash', 'Cash on Delivery / Dining')}</span>
                      <span className="text-[10px] text-slate-400">{t('order.pay_cash_desc', 'Pay cash in Ethiopian Birr upon arrival')}</span>
                    </div>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'telebirr'
                      ? 'bg-amber-500/10 border-amber-400 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="telebirr"
                      checked={paymentMethod === 'telebirr'}
                      onChange={() => setPaymentMethod('telebirr')}
                      className="accent-amber-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs text-white block">{t('order.pay_telebirr', 'Telebirr / CBE Mobile Banking')}</span>
                      <span className="text-[10px] text-slate-400">{t('order.pay_telebirr_desc', 'Scan QR or transfer via Telebirr or CBE Birr')}</span>
                    </div>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </label>
                </div>
              </div>

              {/* Order Summary Recap */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {t('order.summary_heading', 'Order Items Summary')} ({cartCount} {t('order.dishes_in_cart', 'items')})
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {cart.map((ci) => (
                    <div key={ci.cartItemId} className="flex justify-between text-xs text-slate-300">
                      <span className="truncate max-w-[240px]">
                        {ci.quantity}x {language === 'am' && ci.item.amharicName ? ci.item.amharicName : ci.item.name}
                      </span>
                      <span className="font-serif text-amber-300 shrink-0">
                        {currency}{(ci.item.price * ci.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">{t('order.vat_label', 'Total with 12% Hotel VAT:')}</span>
                  <span className="font-serif font-black text-amber-400 text-base">
                    {currency}{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  {t('order.back_to_cart', 'Back to Cart')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{t('order.confirm_order', 'Confirm & Place Order')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          5. ORDER CONFIRMATION & REAL-TIME STATUS TRACKER MODAL
         ─────────────────────────────────────────────────────────────────────── */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
            {/* Header with Habesha Crest */}
            <div className="p-6 bg-gradient-to-b from-amber-500/15 via-slate-950 to-slate-900 border-b border-amber-500/20 text-center relative shrink-0">
              <button
                onClick={closeOrderTracker}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <ChefHat className="w-7 h-7" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-1.5">
                HABESHA-HOTEL Food & Dining
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t('tracker.title', 'Order Received & Active!')}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {t('tracker.subtitle', 'We are preparing your culinary selection with traditional Habesha care.')}
              </p>

              {/* Order Reference Badge */}
              <div className="inline-flex items-center gap-3 mt-4 bg-slate-950/90 px-4 py-2 rounded-2xl border border-amber-500/40 shadow-inner">
                <span className="text-xs text-slate-400 uppercase font-mono">{t('tracker.order_num', 'Order Number:')}</span>
                <span className="font-serif text-base font-bold text-amber-400 tracking-wider">
                  {activeOrder.orderNumber}
                </span>
              </div>
            </div>

            {/* Tracker Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Real-time Order Status Progress Bar */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> {t('tracker.heading', 'Real-Time Kitchen Tracker')}
                  </h3>
                  <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono">
                    {language === 'am' ? 'የተዘመነበት:' : 'Updated:'} {activeOrder.statusUpdatedAt}
                  </span>
                </div>

                {/* 5-Stage Interactive Indicator */}
                <div className="space-y-4">
                  {statusStages.map((stage, idx) => {
                    const currentIdx = getCurrentStatusIndex(activeOrder.status);
                    const isPassed = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const Icon = stage.icon;

                    return (
                      <div
                        key={stage.status}
                        onClick={() => advanceOrderStatus(stage.status)}
                        className={`flex items-start gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                            : isPassed
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-300'
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-60'
                        }`}
                        title="Click to test this order status"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                              : isPassed
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-600 border-slate-700'
                          }`}
                        >
                          {isPassed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-serif text-xs font-bold ${isCurrent ? 'text-amber-300 text-sm' : isPassed ? 'text-white' : 'text-slate-400'}`}>
                              {stage.title}
                            </span>
                            <span className="text-[10px] font-serif text-amber-400/80">
                              {stage.amharic}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {stage.desc}
                          </p>
                        </div>

                        {isCurrent && (
                          <span className="relative flex h-2.5 w-2.5 self-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status manual advance button for quick testing */}
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                  <span>{language === 'am' ? 'ራስ-ሰር እድገት በርቷል (~7 ሰከንድ በደረጃ)' : 'Automatic progression active (~7s per step)'}</span>
                  <button
                    type="button"
                    onClick={() => advanceOrderStatus()}
                    disabled={activeOrder.status === 'delivered'}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <span>{t('tracker.advance_btn', 'Advance Next Stage')}</span>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Order Info & Destination Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    {t('order.step1_destination', 'Delivery Destination')}
                  </span>
                  <div className="space-y-1">
                    <p className="font-serif text-sm font-bold text-white">
                      {activeOrder.roomOrTableNumber}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {language === 'am' ? 'የእንግዳ ስም:' : 'Guest:'} <span className="text-slate-200">{activeOrder.guestName}</span>
                    </p>
                    <p className="text-slate-400 text-xs">
                      {language === 'am' ? 'ስልክ:' : 'Phone:'} <span className="text-slate-200">{activeOrder.guestPhone}</span>
                    </p>
                    {activeOrder.specialNotes && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                        {language === 'am' ? 'ማስታወሻ:' : 'Notes:'} "{activeOrder.specialNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    {t('order.step2_payment', 'Payment & Total')}
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{language === 'am' ? 'ዘዴ:' : 'Method:'}</span>
                      <span className="font-bold text-white capitalize">
                        {activeOrder.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{t('order.subtotal', 'Subtotal:')}</span>
                      <span className="text-white">{currency}{activeOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{t('order.vat_label', '12% Hotel VAT:')}</span>
                      <span className="text-white">{currency}{activeOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1.5 border-t border-slate-800 font-bold">
                      <span className="text-white">{t('order.total_amount', 'Total Charged:')}</span>
                      <span className="font-serif text-amber-400 text-base font-black">
                        {currency}{activeOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items in order */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  {t('order.summary_heading', 'Ordered Dishes')}
                </span>
                <div className="space-y-2">
                  {activeOrder.items.map((it) => (
                    <div
                      key={it.cartItemId}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={it.item.image}
                          alt={it.item.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/food/doro-wat.jpg';
                          }}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-bold text-white block">
                            {it.quantity}x {language === 'am' && it.item.amharicName ? it.item.amharicName : it.item.name}
                          </span>
                          {it.instructions && (
                            <span className="text-[10px] text-slate-400 italic">
                              "{it.instructions}"
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-serif font-bold text-amber-400">
                        {currency}{(it.item.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracker Footer */}
            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-400">
                {language === 'am' ? 'ተጨማሪ ነገር ይፈልጋሉ? የእንግዳ ተቀባይ ክፍላችን በ24 ሰዓት ዝግጁ ነው።' : 'Need anything else? Our concierge is available 24/7.'}
              </span>
              <button
                type="button"
                onClick={closeOrderTracker}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                {t('common.done', 'Done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
