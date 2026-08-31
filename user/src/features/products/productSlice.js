// src/features/products/productSlice.js
//
// The user app never creates/deletes/fully-edits products — that's the
// admin app's job. This slice only fetches the catalog and exposes a
// narrow `updateStock` thunk (used exclusively by the cart) that PUTs
// just the `stock` field.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

function toError(err) {
  return {
    status: err.response?.status,
    message: err.response?.data?.message || err.message || "Something went wrong",
  };
}

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("");
      return res.data.products;
    } catch (err) {
      return rejectWithValue(toError(err));
    }
  }
);

// IMPORTANT: if your backend's PUT /api/products/:id route requires an
// admin auth token, this call will fail with 401 for guest shoppers.
// Either make that route accept unauthenticated stock-only updates, or
// add a separate public endpoint (e.g. PATCH /api/products/:id/stock)
// and point this thunk at it instead.
export const updateStock = createAsyncThunk(
  "products/updateStock",
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${id}`, { stock });
      return res.data.product;
    } catch (err) {
      return rejectWithValue(toError(err));
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: "",
  },
  reducers: {
    clearProductError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.error = action.payload?.message;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;