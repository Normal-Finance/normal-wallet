import { combineReducers } from 'redux';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
// slices
import stateReducer from './slices/state';
import wcLegacyReducer from './slices/wcLegacy';
import wcV2Reducer from './slices/wcV2';

// ----------------------------------------------------------------------

export const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, value: any) {
    return Promise.resolve(value);
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
});

export const storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

export const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['state', 'wcLegacy', 'wcV2'],
};
export const rootReducer = combineReducers({
  state: stateReducer,
  wcLegacy: wcLegacyReducer,
  wcV2: wcV2Reducer,
});
