import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState: any = {
  connections: [],
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
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { updateConnections, connectedNewSession, disconnected } = slice.actions;
