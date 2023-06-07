// import sum from 'lodash/sum';
// import uniq from 'lodash/uniq';
// import uniqBy from 'lodash/uniqBy';
import { createSlice, Dispatch } from '@reduxjs/toolkit';
// utils
// import axios, { API_ENDPOINTS } from 'src/utils/axios';
import { IStateState } from 'src/types/state';

// ----------------------------------------------------------------------

const initialState: IStateState = {
  transaction: {
    NEW: 0,
    PENDING: 0,
    COMPLETED: 0,
  },
  batch: {
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

      state.transaction = transaction;
      state.batch = batch;

      state.appStatus.loading = false;
      state.appStatus.error = null;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { getStateSuccess } = slice.actions;

// ----------------------------------------------------------------------

// export function getProducts() {
//   return async (dispatch: Dispatch) => {
//     dispatch(slice.actions.getProductsStart());
//     try {
//       const response = await axios.get(API_ENDPOINTS.product.list);
//       dispatch(slice.actions.getProductsSuccess(response.data.products));
//     } catch (error) {
//       dispatch(slice.actions.getProductsFailure(error));
//     }
//   };
// }
