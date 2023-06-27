import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState: any = {
  connections: [],
};

const slice = createSlice({
  name: 'wcV2',
  initialState,
  reducers: {
    updateConnections(state, action) {
      state.connections = action.payload.connections;
    },
    // eslint-disable-next-line consistent-return
    connectedNewSession(state, action) {
      const existingConnection = state.connections.find(
        (c: any) => c.pairingTopic === action.payload.pairingTopic
      );

      if (existingConnection) {
        // eslint-disable-next-line array-callback-return, consistent-return
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
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { updateConnections, connectedNewSession, disconnected } = slice.actions;
