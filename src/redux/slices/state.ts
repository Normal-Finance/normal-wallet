import { createSlice, Dispatch } from '@reduxjs/toolkit';
import { IStateState } from 'src/types/state';

// ----------------------------------------------------------------------

const initialState: IStateState = {
  clients: {
    TOTAL: 0,
  },
  transactions: {
    NEW: 0,
    PENDING: 0,
    COMPLETED: 0,
  },
  batches: {
    INIT: 0,
    PENDING: 0,
    COMPLETED: 0,
  },
  appStatus: {
    loading: false,
    empty: false,
    error: null,
  },
};

const slice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    getStateSuccess(state, action) {
      const { transaction, batch } = action.payload;

      state.transactions = transaction;
      state.batches = batch;

      state.appStatus.loading = false;
      state.appStatus.error = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getStateSuccess } = slice.actions;
