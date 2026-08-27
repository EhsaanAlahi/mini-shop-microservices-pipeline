// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// ---- Thunks (aapke createProduct/getProducts/updateProduct/deleteProduct controller ke mutabiq) ----

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("");
      return res.data.products;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (formData, { rejectWithValue }) => {
    try {
      // formData ek FormData object hona chahiye agar image bhi jaa rahi hai
      const res = await api.post("", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.product;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add product"
      );
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${id}`, updates);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const removeProduct = createAsyncThunk(
  "products/removeProduct",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete product"
      );
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
      // fetch
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
        state.error = action.payload;
      })
      // add
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.payload;
      })
      // edit
      .addCase(editProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (p) => p._id === action.payload._id
        );
        if (idx !== -1) state.items[idx] = action.payload;
      })
      // remove
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;