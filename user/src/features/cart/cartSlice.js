// src/features/cart/cartSlice.js
//
// Guest cart — no login involved. Cart CONTENTS live only in this browser's
// localStorage (key "mini_shop_cart"). Add/increase/decrease/remove are all
// LOCAL ONLY — no backend calls, no delay, instant feedback.
//
// Stock only changes on the backend once, at CHECKOUT. That's when we walk
// the cart and PUT the new stock for each item via productSlice's
// `updateStock` thunk. If someone else bought the last one in the meantime,
// checkout catches it and stops before touching anything else.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateStock } from "../products/productSlice";

const CART_STORAGE_KEY = "mini_shop_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode, quota, etc.) — fail silently
  }
}

const initialState = {
  items: loadCart(), // [{ _id, name, price, image, qty }]
  isOpen: false,
  checkingOut: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // payload: { product, maxStock }
    addItem: (state, action) => {
      const { product, maxStock } = action.payload;
      const existing = state.items.find((i) => i._id === product._id);
      const currentQty = existing ? existing.qty : 0;
      if (currentQty >= maxStock) return; // already holding all available stock

      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({
          _id: product._id,
          name: product.name || product.title,
          price: Number(product.price ?? product.cost ?? 0),
          image: product.image || product.imageUrl || null,
          qty: 1,
        });
      }
      state.isOpen = true;
      saveCart(state.items);
    },
    // payload: { id, maxStock }
    increaseQty: (state, action) => {
      const { id, maxStock } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item && item.qty < maxStock) {
        item.qty += 1;
        saveCart(state.items);
      }
    },
    // payload: id
    decreaseQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) {
          state.items = state.items.filter((i) => i._id !== item._id);
        }
        saveCart(state.items);
      }
    },
    // payload: id
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      saveCart(state.items);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.checkingOut = true;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.checkingOut = false;
        state.items = [];
        saveCart(state.items);
        state.isOpen = false;
      })
      .addCase(checkout.rejected, (state) => {
        state.checkingOut = false;
      });
  },
});

// The ONLY place cart actions touch the backend. Walks the cart in order
// and decrements stock for each item one at a time (not Promise.all — we
// want to stop immediately if one item runs out, not fire every request
// regardless). Re-reads live stock right before each update so a stock
// change that happened after the item was added to the cart is caught.
export const checkout = createAsyncThunk(
  "cart/checkout",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const items = getState().cart.items;
    if (items.length === 0) return rejectWithValue("Your cart is empty");

    for (const item of items) {
      const live = getState().products.items.find((p) => p._id === item._id);
      const currentStock = Number(live?.stock ?? live?.quantity ?? 0);

      if (currentStock < item.qty) {
        return rejectWithValue(
          `Only ${currentStock} left of "${item.name}" — please adjust your cart`
        );
      }

      try {
        await dispatch(
          updateStock({ id: item._id, stock: currentStock - item.qty })
        ).unwrap();
      } catch {
        return rejectWithValue(`Couldn't update stock for "${item.name}"`);
      }
    }

    return true;
  }
);

export const {
  addItem,
  increaseQty,
  decreaseQty,
  removeItem,
  toggleCart,
  openCart,
  closeCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty * i.price, 0);