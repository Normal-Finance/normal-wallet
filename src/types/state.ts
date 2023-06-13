import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type IClients = {
  TOTAL: number;
};

export type ITransactions = {
  NEW: number;
  PENDING: number;
  COMPLETED: number;
};

export type IBatches = {
  INIT: number;
  PENDING: number;
  COMPLETED: number;
};

export type IStateState = {
  clients: IClients;
  transactions: ITransactions;
  batches: IBatches;
  appStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
};
