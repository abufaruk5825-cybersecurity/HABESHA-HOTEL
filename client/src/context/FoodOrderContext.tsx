import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { FoodMenuItem, CartItem, OrderStatus, PlacedOrder } from '../types/food';

interface FoodOrderContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeItemForDetails: FoodMenuItem | null;
  setActiveItemForDetails: (item: FoodMenuItem | null) => void;
  openItemDetails: (item: FoodMenuItem) => void;
  addToCart: (item: FoodMenuItem, quantity?: number, instructions?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  activeOrder: PlacedOrder | null;
  setActiveOrder: (order: PlacedOrder | null) => void;
  placeOrder: (data: {
    diningType: 'room_delivery' | 'restaurant_dining';
    roomOrTableNumber: string;
    guestName: string;
    guestPhone: string;
    specialNotes?: string;
    paymentMethod: 'room_folio' | 'cash' | 'telebirr';
  }) => PlacedOrder;
  advanceOrderStatus: (nextStatus?: OrderStatus) => void;
  closeOrderTracker: () => void;
}

const FoodOrderContext = createContext<FoodOrderContextType | undefined>(undefined);

const TAX_RATE = 0.12; // 12% Hotel VAT

export const FoodOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('habesha_food_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeItemForDetails, setActiveItemForDetails] = useState<FoodMenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<PlacedOrder | null>(() => {
    try {
      const saved = localStorage.getItem('habesha_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('habesha_food_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save active order to local storage
  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem('habesha_active_order', JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem('habesha_active_order');
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeOrder]);

  // Real-time automatic stage progression for demo/live tracking
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;

    const stages: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const currentIndex = stages.indexOf(activeOrder.status);

    if (currentIndex < stages.length - 1) {
      const timer = setTimeout(() => {
        const next = stages[currentIndex + 1];
        setActiveOrder(prev => prev ? {
          ...prev,
          status: next,
          statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : null);
      }, 7000); // Advances stage every 7 seconds automatically

      return () => clearTimeout(timer);
    }
  }, [activeOrder?.status]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return Number(cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0).toFixed(2));
  }, [cart]);

  const cartTax = useMemo(() => {
    return Number((cartSubtotal * TAX_RATE).toFixed(2));
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return Number((cartSubtotal + cartTax).toFixed(2));
  }, [cartSubtotal, cartTax]);

  const openItemDetails = (item: FoodMenuItem) => {
    setActiveItemForDetails(item);
  };

  const addToCart = (item: FoodMenuItem, quantity = 1, instructions = '') => {
    setCart(prev => {
      const cleanInstructions = instructions.trim();
      const existingIndex = prev.findIndex(
        ci => ci.item.id === item.id && ci.instructions === cleanInstructions
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          item,
          quantity,
          instructions: cleanInstructions,
        },
      ];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(ci => {
          if (ci.cartItemId === cartItemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(ci => ci.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (data: {
    diningType: 'room_delivery' | 'restaurant_dining';
    roomOrTableNumber: string;
    guestName: string;
    guestPhone: string;
    specialNotes?: string;
    paymentMethod: 'room_folio' | 'cash' | 'telebirr';
  }): PlacedOrder => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FD-${new Date().getFullYear()}-${randomSuffix}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: PlacedOrder = {
      orderNumber,
      createdAt: nowTime,
      status: 'pending',
      statusUpdatedAt: nowTime,
      diningType: data.diningType,
      roomOrTableNumber: data.roomOrTableNumber.trim(),
      guestName: data.guestName.trim(),
      guestPhone: data.guestPhone.trim(),
      specialNotes: data.specialNotes?.trim(),
      paymentMethod: data.paymentMethod,
      items: [...cart],
      subtotal: cartSubtotal,
      taxAmount: cartTax,
      deliveryFee: 0,
      totalAmount: cartTotal,
      estimatedMinutes: 25,
    };

    setActiveOrder(newOrder);
    setCart([]); // Clear cart upon placing order
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    return newOrder;
  };

  const advanceOrderStatus = (forcedStatus?: OrderStatus) => {
    if (!activeOrder) return;
    const stages: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    if (forcedStatus) {
      setActiveOrder({
        ...activeOrder,
        status: forcedStatus,
        statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }
    const currentIndex = stages.indexOf(activeOrder.status);
    if (currentIndex < stages.length - 1) {
      setActiveOrder({
        ...activeOrder,
        status: stages[currentIndex + 1],
        statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  };

  const closeOrderTracker = () => {
    setActiveOrder(null);
  };

  return (
    <FoodOrderContext.Provider
      value={{
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
        openItemDetails,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        activeOrder,
        setActiveOrder,
        placeOrder,
        advanceOrderStatus,
        closeOrderTracker,
      }}
    >
      {children}
    </FoodOrderContext.Provider>
  );
};

export const useFoodOrder = (): FoodOrderContextType => {
  const context = useContext(FoodOrderContext);
  if (!context) {
    throw new Error('useFoodOrder must be used within a FoodOrderProvider');
  }
  return context;
};

