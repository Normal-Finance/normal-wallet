// import sum from 'lodash/sum';
// import uniq from 'lodash/uniq';
// import uniqBy from 'lodash/uniqBy';
import { createSlice, Dispatch } from '@reduxjs/toolkit';
// utils
// import axios, { API_ENDPOINTS } from 'src/utils/axios';
// import { IStateState } from 'src/types/state';

// ----------------------------------------------------------------------

const initialState: any = {
  connections: [],
  requests: [],
};

const slice = createSlice({
  name: 'wcLegacy',
  initialState,
  reducers: {
    updateConnections(state, action) {
      state.connections = action.payload.connections;
    },
    connectedNewSession(state, action) {
      state.connections = [
        ...state.connections,
        {
          connectionId: action.payload.connectionId,
          session: action.payload.session,
          isOffline: false,
        },
      ];
    },
    disconnected(state, action) {
      state.connections = state.connections.filter(
        (x: any) => x.connectionId !== action.payload.connectionId
      );
    },
    batchRequestsAdded(state, action) {
      if (state.requests.find(({ id }: any) => id === action.payload.batchRequest.id + ':0'))
        return;

      const newRequests = [];
      for (let ix in action.payload.batchRequest.txns) {
        if (action.payload.batchRequest.txns[ix].to || action.payload.batchRequest.txns[ix].data) {
          newRequests.push({
            ...action.payload.batchRequest,
            type: 'eth_sendTransaction',
            dateAdded: new Date().valueOf(),
            isBatch: true,
            id: action.payload.batchRequest.id + ':' + ix,
            account: action.payload.account,
            txn: {
              ...action.payload.batchRequest.txns[ix],
              from: action.payload.account,
            },
          });
        }
      }

      state.requests = [...state.requests, ...newRequests];
    },
    requestAdded(state, action) {
      if (state.requests.find(({ id }: any) => id === action.payload.request.id)) return;
      else state.requests = [...state.requests, action.payload.request];
    },
    requestsResolved(state, action) {
      state.requests = state.requests.filter((x: any) => !action.payload.ids.includes(x.id));
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  updateConnections,
  connectedNewSession,
  disconnected,
  batchRequestsAdded,
  requestAdded,
  requestsResolved,
} = slice.actions;

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
