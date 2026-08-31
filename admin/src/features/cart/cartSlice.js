// src/features/cart/cartSlice.js
//
// Guest cart — no login involved. Cart CONTENTS live only in this browser's
// localStorage (key "mini_shop_cart"), so there's nothing to build on the
// backend for the cart itself. The one thing that DOES need to hit the
// backend is product `stock`, since that's shared across every visitor —
// so every add/increase/decrease/remove also calls the existing
// editProduct thunk (PUT /api/products/:id) to keep real inventory correct.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { editProduct } from "../products/productSlice";

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
    // items may be an Immer draft; JSON.stringify reads through it fine.
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode, quota, etc.) — fail silently
  }
}

const initialState = {
  items: loadCart(), // [{ _id, name, price, image, qty }]
  isOpen: false,
};

function getStockOf(state, productId) {
  const live = state.products.items.find((p) => p._id === productId);
  return Number(live?.stock ?? live?.quantity ?? 0);
}

// ---- Thunks: cart action + backend stock sync, together ----

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { getState, dispatch, rejectWithValue }) => {
    const currentStock = getStockOf(getState(), product._id) || Number(product.stock ?? product.quantity ?? 0);

    if (currentStock <= 0) {
      toast.error(`${product.name || product.title} is out of stock`);
      return rejectWithValue("out-of-stock");
    }

    try {
      await dispatch(
        editProduct({ id: product._id, updates: { stock: currentStock - 1 } })
      ).unwrap();
    } catch (err) {
      toast.error("Couldn't update stock, please try again");
      return rejectWithValue(err);
    }

    toast.success(`${product.name || product.title} added to cart`);
    return { product };
  }
);

export const increaseCartQty = createAsyncThunk(
  "cart/increaseCartQty",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const currentStock = getStockOf(getState(), productId);

    if (currentStock <= 0) {
      toast.error("No more stock available");
      return rejectWithValue("out-of-stock");
    }

    try {
      await dispatch(
        editProduct({ id: productId, updates: { stock: currentStock - 1 } })
      ).unwrap();
    } catch (err) {
      toast.error("Couldn't update stock, please try again");
      return rejectWithValue(err);
    }

    return { productId };
  }
);

export const decreaseCartQty = createAsyncThunk(
  "cart/decreaseCartQty",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const currentStock = getStockOf(getState(), productId);

    try {
      await dispatch(
        editProduct({ id: productId, updates: { stock: currentStock + 1 } })
      ).unwrap();
    } catch (err) {
      toast.error("Couldn't update stock, please try again");
      return rejectWithValue(err);
    }

    return { productId };
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const item = state.cart.items.find((i) => i._id === productId);
    const currentStock = getStockOf(state, productId);
    const qty = item?.qty || 0;

    try {
      await dispatch(
        editProduct({ id: productId, updates: { stock: currentStock + qty } })
      ).unwrap();
    } catch (err) {
      toast.error("Couldn't update stock, please try again");
      return rejectWithValue(err);
    }

    return { productId };
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
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
      .addCase(addToCart.fulfilled, (state, action) => {
        const { product } = action.payload;
        const existing = state.items.find((i) => i._id === product._id);
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
      })
      .addCase(increaseCartQty.fulfilled, (state, action) => {
        const item = state.items.find((i) => i._id === action.payload.productId);
        if (item) item.qty += 1;
        saveCart(state.items);
      })
      .addCase(decreaseCartQty.fulfilled, (state, action) => {
        const item = state.items.find((i) => i._id === action.payload.productId);
        if (item) {
          item.qty -= 1;
          if (item.qty <= 0) {
            state.items = state.items.filter((i) => i._id !== item._id);
          }
        }
        saveCart(state.items);
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload.productId);
        saveCart(state.items);
      });
  },
});

export const { toggleCart, openCart, closeCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty * i.price, 0);