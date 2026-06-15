/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

import { createSlice } from '@reduxjs/toolkit';

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    timeZone: '',
    isLoading: false,
    reFetch: false,
    theme: {
      colorPrimary: '#af9a7d',
      colorLink: '#ececec'
    }
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    reFetchData: (state) => {
      state.reFetch = !state.reFetch;
    }
  }
});

// Action creators are generated for each case reducer function
export const { setLoading, reFetchData } = appSlice.actions;

export default appSlice.reducer;
