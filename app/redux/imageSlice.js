import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_KEY = 'hT7naTtrJxHV_d_gVCZnNrvuxwc7e5HFrWS3a8U95vk';
const BASE_URL = 'https://api.unsplash.com';

export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/photos`, {
        params: {
          client_id: API_KEY,
          page,
          per_page: 10,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const searchPhotos = createAsyncThunk(
  'images/searchPhotos',
  async ({ page = 1, query }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/search/photos`, {
        params: {
          client_id: API_KEY,
          page,
          per_page: 10,
          query,
        },
      });
      return Array.isArray(response.data.results) ? response.data.results : [];
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const imageSlice = createSlice({
  name: 'images',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    page: 1,
    query: '',
    isSearching: false,
    hasMore: true,
  },
  reducers: {
    reorderImages(state, action) {
      state.items = action.payload;
    },
    setQuery(state, action) {
      state.query = action.payload;
      state.items = [];
      state.page = 1;
      state.isSearching = !!action.payload;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newItems = Array.isArray(action.payload) ? action.payload : [];
       
        const uniqueNewItems = newItems.filter(
          (newItem) => !state.items.some((existingItem) => existingItem.id === newItem.id)
        );
        state.items = [...state.items, ...uniqueNewItems];
        if (uniqueNewItems.length > 0) {
          state.page += 1;
          state.hasMore = true;
        } else {
          state.hasMore = false;
        }
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.hasMore = false;
      })
      .addCase(searchPhotos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchPhotos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newItems = Array.isArray(action.payload) ? action.payload : [];
      
        const uniqueNewItems = newItems.filter(
          (newItem) => !state.items.some((existingItem) => existingItem.id === newItem.id)
        );
        state.items = [...state.items, ...uniqueNewItems];
        if (uniqueNewItems.length > 0) {
          state.page += 1;
          state.hasMore = true;
        } else {
          state.hasMore = false;
        }
      })
      .addCase(searchPhotos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.hasMore = false;
      });
  },
});

export const { reorderImages, setQuery } = imageSlice.actions;
export default imageSlice.reducer;