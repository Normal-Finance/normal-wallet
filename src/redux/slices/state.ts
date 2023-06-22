import { createSlice } from '@reduxjs/toolkit';
import { IStateState } from 'src/types/state';
import keyBy from 'lodash/keyBy';
import { Priority, TransactionStatus } from 'src/types/transaction';

// ----------------------------------------------------------------------

const initialState: IStateState = {
  loading: false,
  error: null,

  clients: 0,
  transactions: {
    NEW: 0,
    REVERTED: 0,
    PENDING: 0,
    COMPLETED: 0,
    FAILED: 0,
  },
  batches: {
    PENDING: 0,
    COMPLETED: 0,
    FAILED: 0,
  },

  billing: {
    email: '',
    paymentMethods: 0,
    failedCharges: 0,
  },

  userTransactions: {},
};

const slice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    /** BASIC */
    updateLoading(state, action) {
      state.loading = action.payload.loading;
    },
    hasError(state, action) {
      state.error = action.payload.error;
    },

    /** STATE */
    updateState(state, action) {
      const { transaction, batch } = action.payload;

      state.transactions = transaction;
      state.batches = batch;

      state.loading = false;
      state.error = null;
    },

    /** CLIENTS */
    updateClients(state, action) {
      const { clients } = action.payload;
      state.clients = clients;
    },
    incrementClients(state) {
      state.clients += 1;
    },
    decrementClients(state) {
      state.clients -= 1;
    },

    /** BILLING */
    updateBilling(state, action) {
      const { billing } = action.payload;

      state.billing = billing;

      state.loading = false;
      state.error = null;
    },
    updateEmail(state, action) {
      const { email } = action.payload;

      state.billing.email = email;
    },

    /** USER TRANSACTIONS */
    updateUserTransactions(state, action) {
      const { transactions } = action.payload;

      const keyedTransactions = keyBy(transactions, 'transactionId');
      state.userTransactions = keyedTransactions;
    },
    newTransaction(state, action) {
      const { transaction } = action.payload;

      state.userTransactions[transaction.transactionId] = transaction;
    },
    updateTransactionPriority(state, action) {
      const { transactionId } = action.payload;

      const updatedPriority =
        state.userTransactions[transactionId].priority === Priority.GTC
          ? Priority.GTC
          : Priority.INSTANT;
      state.userTransactions[transactionId].priority = updatedPriority;
    },
    cancelTransaction(state, action) {
      const { transactionId } = action.payload;

      delete state.userTransactions[transactionId];
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  updateLoading,
  hasError,
  updateState,
  updateClients,
  incrementClients,
  decrementClients,
  updateBilling,
  updateEmail,
  updateUserTransactions,
  newTransaction,
  updateTransactionPriority,
  cancelTransaction,
} = slice.actions;
