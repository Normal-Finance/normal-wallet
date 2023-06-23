import { createSlice } from '@reduxjs/toolkit';
import { IStateState } from 'src/types/state';
import { TransactionPriority } from 'src/types/transaction';

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

  autoBatchEnabled: true,

  userTransactions: [],
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

    /** CONFIGURATION/SETTINGS */
    updateAutoBatchEnabled(state) {
      state.autoBatchEnabled = !state.autoBatchEnabled;
    },

    /** USER TRANSACTIONS */
    updateUserTransactions(state, action) {
      const { transactions } = action.payload;

      state.userTransactions = transactions;
    },
    newTransaction(state, action) {
      const { transaction } = action.payload;

      state.userTransactions = [...state.userTransactions, transaction];
    },
    updateTransactionPriority(state, action) {
      const { transactionId } = action.payload;

      const foundIndex = state.userTransactions.findIndex((x) => x.transactionId === transactionId);
      const isGTC = state.userTransactions[foundIndex].priority === TransactionPriority.GTC;
      state.userTransactions[foundIndex].priority = isGTC
        ? TransactionPriority.INSTANT
        : TransactionPriority.GTC;
    },
    cancelTransaction(state, action) {
      const { transactionId } = action.payload;

      state.userTransactions = state.userTransactions.filter(
        (transaction) => transaction.transactionId !== transactionId
      );
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
  updateAutoBatchEnabled,
  updateTransactionPriority,
  cancelTransaction,
} = slice.actions;
