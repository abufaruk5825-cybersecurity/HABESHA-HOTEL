export interface FoodMenuItem {
  id: string;
  name: string;
  amharicName?: string;
  category: 'traditional' | 'breakfast' | 'lunch' | 'dinner' | 'cultural' | 'drinks' | 'desserts';
  price: number;
  image: string;
  description: string;
  ingredients: string;
  badge?: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  servingTime?: string;
  pairing?: string;
}

export interface CartItem {
  cartItemId: string;
  item: FoodMenuItem;
  quantity: number;
  instructions: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

export interface PlacedOrder {
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  statusUpdatedAt: string;
  diningType: 'room_delivery' | 'restaurant_dining';
  roomOrTableNumber: string;
  guestName: string;
  guestPhone: string;
  specialNotes?: string;
  paymentMethod: 'room_folio' | 'cash' | 'telebirr';
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  estimatedMinutes: number;
}

