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
  name: 'wcV2',
  initialState,
  reducers: {
    updateConnections(state, action) {
      state.connections = action.payload.connections;
    },
    connectedNewSession(state, action) {
      const existingConnection = state.connections.find(
        (c: any) => c.pairingTopic === action.payload.pairingTopic
      );

      if (existingConnection) {
        const updatedConnections = state.connections.map((c: any) => {
          if (c.pairingTopic === action.payload.pairingTopic) {
            state.sessionTopics = [...c.sessionTopics, action.payload.sessionTopic];
            // return {
            //   ...c,
            //   sessionTopics: [...c.sessionTopics, connection.sessionTopic]
            // }
          } else {
            return c;
          }
        });

        state.connections = [...updatedConnections];
        // return {
        //   ...state,
        //   connections: [...updatedConnections]
        // }
      } else {
        return {
          ...state,
          connections: [
            ...state.connections,
            {
              connectionId: action.payload.pairingTopic, // rename URI of wc 1
              session: action.payload.session,
              pairingTopic: action.payload.pairingTopic,
              sessionTopics: [action.payload.sessionTopic],
              namespacedChainIds: action.payload.namespacedChainIds,
              proposerPublicKey: action.payload.proposerPublicKey,
            },
          ],
        };
      }
    },
    disconnected(state, action) {
      const filteredConnections = state.connections.filter(
        (x: any) => x.connectionId !== action.payload.connectionId
      );

      state.connections = filteredConnections;
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
