import type {
  CartItem,
  FoodOrderItemSnapshot,
  MenuItem,
  Restaurant,
  RestaurantCart,
} from '../types';

export type CartOrderMode = 'Pre-Order Advance' | 'Order at Restaurant';

export interface CartOrderTotals {
  distinctItemsCount: number;
  totalQuantity: number;
  totalFoodAmount: number;
  additionalCharges: 0;
  advancePercent: number;
  advanceAmount: number;
  remainingAmount: number;
}

export type AddCartCheckResult =
  | { allowed: true }
  | { allowed: false; reason: 'unavailable' | 'restaurant_mismatch' | 'different_restaurant' };

export function checkAddMenuItemToCart(
  cart: RestaurantCart | null,
  restaurant: Pick<Restaurant, 'id'>,
  item: Pick<MenuItem, 'available' | 'restaurantId'>
): AddCartCheckResult {
  if (!item.available) {
    return { allowed: false, reason: 'unavailable' };
  }
  if (item.restaurantId !== restaurant.id) {
    return { allowed: false, reason: 'restaurant_mismatch' };
  }
  if (cart && cart.restaurantId !== restaurant.id && cart.items.length > 0) {
    return { allowed: false, reason: 'different_restaurant' };
  }
  return { allowed: true };
}

export function addItemToRestaurantCart(
  cart: RestaurantCart | null,
  restaurant: Pick<Restaurant, 'id' | 'name'>,
  item: MenuItem,
  forceReplace = false
): RestaurantCart {
  if (!item.available) {
    throw new Error('This dish is currently unavailable.');
  }
  if (item.restaurantId !== restaurant.id) {
    throw new Error('Menu item does not belong to the selected restaurant.');
  }

  const baseItems: CartItem[] =
    !cart || forceReplace || cart.restaurantId !== restaurant.id ? [] : [...cart.items];

  const existingIdx = baseItems.findIndex((c) => c.menuItemId === item.id);
  if (existingIdx >= 0) {
    baseItems[existingIdx] = {
      ...baseItems[existingIdx],
      price: item.price,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      quantity: baseItems[existingIdx].quantity + 1,
    };
  } else {
    baseItems.push({
      menuItemId: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      dietaryType: item.dietaryType,
      imageUrl: item.imageUrl,
      quantity: 1,
    });
  }

  return {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    items: baseItems,
  };
}

export function updateCartQuantity(
  cart: RestaurantCart | null,
  menuItemId: string,
  delta: number
): RestaurantCart | null {
  if (!cart) return null;
  const updatedItems = cart.items
    .map((item) =>
      item.menuItemId === menuItemId
        ? { ...item, quantity: item.quantity + delta }
        : item
    )
    .filter((item) => item.quantity > 0);

  if (updatedItems.length === 0) {
    return null;
  }

  return {
    ...cart,
    items: updatedItems,
  };
}

export function removeCartItem(
  cart: RestaurantCart | null,
  menuItemId: string
): RestaurantCart | null {
  if (!cart) return null;
  const remaining = cart.items.filter((item) => item.menuItemId !== menuItemId);
  return remaining.length === 0 ? null : { ...cart, items: remaining };
}

export function calculateCartOrderTotals(
  items: Pick<CartItem, 'price' | 'quantity'>[],
  restaurantAdvancePercent: number,
  orderMode: CartOrderMode
): CartOrderTotals {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalFoodAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const effectiveAdvancePercent =
    orderMode === 'Order at Restaurant'
      ? 0
      : Math.min(100, Math.max(0, Math.round(restaurantAdvancePercent)));
  const advanceAmount =
    orderMode === 'Order at Restaurant'
      ? 0
      : Math.round((totalFoodAmount * effectiveAdvancePercent) / 100);
  const remainingAmount = Math.max(0, totalFoodAmount - advanceAmount);

  return {
    distinctItemsCount: items.length,
    totalQuantity,
    totalFoodAmount,
    additionalCharges: 0,
    advancePercent: effectiveAdvancePercent,
    advanceAmount,
    remainingAmount,
  };
}

export function buildOrderItemSnapshots(
  cartItems: CartItem[],
  catalog: MenuItem[],
  restaurantId: string
): FoodOrderItemSnapshot[] {
  return cartItems.map((ci, idx) => {
    const liveItem = catalog.find(
      (m) => m.id === ci.menuItemId && m.restaurantId === restaurantId
    );
    if (!liveItem) {
      throw new Error(`"${ci.name}" is no longer on this restaurant's menu.`);
    }
    if (!liveItem.available) {
      throw new Error(`"${liveItem.name}" is currently unavailable. Please remove it from your cart.`);
    }
    const unitPrice = liveItem.price;
    return {
      id: `foi-${Date.now()}-${idx}`,
      menuItemId: liveItem.id,
      itemName: liveItem.name,
      itemDescription: liveItem.description,
      category: liveItem.category,
      dietaryType: liveItem.dietaryType,
      imageUrl: liveItem.imageUrl,
      unitPrice,
      quantity: ci.quantity,
      subtotal: unitPrice * ci.quantity,
    };
  });
}
