// src/features/products/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Har error se {status, message} nikalne ka helper
function toError(err) {
  return {
    status: err.response?.status,
    message: err.response?.data?.message || err.message || "Something went wrong",
  };
}

// ---- Thunks (routes ke mutabiq) ----
// baseURL = http://localhost:3002/api/products/
// POST   signup   -> create
// GET    ""       -> list all
// GET    :id      -> single
// PUT    :id      -> update (image optional)
// DELETE :id      -> delete

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

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`${id}`);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(toError(err));
    }
  }
);

export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (formData, { rejectWithValue }) => {
    try {
      // formData ek FormData object hona chahiye (image ke sath)
      const res = await api.post("signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.product;
    } catch (err) {
      return rejectWithValue(toError(err));
    }
  }
);

// updates: plain object (JSON, e.g. sirf stock) YA FormData (image ke sath full edit)
export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const isFormData = updates instanceof FormData;
      const res = await api.put(
        `${id}`,
        updates,
        isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
      );
      return res.data.product;
    } catch (err) {
      return rejectWithValue(toError(err));
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
      return rejectWithValue(toError(err));
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    selected: null, // single product (edit page ke liye)
    loading: false,
    selectedLoading: false,
    error: "",
  },
  reducers: {
    clearProductError: (state) => {
      state.error = "";
    },
    clearSelectedProduct: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
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
      // single (edit page)
      .addCase(fetchProductById.pending, (state) => {
        state.selectedLoading = true;
        state.error = "";
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.error = action.payload?.message;
      })
      // add
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.payload?.message;
      })
      // edit
      .addCase(editProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.error = action.payload?.message;
      })
      // remove
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.error = action.payload?.message;
      });
  },
});

export const { clearProductError, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;