import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type IConnections = {
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
  connections: IConnections;
  transactions: ITransactions;
  batches: IBatches;
  appStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
};
